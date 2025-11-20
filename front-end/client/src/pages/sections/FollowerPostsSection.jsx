import { MoreHorizontalIcon } from "lucide-react";
import React from "react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const postsData = [
    {
        id: 1,
        author: "Charlotte Deo",
        timeAgo: "15mins ago",
        title: "A Day in London",
        description:
            "Walked by the Thames, watched the lights from the London Eye, and ended the day with hot chocolate in a cozy café",
        avatarBg: "#fbb03b",
        avatarImage: "/figmaAssets/ellipse-58-5.png",
        hasImage: true,
        imageUrl: null,
        likes: "1,498",
        comments: "3,000",
    },
    {
        id: 2,
        author: "Charlotte Deo",
        timeAgo: "30mins ago",
        title: null,
        description: "New Blazer out here... $500!!!!!!",
        descriptionPrefix: "Charles Deo",
        avatarBg: "#fbb03b",
        avatarImage: "/figmaAssets/ellipse-58-5.png",
        hasImage: true,
        imageUrl: "/figmaAssets/unsplash-wdjkxfq4vhy.svg",
        likes: "1,498",
        comments: "3,000",
    },
];

export const FollowerPostsSection = () => {
    return (
        <section className="w-full flex flex-col gap-6">
            <div className="flex items-center gap-6 px-12 pt-10">
                <button className="[font-family:'Nunito',Helvetica] font-normal text-[#a303a0] text-xl tracking-[0] leading-[normal]">
                    Followers
                </button>
                <button className="[font-family:'Nunito',Helvetica] font-normal text-[#a303a0] text-xl tracking-[0] leading-[normal]">
                    Following
                </button>
                <button className="[font-family:'Nunito',Helvetica] font-extrabold text-[#a303a0] text-xl tracking-[0] leading-[normal]">
                    Memories
                </button>
            </div>

            <div className="w-full h-px bg-[#e3e7ec]" />

            <div className="flex flex-col gap-6 px-12">
                {postsData.map((post) => (
                    <React.Fragment key={post.id}>
                        <Card className="bg-white rounded-[10px] border-0 shadow-sm">
                            <CardContent className="p-11">
                                <div className="flex flex-col gap-4">
                                    <div className="flex items-start justify-between">
                                        <div className="flex gap-3">
                                            <div className="relative w-[74px] h-[74px] flex-shrink-0">
                                                <div
                                                    className="absolute inset-0 rounded-full"
                                                    style={{ backgroundColor: post.avatarBg }}
                                                />
                                                <Avatar className="w-full h-full">
                                                    <AvatarImage
                                                        src={post.avatarImage}
                                                        alt={post.author}
                                                    />

                                                    {post.author.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                        </div>

                                        <div className="flex flex-col gap-1">
                                            <h3 className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-base tracking-[0] leading-[normal]">
                                                {post.author}
                                            </h3>
                                            {post.title && (
                                                <h4 className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-base tracking-[0] leading-[normal]">
                                                    {post.title}
                                                </h4>
                                            )}
                                            <span className="[font-family:'Nunito',Helvetica] font-light text-[#490057] text-[10px] tracking-[0] leading-[normal]">
                          {post.timeAgo}
                        </span>
                                        </div>

                                        <div className="ml-4 w-[21px] h-5 opacity-40 bg-[url(/figmaAssets/logout.svg)] bg-[100%_100%]" />
                                    </div>

                                    <Button variant="ghost" size="icon" className="h-auto p-0">
                                        <MoreHorizontalIcon className="w-6 h-6 text-[#490057]" />
                                    </Button>
                                </div>

                                {post.imageUrl && (
                                    <div className="w-full">
                                        <img
                                            src={post.imageUrl}
                                            alt="Post content"
                                            className="w-full h-auto object-cover rounded"
                                        />
                                    </div>
                                )}

                                <p className="[font-family:'Nunito',Helvetica] font-normal text-[#490057] text-base tracking-[0] leading-[normal]">
                                    {post.descriptionPrefix && (
                                        <span className="font-bold">
                        {post.descriptionPrefix}&nbsp;&nbsp;
                      </span>
                                    )}
                                    <span
                                        className={post.descriptionPrefix ? "font-light" : ""}
                                    >
                      {post.description}
                    </span>
                                </p>

                                <div className="flex items-center gap-14 pl-8">
                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-auto p-0"
                                        >
                                            <img
                                                src="/figmaAssets/favorite-border.svg"
                                                alt="Like"
                                                className="w-7 h-7"
                                            />
                                        </Button>
                                        <span className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-base tracking-[0] leading-[normal]">
                        {post.likes}
                      </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-auto p-0"
                                        >
                                            <div className="w-7 h-7 overflow-hidden relative">
                                                <img
                                                    src="/figmaAssets/vector.svg"
                                                    alt="Comment"
                                                    className="absolute w-[83.33%] h-[83.33%] top-[8.33%] left-[8.33%]"
                                                />
                                            </div>
                                        </Button>
                                        <span className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-base tracking-[0] leading-[normal]">
                        {post.comments}
                      </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                {post.id < postsData.length && (
                    <div className="w-full h-px bg-[#e3e7ec]" />
                    )}
                    </React.Fragment>
                    ))}
            </div>
        </section>
    );
};
