declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayPaymentOptions {
  amount: number; // in INR
  orderNumber: string;
  customerPhone?: string;
  customerName?: string;
  onSuccess: (paymentId: string) => void;
  onDismiss?: () => void;
}

export async function processRazorpayPayment(options: RazorpayPaymentOptions): Promise<void> {
  const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID;

  // If Razorpay SDK is available and key is configured
  if (typeof window !== 'undefined' && window.Razorpay && razorpayKey && razorpayKey.startsWith('rzp_')) {
    // 1. Create official Razorpay Order ID (required by NPCI/Razorpay for UPI, Google Pay & QR codes)
    let orderId: string | undefined;
    try {
      const res = await fetch('/api/create-razorpay-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: options.amount,
          receipt: options.orderNumber,
        }),
      });
      if (res.ok) {
        const orderData = await res.json();
        if (orderData && orderData.id) {
          orderId = orderData.id;
        }
      }
    } catch (err) {
      console.warn('Could not create server order_id, falling back to client mode:', err);
    }

    return new Promise((resolve) => {
      const rzpOptions: any = {
        key: razorpayKey,
        amount: Math.round(options.amount * 100), // paise
        currency: 'INR',
        name: 'Smart Dining',
        description: `Order ${options.orderNumber}`,
        image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=128&auto=format&fit=crop&q=80',
        ...(orderId ? { order_id: orderId } : {}),
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
        },
        prefill: {
          contact: options.customerPhone || '9876543210',
          name: options.customerName || 'Dining Guest',
          method: 'upi',
        },
        theme: {
          color: '#800020',
        },
        handler: (response: any) => {
          options.onSuccess(response.razorpay_payment_id || `pay_${Date.now()}`);
          resolve();
        },
        modal: {
          ondismiss: () => {
            if (options.onDismiss) options.onDismiss();
            resolve();
          },
        },
      };

      const rzp = new window.Razorpay(rzpOptions);
      rzp.open();
    });
  }

  // Graceful test/sandbox simulation fallback
  return new Promise((resolve) => {
    // Generate simulated payment id
    setTimeout(() => {
      const mockPayId = 'pay_sim_' + Math.random().toString(36).substring(2, 10).toUpperCase();
      options.onSuccess(mockPayId);
      resolve();
    }, 1200);
  });
}
