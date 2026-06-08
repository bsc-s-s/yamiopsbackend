import { env } from '../../config/env.js';

export async function sendWhatsApp(to, message) {
  if (!env.whatsappApiKey || !env.whatsappPhoneNumber) {
    console.log('⚠️ WhatsApp no configurado. Mensaje no enviado:', { to, message });
    return { success: false, error: 'WhatsApp no configurado' };
  }
  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${env.whatsappApiKey}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${env.whatsappApiKey}:${env.whatsappApiKey}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          From: `whatsapp:${env.whatsappPhoneNumber}`,
          To: `whatsapp:${to}`,
          Body: message,
        }),
      }
    );
    const data = await response.json();
    if (!response.ok) {
      console.error('❌ Error WhatsApp:', data);
      return { success: false, error: data.message };
    }
    console.log('✅ WhatsApp enviado a:', to);
    return { success: true, data };
  } catch (err) {
    console.error('❌ Error WhatsApp:', err.message);
    return { success: false, error: err.message };
  }
}
