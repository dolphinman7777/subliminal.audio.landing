import dynamic from 'next/dynamic';
import React from 'react';

const PayPalScriptProvider = dynamic(
  () => import("@paypal/react-paypal-js").then((mod) => mod.PayPalScriptProvider),
  { ssr: false }
);

const initialOptions = {
  clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID,
  currency: "USD",
  intent: "capture",
};

export function PayPalWrapper({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider options={initialOptions}>
      {children}
    </PayPalScriptProvider>
  );
}