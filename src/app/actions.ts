'use server';

import { assessSafety, type AssessSafetyOutput } from '@/ai/flows/safety-assessment';
import { sendSms, type SendSmsInput } from '@/ai/flows/send-sms';

export async function runSafetyAssessment(latitude: number, longitude: number, accuracy: number): Promise<{ success: boolean, data?: AssessSafetyOutput, error?: string }> {
  try {
    const result = await assessSafety({ latitude, longitude, accuracy });
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in runSafetyAssessment:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: `Failed to assess safety: ${errorMessage}` };
  }
}

export async function sendEmergencySms(input: SendSmsInput): Promise<{ success: boolean, error?: string }> {
    try {
        await sendSms(input);
        return { success: true };
    } catch (error) {
        console.error("Error in sendEmergencySms:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, error: `Failed to send SMS: ${errorMessage}` };
    }
}
