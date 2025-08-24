"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { MapPin, Share2 } from "lucide-react";
import { useToast } from "../hooks/use-toast";
import { Skeleton } from "../components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "../components/ui/alert";

export function LiveLocation() {
  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      setLoading(false);
      return;
    }

    const watcher = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
            setError("Location access was denied. Please enable it in your browser settings.");
        } else {
            setError("Unable to retrieve your location at this time.");
        }
        console.error(err.message);
        setLoading(false);
      },
      {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
      }
    );

    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  const handleShare = () => {
    if (location) {
      const locationUrl = `https://www.google.com/maps?q=${location.lat},${location.lon}`;
      navigator.clipboard.writeText(locationUrl);
      toast({
        title: "Location Copied!",
        description: "A shareable Google Maps link is copied to your clipboard.",
      });
    } else {
       toast({
        title: "Error",
        description: "Could not get location to share.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          Live Location Sharing
        </CardTitle>
        <CardDescription>Keep trusted contacts updated with your real-time location.</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
           <div className="space-y-3 p-3">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-6 w-48" />
            </div>
        ) : error ? (
            <Alert variant="destructive">
                <AlertTitle>Location Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        ) : location ? (
          <div className="flex flex-col gap-2 p-3 bg-muted/50 rounded-lg">
            <p className="text-lg font-mono">Latitude: {location.lat.toFixed(5)}</p>
            <p className="text-lg font-mono">Longitude: {location.lon.toFixed(5)}</p>
          </div>
        ) : null}
      </CardContent>
      <CardFooter>
        <Button onClick={handleShare} disabled={!location || loading}>
          <Share2 className="mr-2 h-4 w-4" />
          Share Location Link
        </Button>
      </CardFooter>
    </Card>
  );
}
