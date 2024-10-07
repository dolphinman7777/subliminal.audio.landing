"use client"
import React, { useState, useEffect } from 'react'
// ... (other imports remain the same)
import { SignUpButton, SignInButton, useAuth, SignIn, SignUp } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

// ... (other code remains the same)

const LayoutPage: React.FC = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [showSignIn, setShowSignIn] = useState(false);
  const [showSignUp, setShowSignUp] = useState(false);

  useEffect(() => {
    if (isSignedIn) {
      router.push('/layoutsketch');
    }
  }, [isSignedIn, router]);

  // ... (rest of the component remains the same)

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* ... (existing JSX) */}
      {showSignIn && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <SignIn afterSignInUrl="/layoutsketch" />
            <Button onClick={() => setShowSignIn(false)} className="mt-4">Close</Button>
          </div>
        </div>
      )}
      {showSignUp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg">
            <SignUp afterSignUpUrl="/layoutsketch" />
            <Button onClick={() => setShowSignUp(false)} className="mt-4">Close</Button>
          </div>
        </div>
      )}
      {/* ... (rest of the JSX) */}
    </div>
  );
};

export default LayoutPage;