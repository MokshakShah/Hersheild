import { NextRequest, NextResponse } from 'next/server';
import { userDensityService } from '@/services/user-density';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get('lat');
    const lng = searchParams.get('lng');
    const radius = searchParams.get('radius') || '10';

    if (!lat || !lng) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lng' },
        { status: 400 }
      );
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    const radiusMeters = parseInt(radius);

    if (isNaN(latitude) || isNaN(longitude) || isNaN(radiusMeters)) {
      return NextResponse.json(
        { error: 'Invalid parameters: lat, lng, and radius must be numbers' },
        { status: 400 }
      );
    }

    // Get real-time user density
    const densityData = await userDensityService.getUserDensity(latitude, longitude, radiusMeters);
    
    // Get safety zone
    const safetyZone = userDensityService.getSafetyZone(densityData.count);
    
    // Get nearby safe zones
    const nearbyZones = await userDensityService.getNearbySafeZones(latitude, longitude, 1000);
    
    // Get historical trends
    const trends = await userDensityService.getHistoricalTrends(latitude, longitude, 7);

    return NextResponse.json({
      success: true,
      data: {
        current: {
          ...densityData,
          safetyZone: safetyZone.zone,
          safetyDescription: safetyZone.description,
          recommendations: safetyZone.recommendations
        },
        nearby: nearbyZones.slice(0, 5), // Top 5 nearby zones
        trends,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('User density API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { latitude, longitude, radius = 10, externalData } = body;

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Missing required parameters: latitude, longitude' },
        { status: 400 }
      );
    }

    // In a real implementation, you would:
    // 1. Validate external data sources
    // 2. Integrate with mobile network APIs
    // 3. Check WiFi hotspot data
    // 4. Query social media APIs
    // 5. Access IoT device networks

    // For now, simulate enhanced data with external sources
    const densityData = await userDensityService.getUserDensity(latitude, longitude, radius);
    
    // Enhance with external data if provided
    if (externalData) {
      // Process external data sources
      console.log('Processing external data:', externalData);
    }

    const safetyZone = userDensityService.getSafetyZone(densityData.count);

    return NextResponse.json({
      success: true,
      data: {
        ...densityData,
        safetyZone: safetyZone.zone,
        safetyDescription: safetyZone.description,
        recommendations: safetyZone.recommendations,
        externalDataProcessed: !!externalData,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('User density POST API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

