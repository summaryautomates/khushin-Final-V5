import React from 'react';
import { FlameButton } from '@/components/ui/flame-button';
import { FlameElement } from '@/components/ui/flame-element';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function FlameDemo() {
  return (
    <div className="w-full">
      <section className="py-12 space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tighter">Flame Cursor Demo</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Experience our interactive flame cursor as it responds to your movements and interactions.
          </p>
        </div>
        
        {/* Interactive Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <FlameElement intensity="low">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Low Intensity</CardTitle>
                <CardDescription>Subtle flame effects on hover</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <FlameButton flameIntensity="low" size="lg">
                  Hover Me
                </FlameButton>
              </CardContent>
            </Card>
          </FlameElement>
          
          <FlameElement intensity="medium">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Medium Intensity</CardTitle>
                <CardDescription>More noticeable flame effects</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <FlameButton flameIntensity="medium" variant="outline" size="lg">
                  Try Me
                </FlameButton>
              </CardContent>
            </Card>
          </FlameElement>
          
          <FlameElement intensity="high">
            <Card className="transition-all duration-300 hover:shadow-lg hover:shadow-orange-500/20">
              <CardHeader>
                <CardTitle>High Intensity</CardTitle>
                <CardDescription>Maximum flame effects</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-4">
                <FlameButton flameIntensity="high" variant="destructive" size="lg">
                  Click Me
                </FlameButton>
              </CardContent>
            </Card>
          </FlameElement>
        </div>
        
        {/* Interactive Area */}
        <div className="mt-16">
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Flame Playground</CardTitle>
              <CardDescription>
                Move your cursor around this area to see the flame effects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full flex items-center justify-center border rounded-lg p-8 bg-gradient-to-br from-background to-muted/30">
                <p className="text-center text-lg">
                  Move your cursor here to see flame trails. <br/>
                  Try clicking to create flame bursts!
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset Effects</Button>
              <FlameButton>Save Configuration</FlameButton>
            </CardFooter>
          </Card>
        </div>
        
        {/* Links and Text */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Interactive Elements</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                Our flame cursor automatically detects interactive elements like:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><a href="#" className="text-blue-500 hover:underline">Links</a> - hover over this link</li>
                <li><button className="text-primary hover:underline">Buttons</button> - try hovering here</li>
                <li>
                  <FlameElement intensity="high">
                    <span className="font-bold text-orange-500">Custom elements</span>
                  </FlameElement> - with special flame effects
                </li>
              </ul>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>How It Works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p>
                The flame cursor uses physics-based particle animations that dynamically respond to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Mouse movement speed</li>
                <li>Clicks and interactions</li>
                <li>Different types of UI elements</li>
                <li>Custom intensity settings</li>
              </ul>
              <p className="mt-4">
                Try moving your cursor quickly to see how the flames react to your movements!
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}