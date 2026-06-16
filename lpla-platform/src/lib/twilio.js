import twilio from 'twilio';

function getClient() {
  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
}

export async function sendOtp(phoneNumber) {
  const client = getClient();
  return client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({ to: phoneNumber, channel: 'sms' });
}

export async function verifyOtp(phoneNumber, code) {
  const client = getClient();
  const check = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({ to: phoneNumber, code });
  return check.status === 'approved';
}
