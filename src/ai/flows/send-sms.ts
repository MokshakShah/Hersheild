'use server';

/**
 * @fileOverview A flow for sending SMS messages using Twilio.
 *
 * - sendSms - A function that sends an SMS message to a list of recipients.
 * - SendSmsInput - The input type for the sendSms function.
 */

import { sendSms as sendSmsService } from '@/services/twilio';
import { type SendSmsInput } from '@/ai/types';


export async function sendSms(input: SendSmsInput): Promise<void> {
    // In a real app, you might have more logic here, like logging, error handling, etc.
    for (const recipient of input.to) {
        await sendSmsService({ to: recipient, body: input.body });
    }
}
