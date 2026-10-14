export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { amount, receipt } = req.body || {};
  const keyId = process.env.VITE_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    return res.status(400).json({ error: 'Missing Razorpay credentials' });
  }

  const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
  try {
    const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount) * 100),
        currency: 'INR',
        receipt: (receipt || `rcpt_${Date.now()}`).substring(0, 40),
      }),
    });

    const data = await rzpRes.json();
    return res.status(rzpRes.status).json(data);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
