import { ArrowLeftIcon, HeartIcon, MapPinIcon, MessageCircleIcon, MoreHorizontalIcon } from "lucide-react";
import React from "react";
import { Link, useParams } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { NavigationMenuSection } from "./sections/NavigationMenuSection";

const memoryData = {
  id: "1",
  author: {
    name: "Charlotte Deo",
    avatar: "/figmaAssets/ellipse-58-5.png",
    avatarBg: "#fbb03b",
  },
  title: "A Day in London",
  description: "Walked by the Thames, watched the lights from the London Eye, and ended the day with hot chocolate in a cozy café",
  imageUrl: "/figmaAssets/sample-image-1.png",
  location: "London, UK",
  locationAddress: "Thames River, London, United Kingdom",
  latitude: 51.5074,
  longitude: -0.1278,
  timeAgo: "15mins ago",
  likes: 1498,
  commentsCount: 3000,
  isLiked: false,

const commentsData = [
  {
    id: "1",
    author: "Shelby Goode",
    avatar: "/figmaAssets/ellipse-64-1.png",
    content: "This looks amazing! I've always wanted to visit London.",
    timeAgo: "5 mins ago",
  },
  {
    id: "2",
    author: "Robert Bacins",
    avatar: "/figmaAssets/ellipse-64.png",
    content: "Beautiful photo! The London Eye is stunning at night.",
    timeAgo: "10 mins ago",
  },
];



const MapComponent = ({ latitude, longitude, location }) => {
  return (
    <div className="w-full h-[300px] rounded-lg overflow-hidden border border-[#490057]/20">
      <iframe
        width="100%"
        height="100%"
        frameBorder="0"
        scrolling="no"
        marginHeight={0}
        marginWidth={0}
        src={`https://www.openstreetmap.org/export/embed.html?bbox=${longitude-0.01},${latitude-0.01},${longitude+0.01},${latitude+0.01}&layer=mapnik&marker=${latitude},${longitude}`}
        style={{ border: 0 }}
        title={location}
      />
    </div>
  );
};

export const MemoryDetailsPage = () => {
  const params = useParams();

  return (
    <div className="bg-[#f7f7f8] overflow-hidden w-full min-h-screen flex">
      <NavigationMenuSection />

      <main className="flex-1 md:ml-[220px] p-4 md:p-8">
        <div className="max-w-[900px] mx-auto">
          <Link href="/">
            <Button variant="ghost" className="mb-6 text-[#490057] hover:text-[#490057]/80">
              <ArrowLeftIcon className="w-5 h-5 mr-2" />
              Back to Feed
            </Button>
          </Link>

          <Card className="bg-white rounded-[10px] border-0 shadow-sm">
            <CardContent className="p-0">
              <div className="p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex gap-4">
                    <div className="relative w-[74px] h-[74px] flex-shrink-0">
                      <div
                        className="absolute inset-0 rounded-full"
                        style={{ backgroundColor: memoryData.author.avatarBg }}
                      />
                      <Avatar className="w-full h-full">
                        <AvatarImage src={memoryData.author.avatar} alt={memoryData.author.name} />
                        {memoryData.author.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    </div>

                    <div className="flex flex-col gap-1">
                      <h3 className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-xl">
                        {memoryData.author.name}
                      </h3>
                      <span className="[font-family:'Nunito',Helvetica] font-light text-[#490057] text-sm opacity-70">
                        {memoryData.timeAgo}
                      </span>
                      {memoryData.locationAddress && (
                        <div className="flex items-center gap-1 text-[#490057] opacity-70">
                          <MapPinIcon className="w-4 h-4" />
                          <span className="[font-family:'Nunito',Helvetica] font-normal text-sm">
                            {memoryData.location}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button variant="ghost" size="icon" className="h-auto p-0">
                    <MoreHorizontalIcon className="w-6 h-6 text-[#490057]" />
                  </Button>
                </div>

                {memoryData.title && (
                  <h1 className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-3xl mb-4">
                    {memoryData.title}
                  </h1>
                )}

                <p className="[font-family:'Nunito',Helvetica] font-normal text-[#490057] text-lg mb-6 leading-relaxed">
                  {memoryData.description}
                </p>

                {memoryData.imageUrl && (
                  <div className="mb-6">
                    <img
                      src={memoryData.imageUrl}
                      alt={memoryData.title}
                      className="w-full h-auto rounded-lg object-cover"
                    />
                  </div>
                )}

                {memoryData.latitude && memoryData.longitude && (
                  <div className="mb-6">
                    <h2 className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-xl mb-3">
                      Location
                    </h2>
                    <MapComponent 
                      latitude={memoryData.latitude}
                      longitude={memoryData.longitude}
                      location={memoryData.locationAddress}
                    />
                  </div>
                )}

                <div className="flex items-center gap-8 py-4">
                  <Button variant="ghost" className="h-auto p-0 gap-2 text-[#490057]">
                    <HeartIcon className={`w-6 h-6 ${memoryData.isLiked ? 'fill-red-500 text-red-500' : ''}`} />
                    <span className="[font-family:'Nunito',Helvetica] font-bold text-base">
                      {memoryData.likes.toLocaleString()}
                    </span>
                  </Button>

                  <Button variant="ghost" className="h-auto p-0 gap-2 text-[#490057]">
                    <MessageCircleIcon className="w-6 h-6" />
                    <span className="[font-family:'Nunito',Helvetica] font-bold text-base">
                      {memoryData.commentsCount.toLocaleString()}
                    </span>
                  </Button>
                </div>

                <Separator className="my-6 bg-[#490057] opacity-20" />

                <div className="space-y-6">
                  <h2 className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-xl">
                    Comments
                  </h2>

                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src="/figmaAssets/ellipse-58.png" alt="You" />
                      You</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <FormControl>

                        <Input                         placeholder="Write a comment..."
                        className="w-full bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica] font-normal text-[#490057]"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {commentsData.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={comment.avatar} alt={comment.author} />
                          {comment.author.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="bg-[#f7f7f8] rounded-lg p-3">
                            <div className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-sm mb-1">
                              {comment.author}
                            </div>
                            <div className="[font-family:'Nunito',Helvetica] font-normal text-[#490057] text-sm">
                              {comment.content}
                            </div>
                          </div>
                          <div className="[font-family:'Nunito',Helvetica] font-light text-[#490057] text-xs opacity-70 mt-1 ml-3">
                            {comment.timeAgo}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};
