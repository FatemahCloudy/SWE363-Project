import React, { useState } from "react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { AddMemoryModal } from "@/components/AddMemoryModal";
import { EditProfileModal } from "@/components/EditProfileModal";

export const ProfileHeaderSection = () => {
    const [showAddMemory, setShowAddMemory] = useState(false);
    const [showEditProfile, setShowEditProfile] = useState(false);

    return (
        <>
            <AddMemoryModal open={showAddMemory} onOpenChange={setShowAddMemory} />
            <EditProfileModal open={showEditProfile} onOpenChange={setShowEditProfile} />
            <section className="w-full relative">
                <div className="flex flex-col">
                    <div className="relative">
                        <img
                            className="w-full h-[245px] rounded-[10px] object-cover"
                            alt="Cover"
                            src="/figmaAssets/image-1.png"
                        />

                        <Avatar className="absolute bottom-0 left-14 translate-y-1/2 w-[180px] h-[180px] border-4 border-white">
                            <AvatarImage
                                src="/figmaAssets/ellipse-58-5.png"
                                alt="Charlotte Deo"
                                className="object-cover"
                            />
                            <AvatarFallback className="bg-[#fbb03b] text-4xl">
                                CD
                            </AvatarFallback>
                        </Avatar>
                    </div>

                    <div className="flex items-end justify-between pt-[90px] px-14">
                        <div className="flex flex-col gap-2">
                            <h1 className="[font-family:'Nunito',Helvetica] font-bold text-[#a303a0] text-3xl tracking-[0] leading-[normal]">
                                Charlotte Deo
                            </h1>
                            <div className="opacity-70 [font-family:'Nunito',Helvetica] font-normal text-[#a303a0] text-base tracking-[0] leading-[normal]">
                                -
                            </div>
                        </div>

                        <div className="flex gap-3 pb-2">
                            <Button
                                variant="outline"
                                className="h-auto px-6 py-2 border-[#a303a0] text-[#a303a0] hover:bg-[#a303a0] hover:text-white"
                                onClick={() => setShowAddMemory(true)}
                            >
                                Add Memory
                            </Button>
                            <Button
                                variant="outline"
                                className="h-auto px-6 py-2 border-[#a303a0] text-[#a303a0] hover:bg-[#a303a0] hover:text-white"
                                onClick={() => setShowEditProfile(true)}
                            >
                                Edit Profile
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};
