"use client"
import React, { Suspense } from 'react';
import dynamic from 'next/dynamic';

const HomePage = dynamic(() => import('./landing-page').then(mod => mod.default), {
  loading: () => <p>Loading...</p>,
});

const Page: React.FC = () => {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <ErrorBoundary>
        <HomePage />
      </ErrorBoundary>
    </Suspense>
  );
}

export default Page;

class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.log('Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong. Error: {this.state.error?.message}</h1>;
    }

    return this.props.children;
  }
}