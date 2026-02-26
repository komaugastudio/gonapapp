// Service for pulsa purchases
// Adjust base URL to your backend endpoints
const baseUrl = '/api/pulsa';

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