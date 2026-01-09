"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Zap, SmartphoneNfc } from "lucide-react";
import { EmergencyWait } from "./EmergencyWait";
import { useToast } from "../hooks/use-toast";

export function FeatureToggles({ onSos }: { onSos: () => void }) {
  const [isGestureOn, setIsGestureOn] = useState(false);
  const [isFallOn, setIsFallOn] = useState(false);
  const [showWait, setShowWait] = useState<null | "double-tap" | "fall">(null);
  const { toast } = useToast();

  const handleDoubleClick = useCallback(() => {
    console.log("Double tap detected!");
    setShowWait("double-tap");
  }, []);

  const handleDeviceMotion = useCallback((event: DeviceMotionEvent) => {
    const threshold = 20;
    const acceleration = event.accelerationIncludingGravity;
    if (acceleration && (Math.abs(acceleration.x ?? 0) > threshold || Math.abs(acceleration.y ?? 0) > threshold || Math.abs(acceleration.z ?? 0) > threshold)) {
      console.log("Potential fall detected!");
      setShowWait("fall");
      setIsFallOn(false); // Disable after triggering to prevent multiple alerts
    }
  }, []);

  useEffect(() => {
    if (isGestureOn) {
      document.addEventListener("dblclick", handleDoubleClick);
      return () => document.removeEventListener("dblclick", handleDoubleClick);
    }
  }, [isGestureOn, handleDoubleClick]);

  useEffect(() => {
    let motionListener: (event: DeviceMotionEvent) => void;
    if (isFallOn) {
        // For iOS 13+
        if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
            (DeviceMotionEvent as any).requestPermission()
            .then((permissionState: string) => {
                if (permissionState === 'granted') {
                    window.addEventListener("devicemotion", handleDeviceMotion);
                    motionListener = handleDeviceMotion;
                } else {
                    toast({ variant: 'destructive', title: 'Permission Denied', description: 'Motion sensor access is needed for fall detection.' });
                    setIsFallOn(false);
                }
            })
            .catch((error: any) => {
                 console.error(error);
                 toast({ variant: 'destructive', title: 'Error', description: 'Could not request motion sensor permission.' });
                 setIsFallOn(false);
            });
        } else {
             // For other browsers
             if (window.DeviceMotionEvent) {
                window.addEventListener("devicemotion", handleDeviceMotion);
                motionListener = handleDeviceMotion;
             } else {
                toast({ variant: 'destructive', title: 'Not Supported', description: 'Your browser does not support fall detection.' });
                setIsFallOn(false);
             }
        }
    }
      
    return () => {
        if (motionListener) {
            window.removeEventListener("devicemotion", motionListener);
        }
    }
  }, [isFallOn, handleDeviceMotion, toast]);

  return (
    <>
      {showWait && (
        <EmergencyWait
          triggerType={showWait}
          onTimeout={() => {
            setShowWait(null);
            onSos();
          }}
          onCancel={() => setShowWait(null)}
        />
      )}
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Automatic Alerts</CardTitle>
          <CardDescription>Activate gesture-based triggers for help.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border">
            <Label htmlFor="gesture-mode" className="flex flex-col gap-1">
              <span className="flex items-center gap-2 font-semibold">
                <Zap className="h-5 w-5 text-primary" />
                <span>Double-Tap Alert</span>
              </span>
              <span className="text-xs text-muted-foreground font-normal">Trigger SOS by double-tapping anywhere.</span>
            </Label>
            <Switch id="gesture-mode" checked={isGestureOn} onCheckedChange={setIsGestureOn} />
          </div>
          <div className="flex items-center justify-between space-x-2 p-3 rounded-lg border">
            <Label htmlFor="fall-mode" className="flex flex-col gap-1">
              <span className="flex items-center gap-2 font-semibold">
                <SmartphoneNfc className="h-5 w-5 text-primary" />
                <span>Fall Detection</span>
              </span>
               <span className="text-xs text-muted-foreground font-normal">Automatically sends alert on fall.</span>
            </Label>
            <Switch id="fall-mode" checked={isFallOn} onCheckedChange={setIsFallOn} />
          </div>
        </CardContent>
      </Card>
    </>
  );
}
