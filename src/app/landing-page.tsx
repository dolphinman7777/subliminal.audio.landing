"use client"
import React, { ReactNode, useState, useLayoutEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Sparkles, Brain, Zap, Shield, Headphones } from 'lucide-react'
import { cn } from "@/lib/utils"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { PulsatingButton } from "@/components/ui/pulsating-button"
import { keyframes } from "@emotion/react"
import HyperText from "@/components/ui/hyper-text"
import DotPattern from "@/components/ui/dot-pattern"
import { AnimatePresence, motion } from 'framer-motion';
import { SignUpButton, SignInButton, useAuth } from "@clerk/nextjs";
import { useRouter } from 'next/navigation';

// Add this array of sentences at the top of your file, outside of any component
const mindSoftwareSentences = [
  "Upgrade the software running in your mind",
  "Reprogram the way your mind operates",
  "Upgrade the mental software shaping your thoughts",
  "Install a new mindset for better outcomes",
  "Rewrite the mental code that guides your thinking",
  "Refresh the system driving your thoughts",
  "Transform the inner programming that directs your life",
  "Update the mental framework that runs your thoughts",
  "Shift the mental software that influences your reality"
];

interface RetroGridProps {
  className?: string;
  angle?: number;
  opacity?: number;
}

function RetroGrid({
  className,
  angle = 65,
  opacity = 0.5,
}: RetroGridProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 overflow-hidden [perspective:200px]",
        className,
      )}
      style={{ 
        "--grid-angle": `${angle}deg`,
        "--grid-opacity": opacity,
      } as React.CSSProperties}
    >
      <div className="absolute inset-0 [transform:rotateX(var(--grid-angle))]">
        <div
          className={cn(
            "animate-grid",
            "[background-repeat:repeat] [background-size:60px_60px] [height:400vh] [inset:-100%_0px] [margin-left:-50%] [transform-origin:100%_0_0] [width:600vw]",
            "opacity-[var(--grid-opacity)]",
            // Light Styles
            "[background-image:linear-gradient(to_right,rgba(0,0,0,0.3)_1px,transparent_0),linear-gradient(to_bottom,rgba(0,0,0,0.3)_1px,transparent_0)]",
            // Dark styles
            "dark:[background-image:linear-gradient(to_right,rgba(255,255,255,0.2)_1px,transparent_0),linear-gradient(to_bottom,rgba(255,255,255,0.2)_1px,transparent_0)]",
          )}
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white to-white dark:via-black dark:to-black" />
    </div>
  );
}

interface RainbowButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

function RainbowButton({ children, ...props }: RainbowButtonProps) {
  return (
    <button
      className={cn(
        "h-11 px-8 py-2 inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 relative group animate-rainbow cursor-pointer border-0 bg-[length:200%] text-primary-foreground [background-clip:padding-box,border-box,border-box] [background-origin:border-box] [border:calc(0.08*1rem)_solid_transparent]",

        // before styles
        "before:absolute before:bottom-[-20%] before:left-1/2 before:z-0 before:h-1/5 before:w-3/5 before:-translate-x-1/2 before:animate-rainbow before:bg-[linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))] before:bg-[length:200%] before:[filter:blur(calc(0.8*1rem))]",

        // light mode colors
        "bg-[linear-gradient(#121213,#121213),linear-gradient(#121213_50%,rgba(18,18,19,0.6)_80%,rgba(18,18,19,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",

        // dark mode colors
        " dark:bg-[linear-gradient(#fff,#fff),linear-gradient(#fff_50%,rgba(255,255,255,0.6)_80%,rgba(0,0,0,0)),linear-gradient(90deg,hsl(var(--color-1)),hsl(var(--color-5)),hsl(var(--color-3)),hsl(var(--color-4)),hsl(var(--color-2)))]",
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const BentoGrid = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "grid w-full auto-rows-[320px] grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8", // Increased row height and gap
        className,
      )}
    >
      {children}
    </div>
  );
};

// Add this keyframe animation
const glowAnimation = keyframes`
  0%, 100% { filter: drop-shadow(0 0 5px rgba(147, 51, 234, 0.7)); }
  50% { filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.9)); }
`;

const BentoCard = ({
  name,
  className,
  background,
  Icon,
  description,
  href,
  cta,
}: {
  name: string;
  className: string;
  background: ReactNode;
  Icon: any;
  description: string;
  href: string;
  cta: string;
}) => (
  <div
    key={name}
    className={cn(
      "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl p-8",
      // light styles
      "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className,
    )}
  >
    <div>{background}</div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-2 transition-all duration-300 group-hover:-translate-y-10">
      <Icon 
        className={cn(
          "h-16 w-16 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75 dark:text-neutral-300",
          name === "A.I Powered Affirmation Generation" && "animate-glow" // Apply animation only to the Brain icon
        )}
      />
      <h3 className="text-2xl font-semibold text-neutral-700 dark:text-neutral-300">
        {name}
      </h3>
      <p className="max-w-lg text-lg text-neutral-400">{description}</p>
    </div>

    <div
      className={cn(
        "pointer-events-none absolute bottom-8 left-8 right-8 flex translate-y-10 transform-gpu flex-row items-center opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100",
      )}
    >
      <Button variant="ghost" asChild size="lg" className="pointer-events-auto">
        <a href={href}>
          {cta}
          <ArrowRightIcon className="ml-2 h-5 w-5" />
        </a>
      </Button>
    </div>
    <div className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10" />
  </div>
);

const pulseKeyframes = keyframes`
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .5;
  }
`;

const rippleKeyframes = keyframes`
  0% {
    transform: scale(0.8);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
`;

const LandingPage: React.FC = () => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);

  useLayoutEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentSentenceIndex((prevIndex) => 
        (prevIndex + 1) % mindSoftwareSentences.length
      );
    }, 5000);

    return () => clearInterval(intervalId);
  }, []);

  // Remove the useEffect hook that was causing the redirection

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <DotPattern 
        width={40} 
        height={40} 
        cx={2} 
        cy={2} 
        cr={1.5} 
        className="opacity-30 dark:opacity-20 absolute inset-0 z-0"
      />
      <RetroGrid className="absolute inset-0 z-10" angle={75} opacity={0.3} />
      <div className="relative z-20 flex flex-col min-h-screen">
        <header className="fixed top-0 left-0 right-0 px-4 lg:px-6 h-32 flex items-center justify-between bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900 z-50">
          <Link href="/" className="flex items-center">
            <div className="rounded-lg shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] dark:shadow-[0_20px_50px_rgba(255,_255,_255,_0.2)] transition-all duration-300 hover:scale-105">
              <Image
                src="/head.svg"
                alt="Subliminal.Studio Logo"
                width={120}
                height={120}
                className="w-30 h-30"
                priority
              />
            </div>
          </Link>
          <nav className="flex gap-4">
            <SignInButton mode="modal">
              <Button variant="ghost" className="text-base font-medium">
                Log in
              </Button>
            </SignInButton>
            <SignUpButton mode="modal">
              <PulsatingButton 
                className="text-base font-medium"
                pulseColor="#4F46E5"
                duration="2s"
              >
                Sign up
              </PulsatingButton>
            </SignUpButton>
            {isSignedIn && (
              <Button 
                variant="outline" 
                className="text-base font-medium"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            )}
          </nav>
        </header>
        <main className="flex-1 flex flex-col items-center justify-start py-20 mt-32">
          <div className="container px-4 md:px-6 mb-32">
            <div className="flex flex-col items-center space-y-4 text-center">
              <HyperText
                text="Subliminal.Studio"
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400"
                duration={1500}
                animateOnLoad={true}
              />
              <div className="h-20 overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSentenceIndex}
                    initial={{ opacity: 0, transform: 'translateY(20px)' }}
                    animate={{ opacity: 1, transform: 'translateY(0)' }}
                    exit={{ opacity: 0, transform: 'translateY(-20px)' }}
                    transition={{ duration: 0.5 }}
                    className="transition-all duration-500 ease-in-out"
                  >
                    <HyperText
                      text={mindSoftwareSentences[currentSentenceIndex]}
                      className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400"
                      duration={800}
                      animateOnLoad={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
          <div className="container px-4 md:px-6 mb-32">
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-800 dark:text-white">Our Features</h2>
            <BentoGrid>
              <BentoCard
                name="A.I Powered Affirmation Generation"
                className="md:col-span-2"
                background={<div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />}
                Icon={Brain}
                description="Harness AI to create custom affirmations."
                href="#"
                cta="Explore AI Features"
              />
              <BentoCard
                name="Rapid Integration"
                className=""
                background={<div className="absolute inset-0 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900 dark:to-blue-800" />}
                Icon={Zap}
                description="Seamlessly integrate our affirmations into your daily routine."
                href="#"
                cta="Learn More"
              />
              <BentoCard
                name="Personalized Experience"
                className=""
                background={<div className="absolute inset-0 bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900 dark:to-green-800" />}
                Icon={Shield}
                description="Tailor your affirmations to your specific goals and needs."
                href="#"
                cta="Customize Now"
              />
              <BentoCard
                name="Audio Customization"
                className=""
                background={<div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-purple-200 dark:from-purple-900 dark:to-purple-800" />}
                Icon={Headphones}
                description="Create unique audio experiences with customizable background tracks and voices."
                href="#"
                cta="Explore Audio Options"
              />
            </BentoGrid>
          </div>
        </main>
        <footer className="py-6 text-center text-gray-500 dark:text-gray-400">
          © 2023 Subliminal.Studio. All rights reserved.
        </footer>
      </div>
      <style jsx global>{`
        @keyframes glow {
          0%, 100% { filter: drop-shadow(0 0 5px rgba(147, 51, 234, 0.7)); }
          50% { filter: drop-shadow(0 0 20px rgba(147, 51, 234, 0.9)); }
        }
        .animate-glow {
          animation: glow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;