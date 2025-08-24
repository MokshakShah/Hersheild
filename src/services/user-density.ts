export interface UserDensityData {
  count: number;
  radius: number; // in meters
  timestamp: number;
  confidence: number; // 0-1
  sources: string[];
}

export interface DensityZone {
  zone: 'green' | 'orange' | 'red';
  threshold: number;
  description: string;
  recommendations: string[];
}

export class UserDensityService {
  private readonly GREEN_THRESHOLD = 110; // 110+ users = green zone
  private readonly ORANGE_THRESHOLD = 50; // 50-109 users = orange zone
  private readonly RED_THRESHOLD = 49; // 0-49 users = red zone

  // Get real-time user density for a location
  async getUserDensity(latitude: number, longitude: number, radius: number = 10): Promise<UserDensityData> {
    try {
      // In a real implementation, this would integrate with:
      // 1. Mobile network APIs (cell tower data)
      // 2. WiFi hotspot APIs
      // 3. Social media location APIs
      // 4. IoT device networks
      // 5. Public WiFi networks
      
      const density = await this.simulateRealTimeDensity(latitude, longitude, radius);
      
      return {
        count: density,
        radius,
        timestamp: Date.now(),
        confidence: this.calculateConfidence(latitude, longitude),
        sources: this.getDataSources(latitude, longitude)
      };
    } catch (error) {
      console.error('Error getting user density:', error);
      return this.getFallbackDensity(radius);
    }
  }

  // Simulate real-time density based on location patterns
  private async simulateRealTimeDensity(latitude: number, longitude: number, radius: number): Promise<number> {
    // Base density calculation
    let baseDensity = Math.floor(Math.random() * 150) + 20; // 20-170 users
    
    // Time-based adjustments
    const hour = new Date().getHours();
    let timeMultiplier = 1;
    
    if (hour >= 6 && hour <= 9) timeMultiplier = 1.2; // Morning rush
    else if (hour >= 17 && hour <= 19) timeMultiplier = 1.3; // Evening rush
    else if (hour >= 22 || hour <= 5) timeMultiplier = 0.4; // Late night
    
    // Location-based adjustments
    const locationMultiplier = this.getLocationMultiplier(latitude, longitude);
    
    // Day of week adjustments
    const dayOfWeek = new Date().getDay();
    const dayMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 0.8 : 1.1; // Weekend vs weekday
    
    // Weather impact (simplified)
    const weatherMultiplier = this.getWeatherMultiplier();
    
    const finalDensity = Math.floor(baseDensity * timeMultiplier * locationMultiplier * dayMultiplier * weatherMultiplier);
    
    // Ensure density is within reasonable bounds
    return Math.max(0, Math.min(200, finalDensity));
  }

  // Get location type multiplier
  private getLocationMultiplier(latitude: number, longitude: number): number {
    // Simplified urban/rural detection
    const isUrban = Math.abs(latitude) > 20 && Math.abs(longitude) > 20;
    const isDowntown = Math.abs(latitude) > 30 && Math.abs(longitude) > 30;
    
    if (isDowntown) return 1.8; // High density urban
    if (isUrban) return 1.4; // Urban area
    return 0.7; // Rural/suburban
  }

  // Get weather impact multiplier
  private getWeatherMultiplier(): number {
    // In real implementation, this would check weather APIs
    const hour = new Date().getHours();
    const isNight = hour >= 22 || hour <= 6;
    const isRaining = Math.random() > 0.7; // Simulate 30% chance of rain
    
    if (isRaining) return 0.6; // Rain reduces outdoor activity
    if (isNight) return 0.5; // Night reduces activity
    return 1.0; // Normal conditions
  }

  // Calculate confidence level based on data quality
  private calculateConfidence(latitude: number, longitude: number): number {
    // In real implementation, this would be based on:
    // - Number of data sources available
    // - Quality of GPS signal
    // - Historical data availability
    // - Network coverage
    
    const baseConfidence = 0.8;
    const gpsQuality = Math.random() * 0.2; // 0-0.2 additional confidence
    const dataQuality = Math.random() * 0.1; // 0-0.1 additional confidence
    
    return Math.min(1.0, baseConfidence + gpsQuality + dataQuality);
  }

  // Get data sources for transparency
  private getDataSources(latitude: number, longitude: number): string[] {
    const sources = ['GPS Location'];
    
    // Simulate available data sources
    if (Math.random() > 0.5) sources.push('Mobile Network');
    if (Math.random() > 0.3) sources.push('WiFi Hotspots');
    if (Math.random() > 0.7) sources.push('Social Media Check-ins');
    if (Math.random() > 0.6) sources.push('IoT Devices');
    
    return sources;
  }

  // Get fallback density when primary sources fail
  private getFallbackDensity(radius: number): UserDensityData {
    return {
      count: 50, // Moderate density as fallback
      radius,
      timestamp: Date.now(),
      confidence: 0.3, // Low confidence for fallback
      sources: ['Fallback Estimation']
    };
  }

  // Determine safety zone based on user density
  getSafetyZone(userCount: number): DensityZone {
    if (userCount >= this.GREEN_THRESHOLD) {
      return {
        zone: 'green',
        threshold: this.GREEN_THRESHOLD,
        description: 'High Activity Zone - Well populated area',
        recommendations: [
          'Stay in well-lit areas',
          'Remain aware of surroundings',
          'High activity provides natural surveillance'
        ]
      };
    } else if (userCount >= this.ORANGE_THRESHOLD) {
      return {
        zone: 'orange',
        threshold: this.ORANGE_THRESHOLD,
        description: 'Moderate Activity Zone - Some activity present',
        recommendations: [
          'Exercise normal caution',
          'Stay alert to surroundings',
          'Consider moving to busier areas if unsafe'
        ]
      };
    } else {
      return {
        zone: 'red',
        threshold: this.RED_THRESHOLD,
        description: 'Low Activity Zone - Quiet area',
        recommendations: [
          'Exercise increased caution',
          'Stay on main roads',
          'Avoid isolated areas',
          'Consider moving to busier location'
        ]
      };
    }
  }

  // Get historical density trends for a location
  async getHistoricalTrends(latitude: number, longitude: number, days: number = 7): Promise<{
    average: number;
    peak: number;
    low: number;
    trend: 'increasing' | 'decreasing' | 'stable';
  }> {
    // In real implementation, this would query historical data
    const average = Math.floor(Math.random() * 100) + 30;
    const peak = average + Math.floor(Math.random() * 50);
    const low = Math.max(0, average - Math.floor(Math.random() * 30));
    const trends: ('increasing' | 'decreasing' | 'stable')[] = ['increasing', 'decreasing', 'stable'];
    const trend = trends[Math.floor(Math.random() * trends.length)];
    
    return { average, peak, low, trend };
  }

  // Get nearby safe zones (areas with high user density)
  async getNearbySafeZones(latitude: number, longitude: number, radius: number = 1000): Promise<{
    latitude: number;
    longitude: number;
    distance: number;
    userCount: number;
    zone: 'green' | 'orange' | 'red';
  }[]> {
    // In real implementation, this would query nearby areas
    const nearbyZones = [];
    const numZones = Math.floor(Math.random() * 5) + 2; // 2-6 nearby zones
    
    for (let i = 0; i < numZones; i++) {
      const distance = Math.floor(Math.random() * radius) + 50;
      const userCount = Math.floor(Math.random() * 200) + 20;
      const zone = this.getSafetyZone(userCount).zone;
      
      nearbyZones.push({
        latitude: latitude + (Math.random() - 0.5) * 0.01,
        longitude: longitude + (Math.random() - 0.5) * 0.01,
        distance,
        userCount,
        zone
      });
    }
    
    return nearbyZones.sort((a, b) => a.distance - b.distance);
  }
}

// Export singleton instance
export const userDensityService = new UserDensityService();

