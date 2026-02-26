// Service for Gomart products and transactions
// Replace base URL with your actual backend API
const baseUrl = '/api/gomart';

export const fetchProducts = async () => {
  try {
    const res = await fetch(`${baseUrl}/products`);
    if (!res.ok) throw new Error('Fetch products failed');
    return await res.json();
  } catch (err) {
    console.error('gomartService.fetchProducts', err);
    // fallback to static list
    return [
      { id: 1, name: 'Air Mineral 600ml', price: 5000 },
      { id: 2, name: 'Snack Roti Bakar', price: 15000 },
      { id: 3, name: 'Pulsa 10k', price: 10000 },
      { id: 4, name: 'Minyak Goreng 1L', price: 20000 },
    ];
  }
};

export const submitOrder = async (cartItems) => {
  try {
    const res = await fetch(`${baseUrl}/order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: cartItems }),
    });
    return await res.json();
  } catch (err) {
    console.error('gomartService.submitOrder', err);
    return { success: false };
  }
};
