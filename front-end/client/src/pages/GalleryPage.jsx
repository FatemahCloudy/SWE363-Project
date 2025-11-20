import { LogOutIcon, SearchIcon } from "lucide-react";
import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NavigationMenuSection } from "./sections/NavigationMenuSection";

const galleryImages = [
  { id: 1, url: "/figmaAssets/sample-image-1.png", title: "London Eye" },
  { id: 2, url: "/figmaAssets/image-1.png", title: "Summer Vibes" },
  { id: 3, url: "/figmaAssets/unsplash-wdjkxfq4vhy.svg", title: "Fashion" },
  { id: 4, url: "/figmaAssets/sample-image-1.png", title: "Travel" },
  { id: 5, url: "/figmaAssets/image-1.png", title: "Nature" },
  { id: 6, url: "/figmaAssets/sample-image-1.png", title: "Architecture" },
  { id: 7, url: "/figmaAssets/image-1.png", title: "Food" },
  { id: 8, url: "/figmaAssets/unsplash-wdjkxfq4vhy.svg", title: "Portrait" },
  { id: 9, url: "/figmaAssets/sample-image-1.png", title: "Sunset" },
];

export const GalleryPage = (): JSX.Element => {
  return (
    <div className="bg-[#f7f7f8] overflow-hidden w-full min-h-screen flex">
      <NavigationMenuSection />

      <main className="flex-1 md:ml-[220px]">
        <header className="flex items-center justify-between px-[30px] py-5 gap-4">
          <div className="flex items-center gap-3">
            <img
              className="w-[63px] h-[42px] object-cover"
              alt="Logo"
              src="/figmaAssets/logo-1.png"
            />
            <div className="[font-family:'Nunito',Helvetica] font-semibold text-white text-2xl tracking-[0] leading-[normal]">
              Memory
              <br />
              of Place
            </div>
          </div>

          <div className="relative flex-1 max-w-[980px]">
            <SearchIcon className="absolute left-[23px] top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#490057]" />
            <Input
              placeholder="Search"
              className="w-full h-[62px] pl-[50px] bg-white rounded-[5px] border-0 [font-family:'Nunito',Helvetica] font-normal text-[#490057] text-xs placeholder:opacity-70 placeholder:underline"
            />
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="h-auto p-0">
              <img
                className="w-6 h-6"
                alt="Notifications"
                src="/figmaAssets/group-1000004229.png"
              />
            </Button>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-xs tracking-[0] leading-[normal]">
                  Charlotte Deo
                </div>
              </div>

              <Avatar className="w-[60px] h-[60px]">
                <div className="absolute inset-0 bg-[#fbb03b] rounded-full scale-90" />
                <AvatarImage
                  src="/figmaAssets/ellipse-58.png"
                  alt="Charlotte Deo"
                />
                <AvatarFallback>CD</AvatarFallback>
              </Avatar>

              <Button
                variant="ghost"
                size="icon"
                className="h-auto p-0 opacity-40"
              >
                <LogOutIcon className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </header>

        <div className="px-4 md:px-[30px] pb-8">
          <h1 className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-2xl md:text-3xl mb-6">
            My Gallery
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {galleryImages.map((image) => (
              <div
                key={image.id}
                className="relative aspect-square rounded-[10px] overflow-hidden group cursor-pointer"
              >
                <img
                  src={image.url}
                  alt={image.title}
                  className="w-full h-full object-cover transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end">
                  <div className="p-4">
                    <h3 className="[font-family:'Nunito',Helvetica] font-bold text-white text-lg">
                      {image.title}
                    </h3>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};
