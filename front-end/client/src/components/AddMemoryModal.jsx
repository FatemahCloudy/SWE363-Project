import { MapPinIcon, XIcon } from "lucide-react";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";



export const AddMemoryModal = ({ open, onOpenChange }) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ title, description, location, image });
    setTitle("");
    setDescription("");
    setLocation("");
    setImage(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white">
        
          <DialogTitle className="[font-family:'Nunito',Helvetica] font-bold text-[#490057] text-2xl">
            Add New Memory
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#490057]">
              Title
            </Label>
            <FormControl>

              <Input               value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your memory a title"
              className="bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#490057]">
              Description
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your memory..."
              className="bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica] min-h-[120px]"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#490057]">
              Location
            </Label>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#490057] opacity-50" />
              <FormControl>

                <Input                 value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Where was this memory made?"
                className="bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica] pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="[font-family:'Nunito',Helvetica] font-semibold text-[#490057]">
              Image
            </Label>
            <div className="flex items-center gap-3">
              <FormControl>

                <Input                 type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files?.[0] || null)}
                className="bg-[#f7f7f8] border-0 [font-family:'Nunito',Helvetica]"
              />
              {image && (
                <span className="[font-family:'Nunito',Helvetica] font-normal text-[#490057] text-sm opacity-70">
                  {image.name}
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button 
              type="submit"
              className="bg-[#a303a0] hover:bg-[#a303a0]/90 text-white"
            >
              Add Memory
            </Button>
            <Button
              type="button"
              variant="outline"
              className="border-[#a303a0] text-[#a303a0]"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
