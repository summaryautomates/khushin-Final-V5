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
    text: "KHUSH.IN",
    font: "playfair",
    fontSize: 42,
    color: "#f2b71c", // Gold color matching brand theme
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
    <div
      className="flex flex-col"
      style={{
        backgroundImage: "url('https://i.imghippo.com/files/I2429lk.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        minHeight: "100vh",
        position: "relative"
      }}
    >
      {/* Add a semi-transparent overlay */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        style={{ zIndex: 0 }}
      />

      {/* Main content with higher z-index */}
      <div className="container mx-auto px-4 relative py-8" style={{ zIndex: 1 }}>
        <h1 className="text-3xl md:text-4xl font-bold mb-8 text-white">Customize Your Product</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Section - Order changed to be first for mobile */}
          <div className={`${!isMobile ? 'sticky top-24' : 'order-first'}`}>
            <Card className="mb-8 shadow-lg border-2 border-amber-500 relative overflow-hidden bg-gray-900">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-transparent to-amber-800/20 pointer-events-none" />
              <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-amber-700/50">
                <CardTitle className="text-2xl font-bold text-amber-400">Premium Customization</CardTitle>
                <CardDescription className="text-amber-300">Create your exclusive KHUSH.IN design</CardDescription>
              </CardHeader>
              <CardContent className="pt-6 bg-gray-900">
                <div
                  className="aspect-square bg-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden shadow-inner border border-gray-700"
                  style={{
                    backgroundImage: "linear-gradient(45deg, #1a1a1a 25%, transparent 25%), linear-gradient(-45deg, #1a1a1a 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #1a1a1a 75%), linear-gradient(-45deg, transparent 75%, #1a1a1a 75%)",
                    backgroundSize: "20px 20px",
                    backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px"
                  }}
                >
                  {(!uploadedImage && !customization.text) ? (
                    <div className="text-center p-8">
                      <ImageIcon className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                      <p className="text-amber-500 font-medium">Add your personalized text or upload an image</p>
                    </div>
                  ) : (
                    <>
                      {uploadedImage && (
                        <img
                          src={uploadedImage}
                          alt="Preview"
                          className="max-w-full max-h-full object-contain"
                          style={{
                            transform: `translate(${customization.x}%, ${customization.y}%) scale(${customization.scale / 100}) rotate(${customization.rotation}deg)`
                          }}
                        />
                      )}
                      {customization.text && (
                        <div
                          className="absolute pointer-events-none select-none z-10"
                          style={{
                            fontFamily: customization.font,
                            fontSize: `${customization.fontSize}px`,
                            color: customization.color,
                            transform: `translate(${customization.x}%, ${customization.y}%) scale(${customization.scale / 100}) rotate(${customization.rotation}deg)`,
                            transition: "all 0.3s ease",
                            textShadow: "1px 1px 2px rgba(0,0,0,0.3)"
                          }}
                        >
                          {customization.text}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Customization Controls */}
          <div className="order-last">
            <Tabs defaultValue="text" className="w-full">
              <TabsList className="grid w-full grid-cols-3 p-1 bg-gray-900 rounded-lg border border-amber-600/50">
                <TabsTrigger value="text" className="flex items-center gap-2 text-amber-400 data-[state=active]:bg-gray-800 data-[state=active]:text-amber-400 font-medium">
                  <Type className="w-4 h-4" />
                  Text
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center gap-2 text-amber-400 data-[state=active]:bg-gray-800 data-[state=active]:text-amber-400 font-medium">
                  <ImageIcon className="w-4 h-4" />
                  Image
                </TabsTrigger>
                <TabsTrigger value="adjust" className="flex items-center gap-2 text-amber-400 data-[state=active]:bg-gray-800 data-[state=active]:text-amber-400 font-medium">
                  <Palette className="w-4 h-4" />
                  Adjust
                </TabsTrigger>
              </TabsList>

              <TabsContent value="text">
                <Card className="border-amber-700/50 bg-gray-900">
                  <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-amber-700/30">
                    <CardTitle className="text-amber-400">Text Customization</CardTitle>
                    <CardDescription className="text-amber-300/80">Add and style your text</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-gray-100">
                    <div className="space-y-2">
                      <Label htmlFor="text" className="text-amber-300">Text Content</Label>
                      <Input
                        id="text"
                        placeholder="Enter your text"
                        value={customization.text}
                        onChange={(e) => updateCustomization('text', e.target.value)}
                        className="bg-gray-800 border-gray-700 text-gray-100 focus:border-amber-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="font" className="text-amber-300">Font Family</Label>
                      <Select
                        value={customization.font}
                        onValueChange={(value) => updateCustomization('font', value)}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-gray-100 focus:border-amber-500">
                          <SelectValue placeholder="Select a font" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-gray-100">
                          {FONTS.map(font => (
                            <SelectItem key={font.value} value={font.value} className="text-gray-100 hover:bg-gray-700 focus:bg-gray-700">
                              {font.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="fontSize" className="text-amber-300">Font Size</Label>
                      <Slider
                        value={[customization.fontSize]}
                        onValueChange={([value]) => updateCustomization('fontSize', value)}
                        min={12}
                        max={72}
                        step={1}
                        className="[&>[data-state=active]]:bg-amber-500 [&>[role=slider]]:bg-amber-400"
                      />
                      <p className="text-sm text-amber-300/80 text-right">{customization.fontSize}px</p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="textColor" className="text-amber-300">Text Color</Label>
                      <div className="flex items-center gap-4">
                        <input
                          type="color"
                          id="textColor"
                          value={customization.color}
                          onChange={(e) => updateCustomization('color', e.target.value)}
                          className="w-12 h-12 rounded cursor-pointer border-2 border-amber-600"
                        />
                        <span className="text-sm font-mono text-amber-300">{customization.color}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="upload">
                <Card className="border-amber-700/50 bg-gray-900">
                  <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-amber-700/30">
                    <CardTitle className="text-amber-400">Image Upload</CardTitle>
                    <CardDescription className="text-amber-300/80">Upload and customize your image</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 text-gray-100">
                    <div className="space-y-2">
                      <Label htmlFor="image" className="text-amber-300">Upload Image</Label>
                      <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="bg-gray-800 border-gray-700 text-gray-100 focus:border-amber-500 file:bg-amber-600 file:text-white file:hover:bg-amber-700"
                      />
                      <p className="text-sm text-amber-300/80">
                        Supported formats: JPEG, PNG, GIF (max 5MB)
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="adjust">
                <Card className="border-amber-700/50 bg-gray-900">
                  <CardHeader className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-amber-700/30">
                    <CardTitle className="text-amber-400">Position & Scale</CardTitle>
                    <CardDescription className="text-amber-300/80">Adjust position and size</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6 text-gray-100">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-amber-300">
                        <MoveHorizontal className="w-4 h-4 text-amber-400" />
                        Horizontal Position
                      </Label>
                      <Slider
                        value={[customization.x]}
                        onValueChange={([value]) => updateCustomization('x', value)}
                        min={0}
                        max={100}
                        step={1}
                        className="[&>[data-state=active]]:bg-amber-500 [&>[role=slider]]:bg-amber-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-amber-300">
                        <MoveVertical className="w-4 h-4 text-amber-400" />
                        Vertical Position
                      </Label>
                      <Slider
                        value={[customization.y]}
                        onValueChange={([value]) => updateCustomization('y', value)}
                        min={0}
                        max={100}
                        step={1}
                        className="[&>[data-state=active]]:bg-amber-500 [&>[role=slider]]:bg-amber-400"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-amber-300">
                        <ZoomIn className="w-4 h-4 text-amber-400" />
                        Scale
                      </Label>
                      <Slider
                        value={[customization.scale]}
                        onValueChange={([value]) => updateCustomization('scale', value)}
                        min={50}
                        max={200}
                        step={1}
                        className="[&>[data-state=active]]:bg-amber-500 [&>[role=slider]]:bg-amber-400"
                      />
                      <p className="text-sm text-amber-300/80 text-right">{customization.scale}%</p>
                    </div>

                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-amber-300">
                        <RotateCw className="w-4 h-4 text-amber-400" />
                        Rotation
                      </Label>
                      <Slider
                        value={[customization.rotation]}
                        onValueChange={([value]) => updateCustomization('rotation', value)}
                        min={0}
                        max={360}
                        step={1}
                        className="[&>[data-state=active]]:bg-amber-500 [&>[role=slider]]:bg-amber-400"
                      />
                      <p className="text-sm text-amber-300/80 text-right">{customization.rotation}°</p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            <div className="mt-8 space-y-4">
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  className="flex-1 border-amber-600 bg-gray-800 text-amber-400 hover:bg-gray-700 hover:text-amber-300 font-medium"
                  onClick={undoLastChange}
                  disabled={history.length === 0 || isLoading}
                >
                  <Undo className="w-4 h-4 mr-2" />
                  Undo
                </Button>
                <Button
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white font-medium"
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
                className="w-full border-amber-600/50 bg-gray-800 text-amber-400 hover:bg-gray-700 hover:text-amber-300 font-medium"
                onClick={() => setLocation("/products")}
                disabled={isLoading}
              >
                Cancel
              </Button>
              
              {/* Quick tips for users */}
              <div className="mt-4 p-4 bg-gray-800 rounded-md text-sm text-amber-300 border border-amber-700/50">
                <h4 className="font-semibold mb-2 text-amber-400">Premium Customization Tips:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Drag sliders to adjust position and size</li>
                  <li>Our gold color theme gives your design a luxurious feel</li>
                  <li>Try the Playfair font for an elegant appearance</li>
                  <li>Your customizations are saved with your order</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}