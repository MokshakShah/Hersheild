import { z } from 'genkit';

/**
 * @fileOverview Shared Zod schemas and TypeScript types for AI flows.
 */

// Schema for sending SMS messages.
export const SendSmsInputSchema = z.object({
  to: z.array(z.string()).describe('A list of phone numbers to send the SMS to.'),
  body: z.string().describe('The content of the SMS message.'),
});
export type SendSmsInput = z.infer<typeof SendSmsInputSchema>;
