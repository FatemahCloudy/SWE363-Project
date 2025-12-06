import SharedMemoryGroup from '../models/SharedMemoryGroup.js';
import CollaborativeMemory from '../models/CollaborativeMemory.js';
import Memory from '../models/Memory.js';
import Follow from '../models/Follow.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const createSharedMemory = async (req, res) => {
    try {
        const userId = req.user._id;
        const {
            title,
            description,
            imageUrl,
            category,
            privacy,
            location,
            locationAddress,
            latitude,
            longitude,
            tags,
            eventName,
            eventDate,
            groupTitle,
            groupDescription,
            collaboratorIds,
            groupPrivacy
        } = req.body;

        if (!collaboratorIds || collaboratorIds.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'At least one collaborator must be selected for a shared memory'
            });
        }

        const validCollaborators = [];
        for (const collabId of collaboratorIds) {
            const isFollowing = await Follow.findOne({
                followerId: userId,
                followingId: collabId
            });
            const isFollowedBy = await Follow.findOne({
                followerId: collabId,
                followingId: userId
            });

            if (isFollowing || isFollowedBy) {
                validCollaborators.push(collabId);
            }
        }

        if (validCollaborators.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'You can only invite friends (people you follow or who follow you)'
            });
        }

        if (validCollaborators.length !== collaboratorIds.length) {
            const invalidCount = collaboratorIds.length - validCollaborators.length;
            console.log(`Note: ${invalidCount} collaborator(s) were not friends and were not invited`);
        }

        const memory = await Memory.create({
            userId,
            title,
            description,
            imageUrl,
            category: category || 'other',
            privacy: privacy || 'public',
            location,
            locationAddress,
            latitude,
            longitude,
            tags: tags || [],
            eventName,
            eventDate: eventDate ? new Date(eventDate) : undefined,
            isCollaborative: true,
            isGroupHost: true,
            collaboratorIds: []
        });

        const sharedGroup = await SharedMemoryGroup.create({
            title: groupTitle || title,
            description: groupDescription || description,
            hostMemoryId: memory._id,
            ownerId: userId,
            location,
            locationAddress,
            latitude,
            longitude,
            eventName,
            eventDate: eventDate ? new Date(eventDate) : undefined,
            privacy: groupPrivacy || 'collaborators_only',
            invitedUsers: validCollaborators.map(id => ({
                userId: id,
                status: 'pending',
                invitedAt: new Date()
            })),
            contributors: [userId],
            contributorCount: 1,
            entryCount: 1,
            coverImageUrl: imageUrl
        });

        memory.sharedGroupId = sharedGroup._id;
        await memory.save();

        for (const collabId of validCollaborators) {
            await Notification.create({
                userId: collabId,
                type: 'collaboration_invite',
                message: `${req.user.username} invited you to contribute to "${groupTitle || title}"`,
                fromUserId: userId,
                memoryId: memory._id,
                metadata: {
                    groupId: sharedGroup._id,
                    groupTitle: groupTitle || title
                }
            });
        }

        const populatedMemory = await Memory.findById(memory._id)
            .populate('userId', 'username fullName avatarUrl')
            .populate('collaboratorIds', 'username fullName avatarUrl');

        const populatedGroup = await SharedMemoryGroup.findById(sharedGroup._id)
            .populate('ownerId', 'username fullName avatarUrl')
            .populate('invitedUsers.userId', 'username fullName avatarUrl')
            .populate('contributors', 'username fullName avatarUrl');

        res.status(201).json({
            success: true,
            data: {
                memory: populatedMemory,
                group: populatedGroup
            }
        });
    } catch (error) {
        console.error('Create shared memory error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export const respondToInvitation = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId } = req.params;
        const { response } = req.body;

        if (!['accept', 'decline'].includes(response)) {
            return res.status(400).json({
                success: false,
                error: 'Response must be "accept" or "decline"'
            });
        }

        const group = await SharedMemoryGroup.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                error: 'Shared memory group not found'
            });
        }

        const invitation = group.invitedUsers.find(
            inv => inv.userId.toString() === userId.toString()
        );

        if (!invitation) {
            return res.status(404).json({
                success: false,
                error: 'You have not been invited to this group'
            });
        }

        if (invitation.status !== 'pending') {
            return res.status(400).json({
                success: false,
                error: `You have already ${invitation.status} this invitation`
            });
        }

        invitation.status = response === 'accept' ? 'accepted' : 'declined';
        invitation.respondedAt = new Date();

        if (response === 'accept') {
            if (!group.contributors.includes(userId)) {
                group.contributors.push(userId);
                group.contributorCount = group.contributors.length;
            }

            await Memory.findByIdAndUpdate(group.hostMemoryId, {
                $addToSet: { collaboratorIds: userId }
            });
        }

        await group.save();

        await Notification.create({
            userId: group.ownerId,
            type: 'collaboration_response',
            message: `${req.user.username} ${response === 'accept' ? 'accepted' : 'declined'} your invitation to "${group.title}"`,
            fromUserId: userId,
            memoryId: group.hostMemoryId,
            metadata: {
                groupId: group._id,
                response
            }
        });

        res.json({
            success: true,
            message: `Invitation ${response === 'accept' ? 'accepted' : 'declined'} successfully`,
            data: {
                status: invitation.status,
                isContributor: response === 'accept'
            }
        });
    } catch (error) {
        console.error('Respond to invitation error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export const addCollaborativeEntry = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId } = req.params;
        const {
            title,
            content,
            imageUrl,
            mediaUrls,
            perspective,
            mood,
            visibility
        } = req.body;

        const group = await SharedMemoryGroup.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                error: 'Shared memory group not found'
            });
        }

        if (!group.canContribute(userId)) {
            return res.status(403).json({
                success: false,
                error: 'You are not authorized to contribute to this group'
            });
        }

        const existingEntry = await CollaborativeMemory.findOne({
            groupId,
            authorId: userId
        });

        if (existingEntry) {
            return res.status(400).json({
                success: false,
                error: 'You have already added your memory to this group. You can edit your existing entry instead.'
            });
        }

        const entry = await CollaborativeMemory.create({
            groupId,
            authorId: userId,
            title,
            content,
            imageUrl,
            mediaUrls: mediaUrls || [],
            perspective,
            mood,
            visibility: visibility || 'published',
            order: group.entryCount
        });

        group.entryCount += 1;
        await group.save();

        const contributors = group.contributors.filter(
            c => c.toString() !== userId.toString()
        );
        contributors.push(group.ownerId);

        for (const contributorId of contributors) {
            if (contributorId.toString() !== userId.toString()) {
                await Notification.create({
                    userId: contributorId,
                    type: 'new_collaboration_entry',
                    message: `${req.user.username} added their memory to "${group.title}"`,
                    fromUserId: userId,
                    memoryId: group.hostMemoryId,
                    metadata: {
                        groupId: group._id,
                        entryId: entry._id
                    }
                });
            }
        }

        const populatedEntry = await CollaborativeMemory.findById(entry._id)
            .populate('authorId', 'username fullName avatarUrl');

        res.status(201).json({
            success: true,
            data: populatedEntry
        });
    } catch (error) {
        console.error('Add collaborative entry error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export const updateCollaborativeEntry = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId, entryId } = req.params;
        const updates = req.body;

        const entry = await CollaborativeMemory.findOne({
            _id: entryId,
            groupId
        });

        if (!entry) {
            return res.status(404).json({
                success: false,
                error: 'Entry not found'
            });
        }

        if (!entry.isAuthor(userId)) {
            return res.status(403).json({
                success: false,
                error: 'You can only edit your own entry'
            });
        }

        const allowedUpdates = ['title', 'content', 'imageUrl', 'mediaUrls', 'perspective', 'mood', 'visibility'];
        Object.keys(updates).forEach(key => {
            if (allowedUpdates.includes(key)) {
                entry[key] = updates[key];
            }
        });

        await entry.save();

        const populatedEntry = await CollaborativeMemory.findById(entry._id)
            .populate('authorId', 'username fullName avatarUrl');

        res.json({
            success: true,
            data: populatedEntry
        });
    } catch (error) {
        console.error('Update collaborative entry error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export const deleteCollaborativeEntry = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId, entryId } = req.params;

        const group = await SharedMemoryGroup.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                error: 'Group not found'
            });
        }

        const entry = await CollaborativeMemory.findOne({
            _id: entryId,
            groupId
        });

        if (!entry) {
            return res.status(404).json({
                success: false,
                error: 'Entry not found'
            });
        }

        const isAuthor = entry.isAuthor(userId);
        const isOwner = group.isOwner(userId);

        if (!isAuthor && !isOwner) {
            return res.status(403).json({
                success: false,
                error: 'You can only delete your own entry'
            });
        }

        await CollaborativeMemory.findByIdAndDelete(entryId);

        group.entryCount = Math.max(0, group.entryCount - 1);
        await group.save();

        res.json({
            success: true,
            message: 'Entry deleted successfully'
        });
    } catch (error) {
        console.error('Delete collaborative entry error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export const getSharedGroup = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId } = req.params;

        const group = await SharedMemoryGroup.findById(groupId)
            .populate('ownerId', 'username fullName avatarUrl')
            .populate('hostMemoryId')
            .populate('invitedUsers.userId', 'username fullName avatarUrl')
            .populate('contributors', 'username fullName avatarUrl');

        if (!group) {
            return res.status(404).json({
                success: false,
                error: 'Shared memory group not found'
            });
        }

        const canView = await group.canView(userId, Follow);
        if (!canView) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to view this group'
            });
        }

        const entries = await CollaborativeMemory.find({
            groupId,
            visibility: 'published'
        })
            .populate('authorId', 'username fullName avatarUrl')
            .sort({ order: 1, createdAt: 1 });

        res.json({
            success: true,
            data: {
                group,
                entries,
                isOwner: group.isOwner(userId),
                isContributor: group.isContributor(userId),
                canContribute: group.canContribute(userId)
            }
        });
    } catch (error) {
        console.error('Get shared group error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export const getGroupEntries = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId } = req.params;

        const group = await SharedMemoryGroup.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                error: 'Group not found'
            });
        }

        const canViewGroup = await group.canView(userId, Follow);
        if (!canViewGroup) {
            return res.status(403).json({
                success: false,
                error: 'You do not have permission to view this group'
            });
        }

        const entries = await CollaborativeMemory.getEntriesForGroup(groupId, {
            visibility: group.isOwner(userId) ? 'all' : 'published'
        });

        res.json({
            success: true,
            count: entries.length,
            data: entries
        });
    } catch (error) {
        console.error('Get group entries error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export const getMySharedGroups = async (req, res) => {
    try {
        const userId = req.user._id;

        const ownedGroups = await SharedMemoryGroup.find({ ownerId: userId })
            .populate('hostMemoryId', 'title imageUrl')
            .populate('contributors', 'username fullName avatarUrl')
            .sort({ createdAt: -1 });

        const contributingGroups = await SharedMemoryGroup.find({
            contributors: userId,
            ownerId: { $ne: userId }
        })
            .populate('ownerId', 'username fullName avatarUrl')
            .populate('hostMemoryId', 'title imageUrl')
            .sort({ createdAt: -1 });

        const pendingInvitations = await SharedMemoryGroup.find({
            'invitedUsers': {
                $elemMatch: {
                    userId: userId,
                    status: 'pending'
                }
            }
        })
            .populate('ownerId', 'username fullName avatarUrl')
            .populate('hostMemoryId', 'title imageUrl')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            data: {
                owned: ownedGroups,
                contributing: contributingGroups,
                pendingInvitations
            }
        });
    } catch (error) {
        console.error('Get my shared groups error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export const inviteCollaborator = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId } = req.params;
        const { collaboratorId } = req.body;

        const group = await SharedMemoryGroup.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                error: 'Group not found'
            });
        }

        if (!group.isOwner(userId)) {
            return res.status(403).json({
                success: false,
                error: 'Only the group owner can invite collaborators'
            });
        }

        const alreadyInvited = group.invitedUsers.find(
            inv => inv.userId.toString() === collaboratorId.toString()
        );

        if (alreadyInvited) {
            return res.status(400).json({
                success: false,
                error: 'User has already been invited'
            });
        }

        const isFollowing = await Follow.findOne({
            followerId: userId,
            followingId: collaboratorId
        });
        const isFollowedBy = await Follow.findOne({
            followerId: collaboratorId,
            followingId: userId
        });

        if (!isFollowing && !isFollowedBy) {
            return res.status(400).json({
                success: false,
                error: 'You can only invite friends (people you follow or who follow you)'
            });
        }

        group.invitedUsers.push({
            userId: collaboratorId,
            status: 'pending',
            invitedAt: new Date()
        });

        await group.save();

        await Notification.create({
            userId: collaboratorId,
            type: 'collaboration_invite',
            message: `${req.user.username} invited you to contribute to "${group.title}"`,
            fromUserId: userId,
            memoryId: group.hostMemoryId,
            metadata: {
                groupId: group._id,
                groupTitle: group.title
            }
        });

        res.json({
            success: true,
            message: 'Invitation sent successfully'
        });
    } catch (error) {
        console.error('Invite collaborator error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export const removeCollaborator = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId, collaboratorId } = req.params;

        const group = await SharedMemoryGroup.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                error: 'Group not found'
            });
        }

        if (!group.isOwner(userId)) {
            return res.status(403).json({
                success: false,
                error: 'Only the group owner can remove collaborators'
            });
        }

        if (collaboratorId === userId.toString()) {
            return res.status(400).json({
                success: false,
                error: 'You cannot remove yourself as the owner'
            });
        }

        group.invitedUsers = group.invitedUsers.filter(
            inv => inv.userId.toString() !== collaboratorId
        );

        group.contributors = group.contributors.filter(
            c => c.toString() !== collaboratorId
        );
        group.contributorCount = group.contributors.length;

        await group.save();

        await Memory.findByIdAndUpdate(group.hostMemoryId, {
            $pull: { collaboratorIds: collaboratorId }
        });

        await CollaborativeMemory.deleteMany({
            groupId,
            authorId: collaboratorId
        });

        res.json({
            success: true,
            message: 'Collaborator removed successfully'
        });
    } catch (error) {
        console.error('Remove collaborator error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export const updateGroupSettings = async (req, res) => {
    try {
        const userId = req.user._id;
        const { groupId } = req.params;
        const { status, allowNewContributions, privacy, title, description } = req.body;

        const group = await SharedMemoryGroup.findById(groupId);

        if (!group) {
            return res.status(404).json({
                success: false,
                error: 'Group not found'
            });
        }

        if (!group.isOwner(userId)) {
            return res.status(403).json({
                success: false,
                error: 'Only the group owner can update settings'
            });
        }

        if (status) group.status = status;
        if (typeof allowNewContributions === 'boolean') {
            group.allowNewContributions = allowNewContributions;
        }
        if (privacy) group.privacy = privacy;
        if (title) group.title = title;
        if (description !== undefined) group.description = description;

        await group.save();

        res.json({
            success: true,
            data: group
        });
    } catch (error) {
        console.error('Update group settings error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};

export const getFriendsForCollaboration = async (req, res) => {
    try {
        const userId = req.user._id;

        const following = await Follow.find({ followerId: userId })
            .select('followingId');
        const followers = await Follow.find({ followingId: userId })
            .select('followerId');

        const friendIds = new Set();
        following.forEach(f => friendIds.add(f.followingId.toString()));
        followers.forEach(f => friendIds.add(f.followerId.toString()));

        const friends = await User.find({
            _id: { $in: Array.from(friendIds) },
            status: 'active'
        })
            .select('username fullName avatarUrl')
            .sort({ username: 1 });

        res.json({
            success: true,
            count: friends.length,
            data: friends
        });
    } catch (error) {
        console.error('Get friends for collaboration error:', error);
        res.status(500).json({
            success: false,
            error: error.message || 'Server error'
        });
    }
};
