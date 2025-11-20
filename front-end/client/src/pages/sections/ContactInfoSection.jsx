import React from "react";
import { Separator } from "@/components/ui/separator";

const contactInfoData = [
    {
        icon: "/figmaAssets/person.svg",
        text: "Female",
        hasSeparator: true,
    },
    {
        icon: "/figmaAssets/cake.svg",
        text: "Born June 26, 2001",
        hasSeparator: true,
    },
    {
        icon: "/figmaAssets/location.svg",
        text: "2239  Hog Camp Road",
        subtext: "Schaumburg",
        hasSeparator: true,
    },
    {
        icon: "/figmaAssets/message.svg",
        text: "charlotte518@gmail.com",
        hasSeparator: true,
    },
    {
        icon: "/figmaAssets/call.png",
        text: "33757005467",
        hasSeparator: false,
    },
];

export const ContactInfoSection = () => {
    return (
        <section className="w-full">
            <div className="flex flex-col gap-6">
                <h2 className="[font-family:'Nunito',Helvetica] font-bold text-[#a303a0] text-xl tracking-[0] leading-[normal]">
                    About
                </h2>

                <div className="flex flex-col gap-4">
                    {contactInfoData.map((item, index) => (
                        <React.Fragment key={index}>
                            <div className="flex items-start gap-2">
                                <img
                                    className="w-6 h-6 flex-shrink-0 mt-0.5"
                                    alt={item.text}
                                    src={item.icon}
                                />
                                <div className="flex flex-col gap-1">
                                    <p className="opacity-70 [font-family:'Nunito',Helvetica] font-normal text-[#490057] text-base tracking-[0] leading-[normal]">
                                        {item.text}
                                    </p>
                                    {item.subtext && (
                                        <p className="opacity-70 [font-family:'Nunito',Helvetica] font-normal text-[#490057] text-base tracking-[0] leading-[normal]">
                                            {item.subtext}
                                        </p>
                                    )}
                                </div>
                            </div>
                            {item.hasSeparator && (
                                <Separator className="bg-[#490057] opacity-20" />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>
        </section>
    );
};
