// Service for pulsa purchases & balance check
// Adjust base URL to your backend endpoints
const baseUrl = '/api/pulsa';

// Telkomsel API Configuration
const TELKOMSEL_API_KEY = import.meta.env.VITE_TELKOMSEL_API_KEY || 'YOUR_TELKOMSEL_API_KEY';
const TELKOMSEL_API_URL = 'https://api.telkomsel.com/v1'; // Adjust based on actual Telkomsel endpoint

// Check balance for a Telkomsel number
export const checkTelkomselBalance = async (phone) => {
  try {
    // Normalize phone number (remove leading 0 if exists, add 62)
    let normalizedPhone = phone.replace(/^0/, '62');
    if (!normalizedPhone.startsWith('62')) {
      normalizedPhone = '62' + phone;
    }

    const res = await fetch(`${baseUrl}/check-balance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        phone: normalizedPhone,
        apiKey: TELKOMSEL_API_KEY 
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('pulsaService.checkTelkomselBalance', err);
    return { success: false, message: 'Gagal mengecek saldo', balance: null };
  }
};

// Buy pulsa
export const buyPulsa = async ({ phone, amount }) => {
  try {
    const res = await fetch(`${baseUrl}/buy`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone, amount }),
    });
    return await res.json();
  } catch (err) {
    console.error('pulsaService.buyPulsa', err);
    return { success: false, message: 'Network error' };
  }
};