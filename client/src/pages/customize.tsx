import { useState } from "react";
import { useLocation } from "wouter";
import { useResponsive } from "@/hooks/use-responsive";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

export default function Customize() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isMobile, isTablet } = useResponsive();
  const [selectedColor, setSelectedColor] = useState("#000000");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [customText, setCustomText] = useState("");

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please upload an image smaller than 5MB",
          variant: "destructive",
        });
        return;
      }

      // Create a URL for the uploaded image
      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      // Clean up the URL when component unmounts
      return () => {
        URL.revokeObjectURL(imageUrl);
      };
    }
  };

  return (
    <div 
      className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-12"
      style={{
        backgroundImage: "url('https://www.easygifanimator.net/images/samples/video-to-gif-sample.gif')",  // Replaced with a higher-resolution image.  Consider a placeholder if this URL is unavailable.
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        position: "relative",
        filter: "blur(2px)" // Added a slight blur to the background for better contrast
      }}
    >
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(255, 255, 255, 0.8)", /* Changed background color and opacity for better visibility */
          zIndex: -1
        }}
      ></div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6 md:mb-8">Customize Your Product</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8">
        <div className={`${!isMobile ? 'sticky top-24' : ''}`}>
          <Card className="mb-4 md:mb-8">
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>See how your customization looks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                {uploadedImage ? (
                  <img
                    src={uploadedImage}
                    alt="Preview"
                    className="max-w-full max-h-full object-contain rounded-lg"
                    onError={() => {
                      setUploadedImage(null);
                      toast({
                        title: "Error loading image",
                        description: "Failed to load the image. Please try again.",
                        variant: "destructive",
                      });
                    }}
                  />
                ) : (
                  <p className="text-muted-foreground text-center px-4">
                    Customization preview will appear here
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className={`grid w-full ${isMobile ? 'grid-cols-1' : 'grid-cols-3'} gap-2`}>
              <TabsTrigger value="upload">Upload Design</TabsTrigger>
              <TabsTrigger value="text">Add Text</TabsTrigger>
              <TabsTrigger value="color">Color</TabsTrigger>
            </TabsList>

            <TabsContent value="upload">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Your Design</CardTitle>
                  <CardDescription>
                    Upload an image to customize your product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="image">Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Supported formats: JPEG, PNG, GIF (max 5MB)
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="text">
              <Card>
                <CardHeader>
                  <CardTitle>Add Text</CardTitle>
                  <CardDescription>
                    Add text to customize your product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="text">Text</Label>
                  <Input
                    id="text"
                    placeholder="Enter your text"
                    className="mt-2"
                    onChange={(e) => setCustomText(e.target.value)}
                    value={customText}
                  />
                  <div className="mt-4">
                    <Label htmlFor="textColor">Text Color</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <input
                        type="color"
                        id="textColor"
                        value={selectedColor}
                        onChange={(e) => setSelectedColor(e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <span className="text-sm">{selectedColor}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="color">
              <Card>
                <CardHeader>
                  <CardTitle>Choose Color</CardTitle>
                  <CardDescription>
                    Select a color for your product
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="color">Color</Label>
                  <Input
                    id="color"
                    type="color"
                    value={selectedColor}
                    onChange={(e) => setSelectedColor(e.target.value)}
                    className="h-10 w-full mt-2"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-6 md:mt-8 space-y-3 md:space-y-4">
            <Button 
              className="w-full" 
              size={isMobile ? "default" : "lg"}
              onClick={() => {
                toast({
                  title: "Design saved",
                  description: "Your customization has been saved",
                });
                setLocation("/products");
              }}
            >
              Save Design
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              size={isMobile ? "default" : "lg"}
              onClick={() => setLocation("/products")}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}