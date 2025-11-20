import React from "react";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const friendsData = [
    {
        id: 1,
        name: "Shelby Goode",
        status: "Online",
        avatar: "/figmaAssets/ellipse-64-1.png",
        bgColor: "bg-app-primary",
        fontWeight: "font-normal",
    },
    {
        id: 2,
        name: "Robert Bacins",
        status: "Busy",
        avatar: "/figmaAssets/ellipse-64.png",
        bgColor: "bg-badge",
        fontWeight: "font-normal",
    },
    {
        id: 3,
        name: "John Carilo",
        status: "Online",
        avatar: "/figmaAssets/ellipse-92-1.png",
        bgColor: "bg-orange",
        fontWeight: "font-semibold",
    },
    {
        id: 4,
        name: "Adriene Watson",
        status: "Online",
        avatar: "/figmaAssets/ellipse-92.png",
        bgColor: "bg-app-primary",
        fontWeight: "font-normal",
    },
];

export const OnlineFriendsSection = () => {
    return (
        <section className="w-full">
            <Card className="bg-white rounded-[10px] border-0 shadow-sm">
                <CardContent className="p-0">
                    <div className="pt-[25px] px-[30px] pb-[31px]">
                        <h2 className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-lg mb-[16px]">
                            Friends
                        </h2>

                        <div className="flex flex-col">
                            {friendsData.map((friend, index) => (
                                <React.Fragment key={friend.id}>
                                    <div className="flex items-center gap-2.5 py-2.5">
                                        <div className="relative flex-shrink-0">
                                            <div
                                                className={`absolute inset-0 w-[34px] h-[34px] ${friend.bgColor} rounded-[16.82px] opacity-20`}
                                            />
                                            <Avatar className="w-[34px] h-[34px] relative">
                                                <AvatarImage src={friend.avatar} alt={friend.name} />
                                                {friend.name.charAt(0)}</AvatarFallback>
                                        </Avatar>
                                    </div>

                                    <div className="flex flex-col gap-0.5 min-w-0">
                                        <div
                                            className={`[font-family:'Nunito',Helvetica] ${friend.fontWeight} text-[#490057] text-base leading-normal truncate`}
                                        >
                                            {friend.name}
                                        </div>
                                        <div
                                            className={`[font-family:'Nunito',Helvetica] ${friend.status === "Busy" ? "font-normal" : "font-extralight"} text-[#490057] text-xs leading-normal ${friend.status === "Busy" ? "opacity-60" : ""}`}
                                        >
                                            {friend.status}
                                        </div>
                                    </div>
                                </div>

                            {index < friendsData.length - 1 && (
                                <Separator className="bg-additional-colorsline" />
                                )}
                                </React.Fragment>
                                ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </section>
    );
};
