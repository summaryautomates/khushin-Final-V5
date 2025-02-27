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
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Type, 
  Image as ImageIcon, 
  Palette, 
  MoveVertical, 
  MoveHorizontal,
  ZoomIn,
  RotateCw,
  Save,
  Undo,
  Loader2
} from "lucide-react";

const FONTS = [
  { value: "inter", label: "Inter" },
  { value: "roboto", label: "Roboto" },
  { value: "playfair", label: "Playfair Display" },
  { value: "montserrat", label: "Montserrat" },
  { value: "opensans", label: "Open Sans" }
];

interface CustomizationState {
  text: string;
  font: string;
  fontSize: number;
  color: string;
  x: number;
  y: number;
  scale: number;
  rotation: number;
}

export default function Customize() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { isMobile, isTablet } = useResponsive();
  const [isLoading, setIsLoading] = useState(false);

  // Customization states
  const [customization, setCustomization] = useState<CustomizationState>({
    text: "",
    font: "inter",
    fontSize: 24,
    color: "#000000",
    x: 50,
    y: 50,
    scale: 100,
    rotation: 0
  });

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<CustomizationState[]>([]);

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

      const imageUrl = URL.createObjectURL(file);
      setUploadedImage(imageUrl);

      return () => URL.revokeObjectURL(imageUrl);
    }
  };

  const updateCustomization = (key: keyof CustomizationState, value: any) => {
    setHistory(prev => [...prev, customization]);
    setCustomization(prev => ({ ...prev, [key]: value }));
  };

  const undoLastChange = () => {
    if (history.length > 0) {
      const lastState = history[history.length - 1];
      setCustomization(lastState);
      setHistory(prev => prev.slice(0, -1));
    }
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate saving
      await new Promise(resolve => setTimeout(resolve, 1500));
      toast({
        title: "Design saved",
        description: "Your customization has been saved successfully!",
      });
      setLocation("/products");
    } catch (error) {
      toast({
        title: "Error saving design",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8">Customize Your Product</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div className={`${!isMobile ? 'sticky top-24' : ''}`}>
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Live Preview</CardTitle>
                <CardDescription>See your customization in real-time</CardDescription>
              </CardHeader>
              <CardContent>
                <div 
                  className="aspect-square bg-white rounded-lg flex items-center justify-center relative overflow-hidden"
                  style={{
                    backgroundImage: "linear-gradient(45deg, #f0f0f0 25%, transparent 25%), linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #f0f0f0 75%), linear-gradient(-45deg, transparent 75%, #f0f0f0 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
                  }}
                >
                  {uploadedImage ? (
                    <img
                      src={uploadedImage}
                      alt="Preview"
                      className="max-w-full max-h-full object-contain"
                      style={{
                        transform: `translate(${customization.x}%, ${customization.y}%) scale(${customization.scale / 100}) rotate(${customization.rotation}deg)`
                      }}
                    />
                  ) : (
                    <div className="text-center p-8">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                      <p className="text-muted-foreground">Upload an image or add text to start customizing</p>
                    </div>
                  )}
                  {customization.text && (
                    <div 
                      className="absolute pointer-events-none"
                      style={{
                        fontFamily: customization.font,
                        fontSize: `${customization.fontSize}px`,
                        color: customization.color,
                        transform: `translate(${customization.x}%, ${customization.y}%) scale(${customization.scale / 100}) rotate(${customization.rotation}deg)`,
                        transition: "all 0.3s ease"
                      }}
                    >
                      {customization.text}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Controls */}
          <div>
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="text" className="flex items-center gap-2">
                  <Type className="w-4 h-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="adjust" className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  Adjust
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text">
                <Card>
                  <CardHeader>
                    <CardTitle>Text Customization</CardTitle>
                    <CardDescription>Add and style your text</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="text">Text Content</Label>
                      <Input
                        id="text"
                        placeholder="Enter your text"
                        value={customization.text}
                        onChange={(e) => updateCustomization('text', e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="font">Font Family</Label>
                      <Select
                        value={customization.font}
                        onValueChange={(value) => updateCustomization('font', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent>
                          {FONTS.map(font => (
                            <SelectItem key={font.value} value={font.value}>
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fontSize">Font Size</Label>
                      <Slider
                        value={[customization.fontSize]}
                        onValueChange={([value]) => updateCustomization('fontSize', value)}
                        min={12}
                        max={72}
                        step={1}
                      />
                      <p className="text-sm text-muted-foreground text-right">{customization.fontSize}px</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textColor">Text Color</Label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          id="textColor"
                          value={customization.color}
                          onChange={(e) => updateCustomization('color', e.target.value)}
                          className="w-12 h-12 rounded cursor-pointer"
                        />
                        <span className="text-sm font-mono">{customization.color}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upload">
                <Card>
                  <CardHeader>
                    <CardTitle>Image Upload</CardTitle>
                    <CardDescription>Upload and customize your image</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="image">Upload Image</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                      <p className="text-sm text-muted-foreground">
                        Supported formats: JPEG, PNG, GIF (max 5MB)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="adjust">
                <Card>
                  <CardHeader>
                    <CardTitle>Position & Scale</CardTitle>
                    <CardDescription>Adjust position and size</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MoveHorizontal className="w-4 h-4" />
                        Horizontal Position
                      </Label>
                      <Slider
                        value={[customization.x]}
                        onValueChange={([value]) => updateCustomization('x', value)}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <MoveVertical className="w-4 h-4" />
                        Vertical Position
                      </Label>
                      <Slider
                        value={[customization.y]}
                        onValueChange={([value]) => updateCustomization('y', value)}
                        min={0}
                        max={100}
                        step={1}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <ZoomIn className="w-4 h-4" />
                        Scale
                      </Label>
                      <Slider
                        value={[customization.scale]}
                        onValueChange={([value]) => updateCustomization('scale', value)}
                        min={50}
                        max={200}
                        step={1}
                      />
                      <p className="text-sm text-muted-foreground text-right">{customization.scale}%</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2">
                        <RotateCw className="w-4 h-4" />
                        Rotation
                      </Label>
                      <Slider
                        value={[customization.rotation]}
                        onValueChange={([value]) => updateCustomization('rotation', value)}
                        min={0}
                        max={360}
                        step={1}
                      />
                      <p className="text-sm text-muted-foreground text-right">{customization.rotation}°</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-8 space-y-4">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={undoLastChange}
                  disabled={history.length === 0 || isLoading}
                >
                  <Undo className="w-4 h-4 mr-2" />
                  Undo
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Design
                    </>
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/products")}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}