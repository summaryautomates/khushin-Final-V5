
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const backgrounds = [
  {
    id: "luxury-1",
    name: "Gold Luxury",
    src: "/backgrounds/luxury-background.jpg",
    thumbnail: "/backgrounds/luxury-background.jpg",
  },
  {
    id: "simple-1",
    name: "Clean White",
    src: "/backgrounds/white-background.jpg",
    thumbnail: "/backgrounds/white-background.jpg",
  },
  {
    id: "dark-1",
    name: "Dark Elegance",
    src: "/backgrounds/dark-background.jpg",
    thumbnail: "/backgrounds/dark-background.jpg",
  },
];

interface BackgroundSelectorProps {
  selectedBackground: string;
  onSelectBackground: (background: string) => void;
}

export function BackgroundSelector({
  selectedBackground,
  onSelectBackground,
}: BackgroundSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Background Style</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2">
          {backgrounds.map((bg) => (
            <div
              key={bg.id}
              className={cn(
                "cursor-pointer overflow-hidden rounded-md border-2 border-transparent transition-all",
                selectedBackground === bg.src && "border-primary"
              )}
              onClick={() => onSelectBackground(bg.src)}
            >
              <div 
                className="aspect-video w-full relative"
                style={{
                  backgroundImage: `url(${bg.thumbnail})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black/10"></div>
              </div>
              <div className="bg-background p-1 text-xs text-center">{bg.name}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
