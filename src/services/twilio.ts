import twilio from 'twilio';

interface SendSmsArgs {
  to: string;
  body: string;
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

if (!accountSid || !authToken || !twilioPhoneNumber) {
  throw new Error('Twilio credentials are not configured in .env file');
}

const client = twilio(accountSid, authToken);

export async function sendSms({ to, body }: SendSmsArgs): Promise<void> {
  try {
    const message = await client.messages.create({
      body,
      from: twilioPhoneNumber,
      to,
    });
    console.log('SMS sent successfully. SID:', message.sid);
  } catch (error) {
    console.error('Failed to send SMS:', error);
    // In a real app, you might want to throw a more specific error
    // or handle different error cases from Twilio.
    throw new Error(`Twilio API error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
