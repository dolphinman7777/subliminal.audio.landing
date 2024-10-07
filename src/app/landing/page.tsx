"use client"
import React, { useState } from 'react'
// ... (other imports remain the same)
import { SignUpButton, SignInButton, useAuth, SignIn, SignUp } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

const LandingPage: React.FC = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  React.useEffect(() => {
    if (isSignedIn) {
      router.push('/');
    }
  }, [isSignedIn, router]);

  // ... (rest of the component remains the same)

  return (
    // ... (existing JSX)
  );
};

export default LandingPage;