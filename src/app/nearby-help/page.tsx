// "use client";

// import { useEffect, useState } from "react";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/card";
// import { Badge } from "../../components/ui/badge";
// import { Button } from "../../components/ui/button";
// import { AlertTriangle, ExternalLink, Hospital, MapPin, Shield } from "lucide-react";
// import Link from "next/link";

// type PlaceType = "hospital" | "police";

// interface Place {
//   id: number;
//   lat: number;
//   lon: number;
//   tags: Record<string, string>;
//   type: PlaceType;
//   distanceM?: number;
// }

// function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
//   const toRad = (v: number) => (v * Math.PI) / 180;
//   const R = 6371000; // meters
//   const dLat = toRad(lat2 - lat1);
//   const dLon = toRad(lon2 - lon1);
//   const a = Math.sin(dLat/2)**2 + Math.cos(toRad(lat1))*Math.cos(toRad(lat2))*Math.sin(dLon/2)**2;
//   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
//   return R * c;
// }

// export default function NearbyHelpPage() {
//   const [position, setPosition] = useState<{ lat: number; lon: number } | null>(null);
//   const [hospitals, setHospitals] = useState<Place[]>([]);
//   const [police, setPolice] = useState<Place[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>("");
//   const [radius, setRadius] = useState<number>(2000);

//   useEffect(() => {
//     try {
//       const cached = localStorage.getItem('liveLocation');
//       if (cached) {
//         const parsed = JSON.parse(cached);
//         if (typeof parsed?.lat === 'number' && typeof parsed?.lon === 'number') {
//           setPosition({ lat: parsed.lat, lon: parsed.lon });
//           setLoading(false);
//           return;
//         }
//       }
//     } catch {}

//     if (navigator.geolocation) {
//       navigator.geolocation.getCurrentPosition(
//         (pos) => {
//           setPosition({ lat: pos.coords.latitude, lon: pos.coords.longitude });
//         },
//         (err) => {
//           setError(err.message || "Failed to get location");
//           setLoading(false);
//         },
//         { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
//       );
//     } else {
//       setError("Geolocation is not supported by your browser.");
//       setLoading(false);
//     }
//   }, []);

//   useEffect(() => {
//     const fetchOverpass = async (lat: number, lon: number, r: number) => {
//       setLoading(true);
//       try {
//         const query = `data=[out:json][timeout:25];(
//           node["amenity"="hospital"](around:${r},${lat},${lon});
//           node["amenity"="clinic"](around:${r},${lat},${lon});
//           node["amenity"="police"](around:${r},${lat},${lon});
//           way["amenity"="hospital"](around:${r},${lat},${lon});
//           way["amenity"="clinic"](around:${r},${lat},${lon});
//           way["amenity"="police"](around:${r},${lat},${lon});
//         );out center 50;`;
//         const url = `https://overpass-api.de/api/interpreter?${query}`;
//         const res = await fetch(url);
//         if (!res.ok) throw new Error(`Overpass error: ${res.status}`);
//         const data = await res.json();
//         const elements: any[] = data.elements || [];
//         const places: Place[] = elements.map((el) => ({
//           id: el.id,
//           lat: el.lat || el.center?.lat,
//           lon: el.lon || el.center?.lon,
//           tags: el.tags || {},
//           type: (el.tags?.amenity === "police" ? "police" : "hospital") as PlaceType,
//         })).filter(el => el.lat && el.lon);

//         const withDistance = places.map(p => ({
//           ...p,
//           distanceM: position ? Math.round(haversine(position.lat, position.lon, p.lat, p.lon)) : undefined
//         }));

//         setHospitals(withDistance.filter(p => p.type === "hospital").sort((a,b) => (a.distanceM||0)-(b.distanceM||0)));
//         setPolice(withDistance.filter(p => p.type === "police").sort((a,b) => (a.distanceM||0)-(b.distanceM||0)));
//       } catch (e: any) {
//         
//       } finally {
//         setLoading(false);
//       }
//     };

//     if (position) {
//       fetchOverpass(position.lat, position.lon, radius);
//     }
//   }, [position, radius]);

//   return (
//     <div className="flex items-center justify-center min-h-[300px] m-8">
//       <Card className="w-full max-w-xl">
//         <CardHeader>
//           <CardTitle className="flex items-center gap-2"><Shield className="h-5 w-5" /> <Link href="/nearby-help">Nearby Help</Link></CardTitle>
//           <CardDescription>Hospitals and police stations near your current location</CardDescription>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div className="flex flex-wrap items-center gap-3">
//             <div className="text-sm text-muted-foreground">Radius: {(radius/1000).toFixed(1)} km</div>
//             <div className="flex items-center gap-2">
//               <Button size="sm" variant="outline" onClick={() => setRadius(r => Math.max(500, r-500))} className="bg-white">-</Button>
//               <Badge variant="secondary">{radius} m</Badge>
//               <Button size="sm" variant="outline" onClick={() => setRadius(r => Math.min(5000, r+500))} className="bg-white">+</Button>
//             </div>
//             {error && <div className="text-sm text-red-600 flex items-center gap-1"><AlertTriangle className="h-4 w-4" /> {error}</div>}
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2"><Hospital className="h-4 w-4" /> Hospitals / Clinics</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {loading && <div className="text-sm text-muted-foreground">Loading nearby hospitals...</div>}
//                 {!loading && hospitals.length === 0 && <div className="text-sm text-muted-foreground">No hospitals found in this radius.</div>}
//                 {hospitals.slice(0,8).map(h => (
//                   <div key={h.id} className="text-sm mb-3">
//                     <div className="min-w-0">
//                       <div className="font-medium truncate">{h.tags.name || "Hospital/Clinic"}</div>
//                       {h.tags.phone && <div className="text-muted-foreground truncate">{h.tags.phone}</div>}
//                       {typeof h.distanceM === 'number' && <div className="text-muted-foreground">{(h.distanceM/1000).toFixed(2)} km away</div>}
//                     </div>
//                     {position && (
//                       <div className="mt-1">
//                         <Button variant="outline" size="sm" onClick={() => window.open(`https://www.google.com/maps/dir/${position.lat},${position.lon}/${h.lat},${h.lon}`, '_blank')} className="bg-white">
//                           Directions <ExternalLink className="h-4 w-4 ml-1" />
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader>
//                 <CardTitle className="flex items-center gap-2"><Shield className="h-4 w-4" /> Police Stations</CardTitle>
//               </CardHeader>
//               <CardContent className="space-y-3">
//                 {loading && <div className="text-sm text-muted-foreground">Loading nearby police stations...</div>}
//                 {!loading && police.length === 0 && <div className="text-sm text-muted-foreground">No police stations found in this radius.</div>}
//                 {police.slice(0,8).map(p => (
//                   <div key={p.id} className="text-sm mb-3">
//                     <div className="min-w-0">
//                       <div className="font-medium truncate">{p.tags.name || "Police Station"}</div>
//                       {p.tags.phone && <div className="text-muted-foreground truncate">{p.tags.phone}</div>}
//                       {typeof p.distanceM === 'number' && <div className="text-muted-foreground">{(p.distanceM/1000).toFixed(2)} km away</div>}
//                     </div>
//                     {position && (
//                       <div className="mt-1">
//                         <Button variant="outline" size="sm" onClick={() => window.open(`https://www.google.com/maps/dir/${position.lat},${position.lon}/${p.lat},${p.lon}`, '_blank')} className="bg-white">
//                           Directions <ExternalLink className="h-4 w-4 ml-1" />
//                         </Button>
//                       </div>
//                     )}
//                   </div>
//                 ))}
//               </CardContent>
//             </Card>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }


"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import {
  AlertTriangle,
  ExternalLink,
  Hospital,
  Shield,
} from "lucide-react";
import Link from "next/link";

type PlaceType = "hospital" | "police";

interface Place {
  id: number;
  lat: number;
  lon: number;
  tags: Record<string, string>;
  type: PlaceType;
  distanceM?: number;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const R = 6371000; // meters
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function NearbyHelpPage() {
  const [position, setPosition] = useState<{ lat: number; lon: number } | null>(
    null
  );
  const [hospitals, setHospitals] = useState<Place[]>([]);
  const [police, setPolice] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Radius fixed up to 1.5 km
  // Persist radius in localStorage
  const [radius, setRadius] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('nearbyRadius');
      if (stored) return parseInt(stored, 10);
    }
    return 1500;
  });

  // Persist radius to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('nearbyRadius', String(radius));
    }
  }, [radius]);

  // Get live location from localStorage or geolocation
  useEffect(() => {
    const updatePosition = () => {
      try {
        const cached = localStorage.getItem("liveLocation");
        if (cached) {
          const parsed = JSON.parse(cached);
          if (typeof parsed?.lat === "number" && typeof parsed?.lon === "number") {
            setPosition({ lat: parsed.lat, lon: parsed.lon });
            return;
          }
        }
      } catch {}

      if (!navigator.geolocation) {
        setError("Geolocation is not supported by your browser.");
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
        },
        (err) => {
          setError(err.message || "Failed to get location");
        },
        { enableHighAccuracy: false, timeout: 20000, maximumAge: 60000 }
      );
    };

    updatePosition();
    // Update every 60 seconds
    const interval = setInterval(updatePosition, 60000);
    return () => clearInterval(interval);
  }, []);

  // Fetch nearby places, update every 60 seconds if position or radius changes
  useEffect(() => {
    if (!position) return;

    let cancelled = false;

    const fetchOverpass = async () => {
      setLoading(true);
      try {
        const query = `
          [out:json][timeout:25];
          (
            node["amenity"="hospital"](around:${radius},${position.lat},${position.lon});
            node["amenity"="clinic"](around:${radius},${position.lat},${position.lon});
            node["amenity"="police"](around:${radius},${position.lat},${position.lon});
            way["amenity"="hospital"](around:${radius},${position.lat},${position.lon});
            way["amenity"="clinic"](around:${radius},${position.lat},${position.lon});
            way["amenity"="police"](around:${radius},${position.lat},${position.lon});
          );
          out center;
        `;

        const res = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
        );

        if (!res.ok) throw new Error("");

        const data = await res.json();
        const elements = data.elements || [];

        const places: Place[] = elements
          .map((el: any) => ({
            id: el.id,
            lat: el.lat || el.center?.lat,
            lon: el.lon || el.center?.lon,
            tags: el.tags || {},
            type: el.tags?.amenity === "police" ? "police" : "hospital",
          }))
          .filter((p: Place) => p.lat && p.lon)
          .map((p: Place) => ({
            ...p,
            distanceM: Math.round(
              haversine(
                position.lat,
                position.lon,
                p.lat,
                p.lon
              )
            ),
          }));

        if (!cancelled) {
          setHospitals(
            places
              .filter((p) => p.type === "hospital")
              .sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0))
          );

          setPolice(
            places
              .filter((p) => p.type === "police")
              .sort((a, b) => (a.distanceM ?? 0) - (b.distanceM ?? 0))
          );
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || "");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchOverpass();
    const interval = setInterval(fetchOverpass, 60000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [position, radius]);

  return (
    <div className="flex items-center justify-center min-h-[300px] m-8">
      <Card className="w-full max-w-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <Link href="/nearby-help">Nearby Help</Link>
          </CardTitle>
          <CardDescription>
            Hospitals and police stations within 1.5 km
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-muted-foreground">
              Radius: {(radius / 1000).toFixed(1)} km
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-white"
                onClick={() => setRadius((r) => Math.max(500, r - 250))}
                aria-label="Decrease radius"
              >
                -
              </Button>

              <Badge variant="secondary">{radius} m</Badge>

              <Button
                size="sm"
                variant="outline"
                className="bg-white"
                onClick={() => setRadius((r) => Math.min(1500, r + 250))}
                aria-label="Increase radius"
              >
                +
              </Button>
            </div>

            {error && (
              <div className="text-sm text-red-600 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" /> {error}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Hospitals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hospital className="h-4 w-4" /> Hospitals / Clinics
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading && <p className="text-sm">Loading...</p>}
                {!loading && hospitals.length === 0 && (
                  <p className="text-sm">No hospitals found.</p>
                )}
                {hospitals.slice(0, 8).map((h) => (
                  <div key={h.id} className="mb-3">
                    <div className="font-medium">
                      {h.tags.name || "Hospital / Clinic"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(h.distanceM! / 1000).toFixed(2)} km away
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 bg-white"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/${position?.lat},${position?.lon}/${h.lat},${h.lon}`,
                          "_blank"
                        )
                      }
                    >
                      Directions <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Police */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-4 w-4" /> Police Stations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading && <p className="text-sm">Loading...</p>}
                {!loading && police.length === 0 && (
                  <p className="text-sm">No police stations found.</p>
                )}
                {police.slice(0, 8).map((p) => (
                  <div key={p.id} className="mb-3">
                    <div className="font-medium">
                      {p.tags.name || "Police Station"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {(p.distanceM! / 1000).toFixed(2)} km away
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="mt-1 bg-white"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/dir/${position?.lat},${position?.lon}/${p.lat},${p.lon}`,
                          "_blank"
                        )
                      }
                    >
                      Directions <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
