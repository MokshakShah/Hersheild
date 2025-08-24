# Real-time User Density Integration Guide

## Overview

This guide explains how to integrate real external APIs to get actual user density data instead of simulated data. The current implementation uses simulated data, but can be easily connected to real data sources.

## Current Implementation

The system currently simulates user density based on:
- Time of day patterns
- Location type (urban/rural)
- Day of week
- Weather conditions (simplified)

## Real API Integration Options

### 1. Mobile Network APIs

**Providers:**
- **Google Maps Platform** - Population density data
- **OpenSignal** - Network coverage and user density
- **Cell Tower APIs** - Real-time device connections

**Integration Example:**
```typescript
// In src/services/user-density.ts
async function getMobileNetworkDensity(lat: number, lng: number): Promise<number> {
  const response = await fetch(`https://api.mobile-provider.com/density?lat=${lat}&lng=${lng}&radius=10`);
  const data = await response.json();
  return data.activeDevices;
}
```

### 2. WiFi Hotspot APIs

**Providers:**
- **WiFi Map API** - Public WiFi hotspots and user counts
- **Google Places API** - Business density and activity
- **Foursquare Places API** - Check-in data and venue density

**Integration Example:**
```typescript
async function getWiFiHotspotDensity(lat: number, lng: number): Promise<number> {
  const response = await fetch(`https://api.wifimap.com/hotspots?lat=${lat}&lng=${lng}&radius=10`);
  const hotspots = await response.json();
  return hotspots.reduce((sum, hotspot) => sum + hotspot.activeUsers, 0);
}
```

### 3. Social Media Location APIs

**Providers:**
- **Twitter API** - Geotagged tweets and user locations
- **Instagram Basic Display API** - Location-based posts
- **Facebook Places API** - Check-ins and location data

**Integration Example:**
```typescript
async function getSocialMediaDensity(lat: number, lng: number): Promise<number> {
  const response = await fetch(`https://api.twitter.com/2/tweets/search/recent?query=point_radius:[${lng} ${lat} 10km]`);
  const tweets = await response.json();
  return tweets.data.length; // Number of recent tweets in area
}
```

### 4. IoT Device Networks

**Providers:**
- **Helium Network** - IoT device density
- **Sigfox** - Connected device counts
- **LoRaWAN** - Network device density

**Integration Example:**
```typescript
async function getIoTDeviceDensity(lat: number, lng: number): Promise<number> {
  const response = await fetch(`https://api.helium.com/hotspots?lat=${lat}&lng=${lng}&radius=10`);
  const devices = await response.json();
  return devices.length;
}
```

## Implementation Steps

### Step 1: Update UserDensityService

Replace the simulation in `src/services/user-density.ts`:

```typescript
// Replace simulateRealTimeDensity with real API calls
async getUserDensity(latitude: number, longitude: number, radius: number = 10): Promise<UserDensityData> {
  try {
    // Get data from multiple sources
    const [mobileData, wifiData, socialData, iotData] = await Promise.all([
      getMobileNetworkDensity(latitude, longitude),
      getWiFiHotspotDensity(latitude, longitude),
      getSocialMediaDensity(latitude, longitude),
      getIoTDeviceDensity(latitude, longitude)
    ]);

    // Combine and weight the data
    const totalDensity = mobileData * 0.4 + wifiData * 0.3 + socialData * 0.2 + iotData * 0.1;
    
    return {
      count: Math.floor(totalDensity),
      radius,
      timestamp: Date.now(),
      confidence: calculateConfidence([mobileData, wifiData, socialData, iotData]),
      sources: ['Mobile Network', 'WiFi Hotspots', 'Social Media', 'IoT Devices']
    };
  } catch (error) {
    console.error('Error getting real user density:', error);
    return this.getFallbackDensity(radius);
  }
}
```

### Step 2: Add API Keys to Environment

Create `.env.local`:
```env
# Mobile Network APIs
MOBILE_NETWORK_API_KEY=your_key_here
OPENSIGNAL_API_KEY=your_key_here

# WiFi APIs
WIFI_MAP_API_KEY=your_key_here
GOOGLE_PLACES_API_KEY=your_key_here

# Social Media APIs
TWITTER_BEARER_TOKEN=your_token_here
INSTAGRAM_ACCESS_TOKEN=your_token_here

# IoT APIs
HELIUM_API_KEY=your_key_here
```

### Step 3: Create API Service Classes

Create `src/services/api-clients/` directory with separate service classes:

```typescript
// src/services/api-clients/mobile-network.ts
export class MobileNetworkAPI {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.MOBILE_NETWORK_API_KEY!;
  }

  async getDensity(lat: number, lng: number, radius: number): Promise<number> {
    // Implementation
  }
}

// Similar classes for WiFi, Social Media, IoT
```

### Step 4: Update API Endpoint

Enhance `src/app/api/user-density/route.ts` to use real data:

```typescript
export async function GET(request: NextRequest) {
  // ... existing code ...

  // Use real APIs instead of simulation
  const densityData = await userDensityService.getUserDensity(latitude, longitude, radiusMeters);
  
  // Add rate limiting and caching
  // Add error handling for API failures
  // Add fallback to simulation if APIs fail
}
```

## Safety Zone Thresholds

The system uses these thresholds based on real user density:

- **Green Zone (Safe)**: 110+ active users in 10m radius
- **Orange Zone (Moderate)**: 50-109 active users in 10m radius  
- **Red Zone (Unsafe)**: 0-49 active users in 10m radius

## Data Quality and Confidence

The confidence level is calculated based on:
- Number of available data sources
- API response quality
- Historical data consistency
- GPS accuracy

## Rate Limiting and Caching

Implement caching to avoid hitting API limits:

```typescript
// Cache results for 30 seconds to avoid API spam
const cacheKey = `${lat}-${lng}-${radius}`;
const cached = await redis.get(cacheKey);
if (cached) return JSON.parse(cached);

// Get fresh data
const data = await getRealDensity(lat, lng, radius);
await redis.setex(cacheKey, 30, JSON.stringify(data));
```

## Cost Considerations

- **Google Maps Platform**: $5 per 1000 requests
- **Twitter API**: Free tier available
- **WiFi Map**: $50/month for 10,000 requests
- **Helium Network**: Free for basic usage

## Privacy and Compliance

Ensure compliance with:
- GDPR for EU users
- CCPA for California users
- Local privacy laws
- API terms of service

## Testing

Test with real coordinates:
```bash
curl "http://localhost:3000/api/user-density?lat=40.7128&lng=-74.0060&radius=10"
```

## Monitoring

Monitor API health and performance:
- Response times
- Error rates
- Data quality
- Cost per request

## Fallback Strategy

Always maintain fallback to simulation:
1. Try real APIs first
2. If APIs fail, use cached data
3. If no cache, use simulation
4. Log all failures for debugging

