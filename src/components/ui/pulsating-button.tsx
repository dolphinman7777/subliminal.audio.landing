import React from "react";
import { cn } from "@/lib/utils";

interface PulsatingButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  pulseColor?: string;
  duration?: string;
}

export function PulsatingButton({
  className,
  children,
  pulseColor = "#0096ff",
  duration = "1.5s",
  ...props
}: PulsatingButtonProps) {
  return (
    <button
      className={cn(
        "relative text-center cursor-pointer flex justify-center items-center rounded-lg text-white dark:text-black bg-blue-500 dark:bg-blue-500 px-4 py-2",
        "animate-pulse", // Add pulsating animation
        className,
      )}
      style={
        {
          "--pulse-color": pulseColor,
          "--duration": duration,
          animation: `pulse ${duration} cubic-bezier(0.4, 0, 0.6, 1) infinite`,
        } as React.CSSProperties
      }
      {...props}
    >
      <div className="relative z-10">{children}</div>
      <div 
        className="absolute top-1/2 left-1/2 size-full rounded-lg bg-inherit -translate-x-1/2 -translate-y-1/2"
        style={{
          animation: `ripple ${duration} cubic-bezier(0, 0, 0.2, 1) infinite`,
          backgroundColor: pulseColor,
        }}
      />
    </button>
  );
}