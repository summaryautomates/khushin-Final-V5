import { Share2, Facebook, Twitter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SiWhatsapp, SiPinterest } from "react-icons/si";

interface ShareButtonsProps {
  url: string;
  title: string;
  description: string;
  image?: string;
}

export function ShareButtons({ url, title, description, image }: ShareButtonsProps) {
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDesc = encodeURIComponent(description);

  const shareLinks = {
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
    pinterest: image ? `https://pinterest.com/pin/create/button/?url=${encodedUrl}&media=${encodeURIComponent(image)}&description=${encodedTitle}` : null,
  };

  const handleShare = (platform: keyof typeof shareLinks) => {
    const link = shareLinks[platform];
    if (link) {
      window.open(link, '_blank', 'width=600,height=400');
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full hover:bg-primary/10 transition-colors"
        >
          <Share2 className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem 
          onClick={() => handleShare('facebook')} 
          className="cursor-pointer px-4 py-2 hover:bg-primary/10"
        >
          <Facebook className="mr-3 h-4 w-4 text-blue-600" />
          <span>Share on Facebook</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare('twitter')} 
          className="cursor-pointer px-4 py-2 hover:bg-primary/10"
        >
          <Twitter className="mr-3 h-4 w-4 text-sky-500" />
          <span>Share on Twitter</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleShare('whatsapp')} 
          className="cursor-pointer px-4 py-2 hover:bg-primary/10"
        >
          <SiWhatsapp className="mr-3 h-4 w-4 text-green-600" />
          <span>Share on WhatsApp</span>
        </DropdownMenuItem>
        {shareLinks.pinterest && (
          <DropdownMenuItem 
            onClick={() => handleShare('pinterest')} 
            className="cursor-pointer px-4 py-2 hover:bg-primary/10"
          >
            <SiPinterest className="mr-3 h-4 w-4 text-red-600" />
            <span>Save to Pinterest</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}