"use client";

import Link from "next/link";
import { FeatureToggles } from "../components/FeatureToggler";
import { LiveLocation } from "../components/LiveLocation";
import { AuthStatus } from "../components/AuthStatus";
import { useToast } from "../hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { ActionButtons } from "../components/ActionButton";
import { SOSButton } from "../components/SOSButton";
import { PersonalContacts } from "../components/PersonalContacts";
import { sendEmergencySms } from "./actions";
import { Shield, User, Calendar } from "lucide-react";
import { NearbyServices } from "../components/NearbyServices";
import { getContacts, Contact } from "../services/contacts";
import { useEffect, useState } from "react";

export default function Home() {
  const { toast } = useToast();
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const [contacts, setContacts] = useState<Contact[]>([]);

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const fetchedContacts = await getContacts();
        setContacts(fetchedContacts);
      } catch (error) {
        console.error('Error fetching contacts:', error);
      }
    };

    fetchContacts();
  }, []);

  // Function to check location permissions
  const checkLocationPermission = () => {
    if (typeof window === 'undefined') return;
    
    if (!navigator.geolocation) {
      console.log('Geolocation not supported');
      return;
    }

    // Check if we can get the current position
    navigator.permissions?.query({ name: 'geolocation' }).then((result) => {
      // console.log('Location permission status:', result.state);
      
      if (result.state === 'denied') {
        toast({
          title: "Location Permission Denied",
          description: "Please enable location access in your browser settings to use SOS alerts.",
          variant: "destructive",
          duration: 5000,
        });
      } else if (result.state === 'prompt') {
        toast({
          title: "Location Permission Required",
          description: "Please allow location access when prompted to use SOS alerts.",
          variant: "default",
          duration: 5000,
        });
      }
    }).catch((error) => {
      console.log('Could not check location permission:', error);
    });
  };

  // Check location permission on component mount
  useEffect(() => {
    checkLocationPermission();
  }, []);

  // Simple location test function
  const testLocation = () => {
    console.log('🧪 Testing location access...');
    
    if (typeof window === 'undefined' || !navigator.geolocation) {
      toast({
        title: "Test Failed",
        description: "Geolocation not available",
        variant: "destructive",
      });
      return;
    }

    // Show loading toast
    toast({
      title: "📍 Getting Location...",
      description: "Please wait while we get your location...",
      duration: 3000,
    });

    // Try with low accuracy first (faster)
    const tryGetLocation = (highAccuracy = false) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          console.log('✅ Test location obtained:', { latitude, longitude, accuracy, highAccuracy });
          toast({
            title: "✅ Location Test Successful!",
            description: `Lat: ${latitude.toFixed(6)}, Long: ${longitude.toFixed(6)}, Accuracy: ${Math.round(accuracy)}m${highAccuracy ? ' (High Accuracy)' : ' (Low Accuracy)'}`,
            duration: 5000,
          });
        },
        (error) => {
          console.log('❌ Test location error:', error);
          
          // If low accuracy failed and we haven't tried high accuracy yet, try that
          if (!highAccuracy && error.code === error.TIMEOUT) {
            console.log('🔄 Retrying with high accuracy...');
            toast({
              title: "📍 Retrying with High Accuracy...",
              description: "Low accuracy failed, trying high accuracy...",
              duration: 2000,
            });
            setTimeout(() => tryGetLocation(true), 1000);
            return;
          }
          
          let errorMessage = "Location request failed. ";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage += "Permission denied. Please enable location access.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage += "Location information unavailable. Try moving to a different area.";
              break;
            case error.TIMEOUT:
              errorMessage += "Request timed out. Try again or check your GPS signal.";
              break;
            default:
              errorMessage += `Error: ${error.message}`;
          }
          
          toast({
            title: "❌ Location Test Failed",
            description: errorMessage,
            variant: "destructive",
            duration: 8000,
          });
        },
        {
          enableHighAccuracy: highAccuracy,
          timeout: highAccuracy ? 45000 : 20000, // Longer timeout for high accuracy
          maximumAge: highAccuracy ? 0 : 60000 // No cache for high accuracy
        }
      );
    };

    // Start with low accuracy
    tryGetLocation(false);
  };

  const handleSos = async () => {
    console.log('🚨 SOS button clicked');
    
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      console.log('❌ Not in browser environment');
      toast({
        title: "Error",
        description: "Cannot access location in this environment.",
        variant: "destructive",
      });
      return;
    }

    // Check if geolocation is supported
    if (!navigator.geolocation) {
      console.log('❌ Geolocation not supported');
      toast({
        title: "Location Error",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }

    console.log('✅ Geolocation supported, checking contacts...');

    // Check if we have emergency contacts
    const emergencyContacts = contacts.filter(contact => contact.isEmergency);
    const phoneNumbers = emergencyContacts.map(c => c.phoneNumber);

    if (phoneNumbers.length === 0) {
      toast({
        title: "⚠️ No Emergency Contacts",
        description: "Add emergency contacts to send alerts.",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "🚨 SOS Alert Triggered",
      description: "Getting your location to share with contacts...",
      variant: "destructive",
      duration: 3000,
    });

    try {
      console.log('📍 Requesting location...');
      // Request location with better options
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            console.log('✅ Location obtained:', pos.coords);
            resolve(pos);
          },
          (err) => {
            console.log('❌ Location error:', err);
            reject(err);
          },
          {
            enableHighAccuracy: false, // Changed to false for faster response
            timeout: 30000, // Increased to 30 seconds
            maximumAge: 60000 // Allow cached location up to 1 minute old
          }
        );
      });

      const { latitude, longitude } = position.coords;
      const locationUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
      const message = `🚨 SOS ALERT: Emergency situation! Please help me immediately. My current location is: ${locationUrl}`;

      // Send SMS to emergency contacts
      const response = await sendEmergencySms({ to: phoneNumbers, body: message });
      
      if (response.success) {
        toast({
          title: "✅ SOS Alert Sent Successfully!",
          description: `Emergency alert sent to ${phoneNumbers.length} contact${phoneNumbers.length !== 1 ? 's' : ''} with your location.`,
          variant: "destructive",
          duration: 8000,
        });
        
        // Log the location for debugging
        console.log('SOS Location obtained:', { latitude, longitude, locationUrl });
      } else {
        toast({
          title: "❌ SMS Failed",
          description: response.error || "Failed to send emergency SMS",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error("SOS Location Error:", error);
      
      let errorMessage = "Could not get your location. ";
      
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage += "Location permission denied. Please enable location access in your browser settings.";
          break;
        case error.POSITION_UNAVAILABLE:
          errorMessage += "Location information unavailable. Please try again.";
          break;
        case error.TIMEOUT:
          errorMessage += "Location request timed out. Please try again.";
          break;
        default:
          errorMessage += "An unknown error occurred. Please try again.";
      }
      
      toast({
        title: "🚨 Location Error",
        description: errorMessage,
        variant: "destructive",
        duration: 8000,
      });
    }
  };

  // Get current date and time
  const now = new Date();
  const currentTime = now.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  });
  const currentDate = now.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(180deg, #FFE6EC 0%, #FFD1DC 50%, #FFF5F7 100%)' }}>
      {/* Top bar with only alerts */}
      <div className="flex items-center justify-end px-4 py-2 bg-transparent">
        {/* SOS Button at top right */}
        <div className="mr-2">
          <SOSButton onSos={handleSos} />
        </div>
      </div>
      {/* Main Dashboard Content */}
      <div className="space-y-4 pb-20 relative">
        {/* Emergency Services and Nearby Help navigation */}
        <div className="pt-2 px-2">
          <div className="flex flex-row gap-8 items-center justify-center">
            <Link href="/emergency-service" className="flex-1 max-w-[270px]">
              <div className="flex items-center justify-center min-h-[135px] rounded-2xl bg-white border border-pink-200 hover:bg-pink-50 transition text-center shadow-sm">
                <span className="text-xl font-semibold">Emergency Service</span>
              </div>
            </Link>
            <Link href="/nearby-help" className="flex-1 max-w-[270px]">
              <div className="flex items-center justify-center min-h-[135px] rounded-2xl bg-white border border-pink-200 hover:bg-pink-50 transition text-center shadow-sm">
                <span className="text-xl font-semibold">Nearby Help</span>
              </div>
            </Link>
          </div>
        </div>

        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:grid-cols-3">
          <div className="grid gap-4 lg:col-span-2">
            <div className="grid gap-4 md:grid-cols-2">
              <ActionButtons />
              <FeatureToggles onSos={handleSos} />
            </div>
            {/* NearbyServices moved to /nearby-help */}
          </div>
          <div className="grid gap-4">
            {/* <AuthStatus /> removed as requested */}
            <PersonalContacts />
            <LiveLocation />
          </div>
        </div>
      </div>
    </div>
  );
}
