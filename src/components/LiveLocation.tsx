"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MapPin, Share2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export function LiveLocation() {
  // Only run the watcher in the background, do not render any UI
  const watcherRef = useRef<number | null>(null);

  useEffect(() => {
    if (!navigator.geolocation) return;
    watcherRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const next = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        };
        try {
          localStorage.setItem('liveLocation', JSON.stringify(next));
        } catch {}
      },
      () => {},
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
    return () => {
      if (watcherRef.current !== null) {
        navigator.geolocation.clearWatch(watcherRef.current);
      }
    };
  }, []);
  return null;
}
