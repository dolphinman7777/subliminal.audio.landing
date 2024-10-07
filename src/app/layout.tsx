"use client"

import React, { useEffect } from 'react';
import '@/styles/globals.css';
import { ClerkProvider } from '@clerk/nextjs';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  useEffect(() => {
    // This effect will run on the client side
    console.log('RootLayout mounted');
    return () => console.log('RootLayout unmounted');
  }, []);

  return (
    <React.Fragment>
      <ClerkProvider>
        <html lang="en">
          <head>
            <link rel="icon" href="/head.svg" type="image/svg+xml" />
            {/* Remove or update this line */}
            {/* <link
              rel="preload"
              href="/fonts/your-main-font.woff2"
              as="font"
              type="font/woff2"
              crossOrigin="anonymous"
            /> */}
            {/* Add similar preload links for other fonts you're using */}
          </head>
          <body>
            <React.StrictMode>
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </React.StrictMode>
          </body>
        </html>
      </ClerkProvider>
    </React.Fragment>
  );
}

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log('Layout Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong in the layout.</h1>;
    }

    return this.props.children;
  }
}
