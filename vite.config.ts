import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'razorpay-api',
        configureServer(server) {
          server.middlewares.use('/api/create-razorpay-order', async (req, res) => {
            if (req.method !== 'POST') {
              res.statusCode = 405;
              res.end('Method Not Allowed');
              return;
            }

            let body = '';
            req.on('data', (chunk) => {
              body += chunk;
            });

            req.on('end', async () => {
              try {
                const parsed = JSON.parse(body || '{}');
                const amount = Number(parsed.amount) || 100;
                const receipt = parsed.receipt || `rcpt_${Date.now()}`;

                const keyId = env.VITE_RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID;
                const keySecret = env.RAZORPAY_KEY_SECRET || process.env.RAZORPAY_KEY_SECRET;

                if (!keyId || !keySecret) {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing Razorpay credentials' }));
                  return;
                }

                const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
                const rzpRes = await fetch('https://api.razorpay.com/v1/orders', {
                  method: 'POST',
                  headers: {
                    Authorization: `Basic ${auth}`,
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({
                    amount: Math.round(amount * 100), // paise
                    currency: 'INR',
                    receipt: receipt.substring(0, 40),
                  }),
                });

                const data = await rzpRes.json();
                res.statusCode = rzpRes.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: err.message }));
              }
            });
          });
        },
      },
    ],
  };
});
