"use client"

import React from 'react';
import { LayoutSketch } from '../LayoutSketch';
import { useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

export default function LayoutSketchPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  if (!isSignedIn) {
    return null; // or a loading indicator
  }

  return <LayoutSketch />;
}