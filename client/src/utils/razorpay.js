let loadPromise = null;

export function loadRazorpayScript() {
  if (typeof window !== 'undefined' && window.Razorpay) {
    return Promise.resolve();
  }

  if (!loadPromise) {
    loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Razorpay SDK'));
      document.body.appendChild(script);
    });
  }

  return loadPromise;
}
