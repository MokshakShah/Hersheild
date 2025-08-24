'use server';

/**
 * @fileOverview An AI agent that assesses the safety of a given location based on real-time data and user density.
 *
 * - assessSafety - A function that handles the safety assessment process.
 * - AssessSafetyInput - The input type for the assessSafety function.
 * - AssessSafetyOutput - The return type for the assessSafety function.
 */

import {ai} from '@/ai/genkit';
import { z } from "zod";
import { userDensityService } from '@/services/user-density';

const AssessSafetyInputSchema = z.object({
  latitude: z.number().describe('The latitude of the location to assess.'),
  longitude: z.number().describe('The longitude of the location to assess.'),
  accuracy: z.number().optional().describe('The accuracy of the GPS coordinates in meters.'),
  userDensity: z.number().optional().describe('Number of active internet users in 10-meter radius.'),
  timeOfDay: z.string().optional().describe('Current time of day for context.')
});

export type AssessSafetyInput = z.infer<typeof AssessSafetyInputSchema>;

const AssessSafetyOutputSchema = z.object({
  locationName: z.string().describe('The name of the location (e.g., "Central Park, New York" or "Main Street, Anytown").'),
  safetyLevel: z.enum(['green', 'orange', 'red']).describe('The safety zone based on user density: green (safe), orange (moderate), red (unsafe).'),
  userDensity: z.number().describe('Estimated number of active users in 10-meter radius.'),
  densityStatus: z.string().describe('Status of user density (e.g., "High activity", "Moderate activity", "Low activity").'),
  summary: z.string().describe('A brief summary of the safety assessment.'),
  recommendations: z.string().describe('Quick safety recommendations.'),
  responseTime: z.number().describe('Response time in milliseconds.'),
  confidence: z.number().describe('Confidence level of the assessment (0-1).'),
  dataSources: z.array(z.string()).describe('Data sources used for the assessment.')
});

export type AssessSafetyOutput = z.infer<typeof AssessSafetyOutputSchema>;

export async function assessSafety(input: AssessSafetyInput): Promise<AssessSafetyOutput> {
  const startTime = Date.now();
  
  try {
    // Get real-time user density
    const densityData = await userDensityService.getUserDensity(input.latitude, input.longitude, 10);
    
    // Get safety zone based on user density
    const safetyZone = userDensityService.getSafetyZone(densityData.count);
    
    // Get current time context
    const now = new Date();
    const timeOfDay = now.getHours() < 12 ? 'morning' : 
                     now.getHours() < 17 ? 'afternoon' : 
                     now.getHours() < 21 ? 'evening' : 'night';
    
    // Get location name using reverse geocoding
    const locationName = await getLocationName(input.latitude, input.longitude);
    
    // Get nearby safe zones for additional context
    const nearbyZones = await userDensityService.getNearbySafeZones(input.latitude, input.longitude, 500);
    const nearestGreenZone = nearbyZones.find(zone => zone.zone === 'green');
    
    // Create enhanced summary with nearby safe zones
    let enhancedSummary = safetyZone.description;
    if (nearestGreenZone && nearestGreenZone.distance < 200) {
      enhancedSummary += ` There's a safer area ${nearestGreenZone.distance}m away.`;
    }
    
    const responseTime = Date.now() - startTime;
    
    return {
      locationName,
      safetyLevel: safetyZone.zone,
      userDensity: densityData.count,
      densityStatus: safetyZone.description,
      summary: enhancedSummary,
      recommendations: safetyZone.recommendations.join('. '),
      responseTime,
      confidence: densityData.confidence,
      dataSources: densityData.sources
    };
    
  } catch (error) {
    console.error('Safety assessment error:', error);
    
    // Fallback assessment
    const fallbackDensity = 50;
    const fallbackZone = userDensityService.getSafetyZone(fallbackDensity);
    
    return {
      locationName: 'Location unavailable',
      safetyLevel: fallbackZone.zone,
      userDensity: fallbackDensity,
      densityStatus: fallbackZone.description,
      summary: 'Assessment unavailable. Using fallback safety guidelines.',
      recommendations: fallbackZone.recommendations.join('. '),
      responseTime: Date.now() - startTime,
      confidence: 0.3,
      dataSources: ['Fallback Estimation']
    };
  }
}

// Enhanced reverse geocoding with better location names
async function getLocationName(latitude: number, longitude: number): Promise<string> {
  try {
    // In a real implementation, use Google Maps Geocoding API or similar
    // For now, return a more descriptive location name based on coordinates
    
    const latStr = latitude.toFixed(4);
    const lngStr = longitude.toFixed(4);
    
    // Simple location type detection
    const isUrban = Math.abs(latitude) > 20 && Math.abs(longitude) > 20;
    const isDowntown = Math.abs(latitude) > 30 && Math.abs(longitude) > 30;
    
    let locationType = 'Area';
    if (isDowntown) locationType = 'Downtown Area';
    else if (isUrban) locationType = 'Urban Area';
    else locationType = 'Suburban Area';
    
    return `${locationType} (${latStr}, ${lngStr})`;
  } catch (error) {
    return 'Location unavailable';
  }
}

// Legacy flow for backward compatibility
const assessSafetyFlow = ai.defineFlow(
  {
    name: 'assessSafetyFlow',
    inputSchema: AssessSafetyInputSchema,
    outputSchema: AssessSafetyOutputSchema,
  },
  async input => {
    return await assessSafety(input);
  }
);
