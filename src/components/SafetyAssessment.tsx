"use client";

import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter, CardDescription } from "./ui/card";
import { Button } from "./ui/button";
import { runSafetyAssessment } from "../app/actions";
import { type AssessSafetyOutput } from "../ai/flows/safety-assessment";
import { Loader2, ShieldCheck, ShieldAlert, ShieldQuestion, MapPin, Users, Clock, Zap } from "lucide-react";
import { Badge } from "./ui/badge";
import { useToast } from "../hooks/use-toast";

const safetyLevelStyles: { [key: string]: { icon: React.ReactNode, badgeClass: string, color: string } } = {
  "green": { 
    icon: <ShieldCheck className="h-5 w-5 mr-1" />, 
    badgeClass: "bg-green-100 text-green-800 border-green-200 hover:bg-green-100",
    color: "text-green-600"
  },
  "orange": { 
    icon: <ShieldAlert className="h-5 w-5 mr-1" />, 
    badgeClass: "bg-orange-100 text-orange-800 border-orange-200 hover:bg-orange-100",
    color: "text-orange-600"
  },
  "red": { 
    icon: <ShieldAlert className="h-5 w-5 mr-1" />, 
    badgeClass: "bg-red-100 text-red-800 border-red-200 hover:bg-red-100",
    color: "text-red-600"
  },
};

export function SafetyAssessment() {
  const [assessment, setAssessment] = useState<AssessSafetyOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleAssess = async () => {
    setLoading(true);
    setAssessment(null);

    try {
      // Get location with better accuracy settings
      const position = await getCurrentPosition();
      const { latitude, longitude, accuracy } = position.coords;
      
      const result = await runSafetyAssessment(latitude, longitude, accuracy);
      
      if (result.success && result.data) {
        setAssessment(result.data);
        toast({ 
          title: "Assessment Complete", 
          description: `Response time: ${result.data.responseTime}ms`,
          action: <Badge variant="outline" className="text-xs">Fast</Badge>
        });
      } else {
        toast({ 
          title: "Assessment Failed", 
          description: result.error, 
          variant: "destructive" 
        });
      }
    } catch (error) {
      toast({ 
        title: "Location Error", 
        description: `Could not get location: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  // Improved location getting with better accuracy
  const getCurrentPosition = (): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 5000, // 5 seconds timeout
        maximumAge: 30000 // Accept cached location up to 30 seconds old
      };

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  };
  
  const currentStyle = assessment ? safetyLevelStyles[assessment.safetyLevel] : null;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Real-time Safety Assessment
        </CardTitle>
        <CardDescription>Instant safety rating based on real-time user density in your area.</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <div className="ml-3">
              <p className="font-medium">Analyzing your area...</p>
              <p className="text-sm">Checking user density in 10m radius</p>
            </div>
          </div>
        ) : assessment && currentStyle ? (
          <div className="space-y-6">
            {/* Location */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold text-sm text-muted-foreground flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-primary" />
                Location
              </h4>
              <p className="font-semibold text-lg mt-1">{assessment.locationName}</p>
            </div>

            {/* Safety Zone */}
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-sm text-muted-foreground">Safety Zone</h4>
                <Badge variant="outline" className={`text-base capitalize ${currentStyle.badgeClass}`}>
                  {currentStyle.icon}
                  {assessment.safetyLevel.toUpperCase()} ZONE
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">{assessment.densityStatus}</p>
            </div>

            {/* User Density */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="font-semibold text-sm text-muted-foreground flex items-center mb-2">
                <Users className="h-4 w-4 mr-2 text-primary" />
                Real-time User Density
              </h4>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{assessment.userDensity}</p>
                  <p className="text-sm text-muted-foreground">active users in 10m radius</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {assessment.userDensity >= 110 ? 'High Activity' : 
                     assessment.userDensity >= 50 ? 'Moderate Activity' : 'Low Activity'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {assessment.userDensity >= 110 ? 'Safe zone' : 
                     assessment.userDensity >= 50 ? 'Exercise caution' : 'High alert'}
                  </p>
                </div>
              </div>
            </div>

            {/* Performance */}
            <div className="p-3 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  Response Time
                </span>
                <span className="font-medium text-primary">{assessment.responseTime}ms</span>
              </div>
            </div>

            {/* Confidence Level */}
            <div className="p-3 border rounded-lg bg-muted/20">
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-muted-foreground">Confidence Level</span>
                <span className="font-medium text-primary">{Math.round(assessment.confidence * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${assessment.confidence * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Data Sources */}
            {assessment.dataSources && assessment.dataSources.length > 0 && (
              <div className="p-3 border rounded-lg bg-muted/20">
                <h4 className="font-semibold text-sm text-muted-foreground mb-2">Data Sources</h4>
                <div className="flex flex-wrap gap-1">
                  {assessment.dataSources.map((source, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {source}
                    </Badge>
                  ))}
                </div>
              </div>
            )}


            {/* Summary */}
            <div>
              <h4 className="font-semibold mb-2">Assessment Summary</h4>
              <p className="text-sm text-muted-foreground">{assessment.summary}</p>
            </div>

            {/* Recommendations */}
            <div>
              <h4 className="font-semibold mb-2">Safety Recommendations</h4>
              <p className="text-sm text-muted-foreground">{assessment.recommendations}</p>
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground flex flex-col items-center justify-center h-full">
            <ShieldQuestion className="h-12 w-12 mb-2" />
            <p className="font-medium mb-1">Ready to assess your area</p>
            <p className="text-sm">Get instant safety rating based on real-time user density</p>
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleAssess} disabled={loading} className="w-full">
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
              Analyzing...
            </>
          ) : (
            <>
              <Zap className="mr-2 h-4 w-4" />
              Assess My Area Now
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
