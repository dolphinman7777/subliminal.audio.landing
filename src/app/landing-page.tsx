"use client"
import React, { ReactNode } from 'react'
import Link from 'next/link'
import Image from 'next/image' // Add this import
import { Button } from "@/components/ui/button"
import { Sparkles, Brain, Zap, Shield } from 'lucide-react'
import { cn } from "@/lib/utils"
import { ArrowRightIcon } from "@radix-ui/react-icons"
import { PulsatingButton } from "@/components/ui/pulsating-button"
import { keyframes } from "@emotion/react"
import HyperText from "@/components/ui/hyper-text"
import DotPattern from "@/components/ui/dot-pattern"

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
      "group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl p-8", // Increased padding and rounded corners
      // light styles
      "bg-white [box-shadow:0_0_0_1px_rgba(0,0,0,.03),0_2px_4px_rgba(0,0,0,.05),0_12px_24px_rgba(0,0,0,.05)]",
      // dark styles
      "transform-gpu dark:bg-black dark:[border:1px_solid_rgba(255,255,255,.1)] dark:[box-shadow:0_-20px_80px_-20px_#ffffff1f_inset]",
      className,
    )}
  >
    <div>{background}</div>
    <div className="pointer-events-none z-10 flex transform-gpu flex-col gap-2 transition-all duration-300 group-hover:-translate-y-10">
      <Icon className="h-16 w-16 origin-left transform-gpu text-neutral-700 transition-all duration-300 ease-in-out group-hover:scale-75 dark:text-neutral-300" />
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

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <DotPattern 
        width={40} 
        height={40} 
        cx={2} 
        cy={2} 
        cr={1.5} 
        className="opacity-30 dark:opacity-20 absolute inset-0 z-0" // Increased opacity
      />
      <RetroGrid className="absolute inset-0 z-10" angle={75} opacity={0.3} />
      <div className="relative z-20 flex flex-col min-h-screen">
        <header className="px-4 lg:px-6 h-32 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <div className="rounded-lg shadow-[0_20px_50px_rgba(8,_112,_184,_0.7)] dark:shadow-[0_20px_50px_rgba(255,_255,_255,_0.2)]">
              <Image
                src="/head.svg"
                alt="Subliminal.Studio Logo"
                width={120}
                height={120}
                className="w-30 h-30"
              />
            </div>
          </Link>
          <nav className="flex gap-4">
            <Button variant="ghost" className="text-base font-medium">Log in</Button>
            <PulsatingButton 
              className="text-base font-medium"
              pulseColor="#4F46E5"
              duration="2s"
            >
              Sign up
            </PulsatingButton>
          </nav>
        </header>
        <main className="flex-1 flex flex-col items-center justify-start py-20">
          <div className="container px-4 md:px-6 mb-32">
            <div className="flex flex-col items-center space-y-4 text-center">
              <HyperText
                text="Subliminal.Studio"
                className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl lg:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-indigo-600 dark:from-purple-400 dark:to-indigo-400"
                duration={1500}
                animateOnLoad={true}
              />
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                Unlock the power of your subconscious. Create, customize, and manifest your desires with AI-powered subliminal messaging.
              </p>
              <div className="space-x-4 mt-8">
                <RainbowButton>Get Started</RainbowButton>
                <Button variant="outline" className="text-purple-600 border-purple-600 hover:bg-purple-100 dark:text-purple-400 dark:border-purple-400 dark:hover:bg-purple-900">Learn More</Button>
              </div>
            </div>
          </div>
          <div className="container px-4 md:px-6 mb-32">
            <h2 className="text-3xl font-bold text-center mb-16 text-gray-800 dark:text-white">Our Features</h2>
            <BentoGrid>
              <BentoCard
                name="AI-Powered Customization"
                className="md:col-span-2"
                background={<div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />}
                Icon={Brain}
                description="Tailor your subliminal messages with advanced AI algorithms for maximum effectiveness."
                href="#"
                cta="Explore AI Features"
              />
              <BentoCard
                name="Rapid Integration"
                className=""
                background={<div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />}
                Icon={Zap}
                description="Seamlessly integrate subliminal content into your daily routine with our quick-start templates."
                href="#"
                cta="See Integration Options"
              />
              <BentoCard
                name="Privacy First"
                className=""
                background={<div className="absolute inset-0 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700" />}
                Icon={Shield}
                description="Your data and personal affirmations are encrypted and protected with industry-leading security measures."
                href="#"
                cta="Learn About Our Security"
              />
              <BentoCard
                name="Personalized Analytics"
                className="md:col-span-2"
                background={<div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600" />}
                Icon={Sparkles}
                description="Track your progress and optimize your subliminal strategy with detailed, personalized analytics."
                href="#"
                cta="View Analytics Demo"
              />
            </BentoGrid>
          </div>
          <div className="container px-4 md:px-6 mb-32">
            <h2 className="text-2xl font-bold text-center mb-12 text-gray-800 dark:text-white">How It Works</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Create</h3>
                <p className="text-gray-600 dark:text-gray-400">Design your personalized subliminal messages using our AI-powered system.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Listen</h3>
                <p className="text-gray-600 dark:text-gray-400">Integrate your custom audio into your daily routine with ease.</p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Transform</h3>
                <p className="text-gray-600 dark:text-gray-400">Experience positive changes as your subconscious mind absorbs the affirmations.</p>
              </div>
            </div>
          </div>
        </main>
        <footer className="py-6 text-center text-gray-500 dark:text-gray-400">
          © 2023 Subliminal.Studio. All rights reserved.
        </footer>
      </div>
    </div>
  )
}