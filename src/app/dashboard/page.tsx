"use client"

import React from 'react';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';
import LayoutSketch from '../LayoutSketch';

export default function DashboardPage() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, isLoaded, router]);

  if (!isLoaded) {
    return <p>Loading...</p>;
  }

  if (!isSignedIn) {
    return null; // This will prevent a flash of content before redirect
  }

  return <LayoutSketch />;
}