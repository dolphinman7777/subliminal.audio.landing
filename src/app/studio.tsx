"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, Clock, SlidersHorizontal, RepeatIcon, Volume2, X, Sparkles, ChevronDown, Loader2, Download, CreditCard, LogOut, Settings } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useClerk } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const inspirationPrompts = [
  "Radiant charisma",
  "Limitless abundance",
  "Magnetic energy",
  "Compassionate healing",
  "Unshakable confidence",
  "Manifesting miracles",
  "Creative genius",
  "Inner clarity",
  "Boundless vitality",
  "Graceful flow"
]

const AnimatedBentoBox = ({ children, className, gradient }) => {
  return (
    <motion.div
      className={`group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl p-8 ${className}`}
      whileHover={{ 
        scale: 1.01, // Reduced from 1.02 to 1.01 for a subtler effect
        boxShadow: "0 10px 15px -5px rgba(0, 0, 0, 0.1), 0 5px 5px -5px rgba(0, 0, 0, 0.04)",
        zIndex: 10
      }}
      transition={{ duration: 0.2 }} // Slightly faster transition
    >
      <div className={`absolute inset-0 ${gradient} transition-opacity duration-300`} />
      <div className="relative z-10 flex flex-col h-full">
        {children}
      </div>
      <motion.div
        className="pointer-events-none absolute inset-0 transform-gpu transition-all duration-300 group-hover:bg-black/[.03] group-hover:dark:bg-neutral-800/10"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }} // Slightly faster transition
      />
    </motion.div>
  );
};

function AffirmationSearch({ onAffirmationGenerated }: { onAffirmationGenerated: (affirmations: string[], audioUrl: string) => void }) {
  const [prompt, setPrompt] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTtsLoading, setIsTtsLoading] = useState(false)

  const inspirationalWords = [
    "Confidence", "Strength", "Success", "Love", "Potential", "Growth", "Peace",
    "Creativity", "Gratitude", "Resilience", "Joy", "Abundance", "Wisdom",
    "Courage", "Balance", "Harmony", "Focus", "Passion", "Determination", "Kindness"
  ];

  const skillsets = [
    "Leadership", "Communication", "Problem-solving", "Adaptability", "Teamwork",
    "Time management", "Critical thinking", "Emotional intelligence", "Networking",
    "Negotiation", "Public speaking", "Decision-making", "Creativity", "Innovation",
    "Analytical skills", "Strategic planning", "Conflict resolution", "Empathy",
    "Active listening", "Project management"
  ];

  const goals = [
    "Lose weight", "Run a marathon", "Learn a new language", "Start a business",
    "Write a book", "Travel to 10 countries", "Get a promotion", "Save for retirement",
    "Volunteer regularly", "Improve relationships", "Quit smoking", "Learn to code",
    "Reduce stress", "Eat healthier", "Meditate daily", "Read 50 books a year",
    "Pay off debt", "Learn to play an instrument", "Get organized", "Improve public speaking"
  ];

  const carouselRef1 = useRef<HTMLDivElement>(null);
  const carouselRef2 = useRef<HTMLDivElement>(null);
  const carouselRef3 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    [carouselRef1, carouselRef2, carouselRef3].forEach((ref, index) => {
      const carousel = ref.current;
      if (carousel) {
        const scrollWidth = carousel.scrollWidth;
        const animationDuration = scrollWidth / (40 + index * 10); // Slightly different speeds
        carousel.style.animationDuration = `${animationDuration}s`;
      }
    });
  }, []);

  const handleAddPrompt = (newPrompt: string) => {
    if (newPrompt.trim() && !tags.includes(newPrompt.trim())) {
      setTags([...tags, newPrompt.trim()])
      setPrompt('')
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove))
  }

  const generateAffirmation = async () => {
    if (tags.length === 0) return;

    setIsLoading(true)
    try {
      const response = await fetch('/api/generate-affirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: tags.join(', ') }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to generate affirmations: ${errorData.error || response.statusText}`);
      }

      const data = await response.json();
      const newAffirmations = data.affirmations;

      console.log('Generated affirmations:', newAffirmations);
      onAffirmationGenerated(newAffirmations, ''); // Pass empty string for audioUrl initially

      console.log('Sending request to text-to-speech API...');
      const ttsResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text: newAffirmations.join(' ')
        }),
      });

      if (!ttsResponse.ok) {
        const errorData = await ttsResponse.json();
        console.error('Text-to-speech error details:', errorData);
        throw new Error(`Failed to convert affirmations to speech: ${errorData.error || errorData.details || ttsResponse.statusText}`);
      }

      const ttsData = await ttsResponse.json();
      onAffirmationGenerated(newAffirmations, ttsData.audioUrl);
    } catch (error) {
      console.error('Error generating affirmations or converting to speech:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center space-x-2 mb-4">
        <Input
          type="text"
          placeholder="Enter your prompt..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="flex-grow"
        />
        <Button onClick={() => handleAddPrompt(prompt)}>Add</Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              size="icon" 
              className="relative overflow-hidden group"
            >
              <Sparkles className="h-4 w-4 relative z-10 text-purple-600" />
              <div className="absolute inset-0 bg-purple-400 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
              <div className="absolute inset-0 bg-purple-300 rounded-full blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300 animate-pulse animation-delay-150"></div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-lg rounded-md p-2">
            {inspirationPrompts.map((item, index) => (
              <DropdownMenuItem 
                key={index} 
                onSelect={() => handleAddPrompt(item)}
                className="cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 rounded px-2 py-1"
              >
                {item}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* New white bento box for tags and generate button */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-4">
        <div className="flex flex-wrap gap-1 mb-4">
          {tags.map((tag, index) => (
            <div key={index} className="flex items-center bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full text-xs">
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className="ml-1 text-purple-600 hover:text-purple-800 focus:outline-none"
                aria-label={`Remove ${tag} tag`}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
        <Button 
          onClick={generateAffirmation} 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg subtle-glow"
          disabled={isLoading || tags.length === 0}
        >
          {isLoading ? 'Generating...' : 'Generate Affirmations'}
        </Button>
      </div>
      
      {/* Inspirational Words Carousel */}
      <div className="mt-4 overflow-hidden">
        <div className="relative">
          <div
            ref={carouselRef1}
            className="flex animate-scroll whitespace-nowrap"
            style={{
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
            }}
          >
            {inspirationalWords.concat(inspirationalWords).map((word, index) => (
              <button
                key={index}
                onClick={() => handleAddPrompt(word)}
                className="inline-block px-3 py-1 mr-2 text-sm bg-purple-100 text-purple-800 rounded-full hover:bg-purple-200 transition-colors duration-300"
              >
                {word}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Skillsets Carousel */}
      <div className="mt-4 overflow-hidden">
        <div className="relative">
          <div
            ref={carouselRef2}
            className="flex animate-scroll whitespace-nowrap"
            style={{
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
              animationDirection: 'reverse', // Scrolling in opposite direction
            }}
          >
            {skillsets.concat(skillsets).map((skill, index) => (
              <button
                key={index}
                onClick={() => handleAddPrompt(skill)}
                className="inline-block px-3 py-1 mr-2 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 transition-colors duration-300"
              >
                {skill}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Goals Carousel */}
      <div className="mt-4 overflow-hidden">
        <div className="relative">
          <div
            ref={carouselRef3}
            className="flex animate-scroll whitespace-nowrap"
            style={{
              animationTimingFunction: 'linear',
              animationIterationCount: 'infinite',
            }}
          >
            {goals.concat(goals).map((goal, index) => (
              <button
                key={index}
                onClick={() => handleAddPrompt(goal)}
                className="inline-block px-3 py-1 mr-2 text-sm bg-green-100 text-green-800 rounded-full hover:bg-green-200 transition-colors duration-300"
              >
                {goal}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {isTtsLoading && (
        <p className="text-sm text-gray-500 mt-2">Converting to speech...</p>
      )}
    </div>
  )
}

function SubliminalAudioPlayer({ audioUrl, isLoading }: { audioUrl: string | null, isLoading: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [speedFactor, setSpeedFactor] = useState(1)
  const [isAnimating, setIsAnimating] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number>()

  const speedOptions = [
    { value: 0.5, label: '0.5x' },
    { value: 0.75, label: '0.75x' },
    { value: 1, label: 'Normal' },
    { value: 1.25, label: '1.25x' },
    { value: 1.5, label: '1.5x' },
    { value: 2, label: '2x' },
  ]

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
      audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
      audio.addEventListener('ended', () => setIsPlaying(false))
      return () => {
        audio.removeEventListener('loadedmetadata', () => setDuration(audio.duration))
        audio.removeEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
        audio.removeEventListener('ended', () => setIsPlaying(false))
      }
    }
  }, [])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = speedFactor;
    }
  }, [speedFactor]);

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
      setIsPlaying(!isPlaying)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 500) // Animation duration
    }
  }

  const skipToStart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const skipToEnd = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = duration
    }
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const handleSpeedChange = (value: string) => {
    setSpeedFactor(Number(value));
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">
        <span className="text-green-500 glow-effect">Audio</span>firmations
      </h2>
      
      <div className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-col justify-between h-[200px]">
        <div className="flex justify-between items-center">
          <Select value={speedFactor.toString()} onValueChange={handleSpeedChange}>
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Normal" />
            </SelectTrigger>
            <SelectContent>
              {speedOptions.map((option) => (
                <SelectItem key={option.value} value={option.value.toString()}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex justify-between text-sm">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <div className="flex justify-center space-x-3">
          <Button variant="outline" size="icon" onClick={skipToStart} className="w-10 h-10" disabled={isLoading}>
            <SkipBackIcon className="h-5 w-5" />
          </Button>
          <Button 
            variant={isPlaying ? "default" : "outline"} 
            size="icon"
            onClick={togglePlayPause}
            className={`w-10 h-10 ${isPlaying ? "bg-green-500 hover:bg-green-600" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : isPlaying ? (
              <PauseIcon className="h-5 w-5" />
            ) : (
              <PlayIcon className="h-5 w-5" />
            )}
          </Button>
          <Button variant="outline" size="icon" onClick={skipToEnd} className="w-10 h-10" disabled={isLoading}>
            <SkipForwardIcon className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Volume2 className="h-5 w-5 text-green-500" />
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-full"
            thumbClassName="bg-green-500 border-2 border-white"
            trackClassName="bg-green-200"
            rangeClassName="bg-green-500"
          />
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}

function AudioLayerPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [visualizationType, setVisualizationType] = useState<'wave' | 'frequency'>('wave')
  const [isAnimating, setIsAnimating] = useState(false)
  const [audioLayer, setAudioLayer] = useState('layer1')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const animationRef = useRef<number>()
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)

  useEffect(() => {
    const audio = audioRef.current
    if (audio) {
      audio.addEventListener('loadedmetadata', () => setDuration(audio.duration))
      audio.addEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
      audio.addEventListener('ended', () => setIsPlaying(false))
      return () => {
        audio.removeEventListener('loadedmetadata', () => setDuration(audio.duration))
        audio.removeEventListener('timeupdate', () => setCurrentTime(audio.currentTime))
        audio.removeEventListener('ended', () => setIsPlaying(false))
      }
    }
  }, [])

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
      analyserRef.current = audioContextRef.current.createAnalyser()
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioRef.current!)
      sourceRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)
    }

    if (isPlaying) {
      animationRef.current = requestAnimationFrame(animate)
    } else {
      cancelAnimationFrame(animationRef.current!)
    }
    return () => cancelAnimationFrame(animationRef.current!)
  }, [isPlaying, visualizationType])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume
    }
  }, [volume])

  const animate = () => {
    const canvas = canvasRef.current
    const analyser = analyserRef.current
    if (canvas && analyser) {
      const ctx = canvas.getContext('2d')!
      const WIDTH = canvas.width
      const HEIGHT = canvas.height

      if (visualizationType === 'wave') {
        analyser.fftSize = 2048
        const bufferLength = analyser.fftSize
        const dataArray = new Uint8Array(bufferLength)
        analyser.getByteTimeDomainData(dataArray)

        ctx.fillStyle = 'rgb(255, 255, 255)'
        ctx.fillRect(0, 0, WIDTH, HEIGHT)
        ctx.lineWidth = 2
        ctx.strokeStyle = 'rgb(0, 0, 0)'
        ctx.beginPath()

        const sliceWidth = WIDTH * 1.0 / bufferLength
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const v = dataArray[i] / 128.0
          const y = v * HEIGHT / 2

          if (i === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }

          x += sliceWidth
        }

        ctx.lineTo(canvas.width, canvas.height / 2)
        ctx.stroke()
      } else {
        analyser.fftSize = 2048
        const bufferLength = analyser.frequencyBinCount
        const dataArray = new Uint8Array(bufferLength)
        analyser.getByteFrequencyData(dataArray)

        ctx.fillStyle = 'rgb(255, 255, 255)'
        ctx.fillRect(0, 0, WIDTH, HEIGHT)

        const barWidth = (WIDTH / bufferLength) * 2.5
        let x = 0

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = (dataArray[i] / 255) * HEIGHT

          const gradient = ctx.createLinearGradient(0, HEIGHT, 0, HEIGHT - barHeight)
          gradient.addColorStop(0, 'rgb(0,0,0)')
          gradient.addColorStop(1, 'rgb(100,100,100)')
          
          ctx.fillStyle = gradient
          ctx.fillRect(x, HEIGHT - barHeight, barWidth, barHeight)

          x += barWidth + 1
        }

        ctx.fillStyle = 'rgb(0, 0, 0)'
        ctx.font = '10px Arial'
        ctx.fillText('0 Hz', 0, HEIGHT - 5)
        ctx.fillText('10 kHz', WIDTH / 2, HEIGHT - 5)
        ctx.fillText('20 kHz', WIDTH - 40, HEIGHT - 5)
      }
    }
    animationRef.current = requestAnimationFrame(animate)
  }

  const togglePlayPause = () => {
    const audio = audioRef.current
    if (audio) {
      if (isPlaying) {
        audio.pause()
      } else {
        audio.play()
      }
      setIsPlaying(!isPlaying)
      setIsAnimating(true)
      setTimeout(() => setIsAnimating(false), 500) // Animation duration
    }
  }

  const skipToStart = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0
    }
  }

  const skipToEnd = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = duration
    }
  }

  const handleAudioLayerChange = (value: string) => {
    setAudioLayer(value)
    // In a real implementation, you would change the audio source here
  }

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0])
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col h-full">
      <h2 className="text-xl font-semibold mb-4">Audio Layer</h2>
      
      <div className="bg-white p-4 rounded-xl shadow-md mb-4 flex flex-col justify-between h-[200px]">
        <Select value={audioLayer} onValueChange={handleAudioLayerChange}>
          <SelectTrigger className="w-full text-xs py-1">
            <SelectValue placeholder="Select Layer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="layer1">Rock Audio Layer</SelectItem>
            <SelectItem value="layer2">Jazz Audio Layer</SelectItem>
            <SelectItem value="layer3">Blues Audio Layer</SelectItem>
            <SelectItem value="layer4">Pop Audio Layer</SelectItem>
          </SelectContent>
        </Select>
        
        <div className="flex justify-between text-sm">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        
        <div className="flex justify-center space-x-3">
          <Button variant="outline" size="icon" onClick={skipToStart} className="w-8 h-8">
            <SkipBackIcon className="h-4 w-4" />
          </Button>
          <Button 
            variant={isPlaying ? "default" : "outline"} 
            size="icon"
            onClick={togglePlayPause}
            className={`w-8 h-8 ${isPlaying ? "bg-green-500 hover:bg-green-600" : ""}`}
          >
            {isPlaying ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" onClick={skipToEnd} className="w-8 h-8">
            <SkipForwardIcon className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-2">
          <Volume2 className="h-5 w-5 text-green-500" />
          <Slider
            value={[volume]}
            max={1}
            step={0.01}
            onValueChange={handleVolumeChange}
            className="w-full"
            thumbClassName="bg-green-500 border-2 border-white"
            trackClassName="bg-green-200"
            rangeClassName="bg-green-500"
          />
        </div>
      </div>
      
      <audio ref={audioRef} className="hidden" />
    </div>
  )
}

function AffirmationList({ affirmations }: { affirmations: string[] }) {
  return (
    <div className="flex flex-col h-full">
      <h2 className="text-2xl font-bold mb-4">Generated Affirmations</h2>
      <div className="bg-white p-4 rounded-xl shadow-md flex-grow overflow-hidden">
        <ScrollArea className="h-full pr-4">
          {affirmations.length > 0 ? (
            affirmations.map((affirmation, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <p className="text-lg text-gray-700 p-4 bg-gray-50 border border-gray-200 rounded-lg affirmation-hover hover:bg-purple-100 hover:text-purple-800 transition-colors duration-300">
                  {affirmation}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No affirmations generated yet.</p>
          )}
        </ScrollArea>
      </div>
    </div>
  )
}

// Fix for 'Unexpected any' errors
interface SketchEvent {
  type: string;
  target: unknown;
  // Add other properties as needed
}

// Define LayoutSketchProps if it's not imported from elsewhere
interface LayoutSketchProps {
  initialLayout?: any; // Make this optional and replace 'any' with the correct type
}

const Studio: React.FC = () => {
  const router = useRouter();
  const { signOut, openUserProfile } = useClerk();
  const [trackDuration, setTrackDuration] = useState(60)
  const [ttsDuration, setTtsDuration] = useState(10)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [prompt, setPrompt] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [generatedAffirmations, setGeneratedAffirmations] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const [generationCount, setGenerationCount] = useState(0);
  const [lastGenerationTime, setLastGenerationTime] = useState<number | null>(null);
  const [isPaidCustomer, setIsPaidCustomer] = useState(false);

  useEffect(() => {
    // Load generation count and last generation time from localStorage
    const storedCount = localStorage.getItem('generationCount');
    const storedTime = localStorage.getItem('lastGenerationTime');
    const storedPaidStatus = localStorage.getItem('isPaidCustomer');

    if (storedCount) setGenerationCount(parseInt(storedCount, 10));
    if (storedTime) setLastGenerationTime(parseInt(storedTime, 10));
    if (storedPaidStatus) setIsPaidCustomer(storedPaidStatus === 'true');
  }, []);

  const checkAndResetDailyLimit = () => {
    const now = Date.now();
    if (lastGenerationTime && now - lastGenerationTime > 24 * 60 * 60 * 1000) {
      // Reset count if it's been more than 24 hours
      setGenerationCount(0);
      localStorage.setItem('generationCount', '0');
    }
    setLastGenerationTime(now);
    localStorage.setItem('lastGenerationTime', now.toString());
  };

  const generateAffirmations = async () => {
    if (!isPaidCustomer && generationCount >= 10) {
      const timeLeft = 24 * 60 * 60 * 1000 - (Date.now() - (lastGenerationTime || 0));
      const hoursLeft = Math.ceil(timeLeft / (60 * 60 * 1000));
      alert(`Daily limit reached. Please try again in ${hoursLeft} hours or upgrade to continue.`);
      return;
    }

    checkAndResetDailyLimit();

    setIsGenerating(true);
    try {
      console.log('Sending request to generate affirmations with tags:', tags);
      const response = await fetch('/api/generate-affirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: tags.join(', ') }),
      });

      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);

      if (!response.ok) {
        throw new Error(`Failed to generate affirmations: ${response.status} ${responseText}`);
      }

      const data = JSON.parse(responseText);
      console.log('Parsed response data:', data);

      if (!data.affirmations || !Array.isArray(data.affirmations)) {
        throw new Error('Invalid response format from the server');
      }

      setGeneratedAffirmations(data.affirmations);

      // Now, let's send these affirmations to Elevenlabs for TTS conversion
      setIsTtsLoading(true);
      const ttsResponse = await fetch('/api/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: data.affirmations.join(' ') }),
      });

      if (!ttsResponse.ok) {
        throw new Error(`Failed to convert text to speech: ${ttsResponse.status}`);
      }

      const ttsData = await ttsResponse.json();
      setAudioUrl(ttsData.audioUrl);
      setIsTtsLoading(false);

      if (!isPaidCustomer) {
        const newCount = generationCount + 1;
        setGenerationCount(newCount);
        localStorage.setItem('generationCount', newCount.toString());
      }

    } catch (error) {
      console.error('Error generating affirmations or converting to speech:', error);
      setGeneratedAffirmations([`Error: ${error.message}`]);
      setIsTtsLoading(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPrompt(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  };

  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isTtsLoading, setIsTtsLoading] = useState(false)

  const handleAffirmationGenerated = (affirmations: string[], newAudioUrl: string) => {
    console.log('Received affirmations:', affirmations);
    setGeneratedAffirmations(affirmations);
    setIsTtsLoading(true); // Set loading to true when starting TTS process
    if (newAudioUrl) {
      setAudioUrl(newAudioUrl);
      setIsTtsLoading(false); // Set loading to false when TTS is complete
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const handleTrackDurationChange = (value: number[]) => {
    setTrackDuration(value[0])
    if (value[0] < ttsDuration) {
      setTtsDuration(value[0])
    }
  }

  const handleTtsDurationChange = (value: number[]) => {
    setTtsDuration(value[0])
  }

  const handlePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSkip = (direction: 'back' | 'forward') => {
    if (audioRef.current) {
      if (direction === 'back') {
        audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10)
      } else {
        audioRef.current.currentTime = Math.min(trackDuration, audioRef.current.currentTime + 10)
      }
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoopToggle = () => {
    setIsLooping(!isLooping)
  }

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        if (audioRef.current) {
          setCurrentTime(audioRef.current.currentTime)
          if (audioRef.current.currentTime >= trackDuration) {
            audioRef.current.currentTime = 0
            setCurrentTime(0)
            if (!isLooping) {
              setIsPlaying(false)
              audioRef.current.pause()
            }
          } else if (isLooping && audioRef.current.currentTime % ttsDuration === 0) {
            audioRef.current.currentTime -= ttsDuration
          }
        }
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, trackDuration, ttsDuration, isLooping])

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.src = '/placeholder-audio.mp3'
    }
  }, [])

  const renderLoopVisualization = () => {
    const loops = Math.ceil(trackDuration / ttsDuration)
    return (
      <div className="w-full h-4 bg-secondary rounded-full overflow-hidden flex relative">
        {Array.from({ length: loops }).map((_, index) => (
          <div
            key={index}
            className="h-full border-r border-background last:border-r-0 relative overflow-hidden"
            style={{
              width: `${(ttsDuration / trackDuration) * 100}%`,
              backgroundColor: index % 2 === 0 ? 'rgba(59, 130, 246, 0.2)' : 'rgba(59, 130, 246, 0.3)',
            }}
          />
        ))}
        <motion.div
          className="absolute top-0 h-full w-1 bg-blue-500"
          style={{
            left: `${(currentTime / trackDuration) * 100}%`,
          }}
          animate={{
            left: `${(currentTime / trackDuration) * 100}%`,
          }}
          transition={{
            type: "tween",
            ease: "linear",
            duration: 0.1,
          }}
        />
      </div>
    )
  }

  const [isSplit, setIsSplit] = useState(false)

  const handleInitialClick = () => {
    setIsSplit(true)
  }

  const handlePayment = async (method: string) => {
    console.log(`Processing ${method} payment`);
    try {
      if (method === 'Card') {
        // Existing Stripe logic
        const response = await fetch('/api/create-checkout-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 300, // €3.00 in cents
            currency: 'eur',
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create checkout session');
        }

        const { sessionId } = await response.json();

        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe failed to load');
        }

        const { error } = await stripe.redirectToCheckout({ sessionId });

        if (error) {
          console.error('Stripe redirect error:', error);
          throw error;
        }
      } else if (method === 'PayPal') {
        console.log('Initiating PayPal payment...');
        const response = await fetch('/api/create-paypal-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: 3.00, // €3.00
            currency: 'EUR',
          }),
        });

        console.log('PayPal API response status:', response.status);
        const responseData = await response.text();
        console.log('PayPal API response data:', responseData);

        if (!response.ok) {
          throw new Error(`Failed to create PayPal order: ${response.status} ${responseData}`);
        }

        const { approvalUrl } = JSON.parse(responseData);
        if (!approvalUrl) {
          throw new Error('No approval URL received from PayPal');
        }

        console.log('Redirecting to PayPal approval URL:', approvalUrl);
        window.location.href = approvalUrl;
      }
    } catch (error) {
      console.error('Detailed payment error:', error);
      alert('Failed to process payment. Please check the console for more details.');
    }
    setIsSplit(false);
    setIsPaidCustomer(true);
    localStorage.setItem('isPaidCustomer', 'true');
    setGenerationCount(0);
    localStorage.setItem('generationCount', '0');
  };

  const handleNavigateToLanding = () => {
    router.push('/');
  };

  useEffect(() => {
    // Check if the user is authenticated
    const isAuthenticated = checkAuthStatus(); // Implement this function
    if (!isAuthenticated) {
      // Redirect back to home if not authenticated
      router.push('/');
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push('/');
  };

  const handleOpenSettings = () => {
    openUserProfile();
  };

  const [isChatbotLoaded, setIsChatbotLoaded] = useState(false);

  const loadChatbot = () => {
    if (!isChatbotLoaded) {
      const script = document.createElement('script');
      script.id = 'chatbotkit-widget';
      script.src = 'https://static.chatbotkit.com/integrations/widget/v2.js';
      script.setAttribute('data-widget', 'cm229l9ly4rui13c5gpvurplt');
      document.head.appendChild(script);
      setIsChatbotLoaded(true);
    }
  };

  return (
    <div className="container mx-auto p-2 min-h-screen relative font-sans bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex flex-col">
      <style jsx global>{`
        @keyframes subtle-glow {
          0%, 100% { 
            filter: drop-shadow(0 0 2px rgba(147, 51, 234, 0.2));
          }
          50% { 
            filter: drop-shadow(0 0 3px rgba(147, 51, 234, 0.3));
          }
        }
        .subtle-glow {
          animation: subtle-glow 3s ease-in-out infinite;
        }
        .bento-container:hover .animated-bento:not(:hover) {
          opacity: 0.7;
          filter: brightness(0.7);
          transition: opacity 0.3s ease, filter 0.3s ease, transform 0.3s ease;
        }
        .animated-bento {
          transition: opacity 0.3s ease, filter 0.3s ease, transform 0.3s ease;
        }
        .animated-bento:hover {
          transform: translateY(-2px) scale(1.005);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        .glow-effect {
          text-shadow: 0 0 10px rgba(34, 197, 94, 0.5), 0 0 20px rgba(34, 197, 94, 0.3);
        }
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        .animate-scroll {
          animation: scroll linear infinite;
        }
      `}</style>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 flex-grow bento-container">
        <AnimatedBentoBox 
          className="col-span-2 row-span-2 animated-bento"
          gradient="bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700"
        >
          <Card className="h-full bg-transparent border-none shadow-none">
            <CardContent className="p-2 sm:p-4 flex flex-col h-full">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-800 dark:text-gray-200 subtle-glow">Affirmation Search</h2>
              <AffirmationSearch onAffirmationGenerated={handleAffirmationGenerated} />
            </CardContent>
          </Card>
        </AnimatedBentoBox>

        <AnimatedBentoBox 
          className="col-span-1 row-span-2 animated-bento"
          gradient="bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500"
        >
          <Card className="h-full bg-transparent border-none shadow-none">
            <CardContent className="p-2 sm:p-4 h-full flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-800 dark:text-gray-100"></h2>
              <SubliminalAudioPlayer audioUrl={audioUrl} isLoading={isTtsLoading} />
            </CardContent>
          </Card>
        </AnimatedBentoBox>

        <AnimatedBentoBox 
          className="col-span-1 row-span-2 animated-bento"
          gradient="bg-gradient-to-br from-gray-400 to-gray-500 dark:from-gray-500 dark:to-gray-400"
        >
          <Card className="h-full bg-transparent border-none shadow-none">
            <CardContent className="p-2 sm:p-4 h-full flex flex-col">
              <h2 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-4 text-gray-800 dark:text-gray-100">Audio Layer</h2>
              <AudioLayerPlayer />
            </CardContent>
          </Card>
        </AnimatedBentoBox>

        <AnimatedBentoBox 
          className="col-span-2 row-span-2 animated-bento"
          gradient="bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600"
        >
          <AffirmationList affirmations={generatedAffirmations} />
        </AnimatedBentoBox>

        <AnimatedBentoBox 
          className="col-span-2 row-span-2 animated-bento"
          gradient="bg-gradient-to-br from-gray-500 to-gray-600 dark:from-gray-400 dark:to-gray-300"
        >
          <Card className="h-full overflow-hidden bg-transparent border-none shadow-none">
            <CardContent className="p-2 sm:p-4 flex flex-col h-full">
              <h2 className="text-lg sm:text-xl font-bold mb-2 text-white">Audio Controls</h2>
              
              <div className="space-y-4 flex-grow overflow-y-auto text-xs sm:text-sm">
                {/* Track Length and TTS Loop Duration controls */}
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <SlidersHorizontal className="w-4 h-4 text-blue-500" />
                        <h3 className="text-sm font-semibold text-black">Track Length</h3>
                      </div>
                      <Slider
                        id="track-length-slider"
                        min={10}
                        max={300}
                        step={1}
                        value={[trackDuration]}
                        onValueChange={handleTrackDurationChange}
                        className="w-full"
                        thumbClassName="bg-blue-500 border-2 border-white"
                        trackClassName="bg-blue-200"
                        rangeClassName="bg-blue-500"
                      />
                      <p className="text-xs text-black mt-1">
                        Track Length: {formatTime(trackDuration)}
                      </p>
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <RepeatIcon className="w-4 h-4 text-blue-500" />
                        <h3 className="text-sm font-semibold text-black">TTS Loop Duration</h3>
                      </div>
                      <Slider
                        id="tts-loop-slider"
                        min={1}
                        max={trackDuration}
                        step={1}
                        value={[ttsDuration]}
                        onValueChange={handleTtsDurationChange}
                        className="w-full"
                        thumbClassName="bg-blue-500 border-2 border-white"
                        trackClassName="bg-blue-200"
                        rangeClassName="bg-blue-500"
                      />
                      <p className="text-xs text-black mt-1">
                        TTS Loop: {formatTime(ttsDuration)}
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Loop Visualization */}
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <h3 className="text-sm font-semibold mb-2 text-black">Loop Visualization</h3>
                  {renderLoopVisualization()}
                </div>
                
                {/* Current/Total Time display */}
                <div className="bg-white p-4 rounded-xl shadow-md flex flex-col items-center justify-center">
                  <Clock className="w-6 h-6 mb-1 text-black" />
                  <p className="text-lg font-bold text-black">{formatTime(currentTime)} / {formatTime(trackDuration)}</p>
                  <p className="text-xs text-black/80">current / total</p>
                </div>

                {/* Playback controls */}
                <div className="bg-white p-4 rounded-xl shadow-md">
                  <div className="flex items-center justify-between space-x-2 mb-2">
                    <Button
                      onClick={() => handleSkip('back')}
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 rounded-full"
                    >
                      <SkipBackIcon className="h-4 w-4" />
                    </Button>
                    
                    <motion.button
                      onClick={handlePlay}
                      className="flex-grow py-2 px-4 rounded-full text-white text-sm font-semibold focus:outline-none"
                      animate={{
                        backgroundColor: isPlaying ? "#3b82f6" : "#60a5fa",
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {isPlaying ? (
                        <PauseIcon className="w-5 h-5 mx-auto" />
                      ) : (
                        <PlayIcon className="w-5 h-5 mx-auto" />
                      )}
                    </motion.button>
                    
                    <Button
                      onClick={() => handleSkip('forward')}
                      variant="outline"
                      size="icon"
                      className="w-8 h-8 rounded-full"
                    >
                      <SkipForwardIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  {/* The "Loop TTS" switch and label have been removed */}
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedBentoBox>
      </div>

      <div className="flex justify-between items-center mt-2">
        <div className="flex items-center space-x-2">
          <Button
            onClick={handleOpenSettings}
            className="bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 text-gray-800 dark:text-white font-bold rounded-full transition-all duration-300 ease-in-out flex items-center justify-center text-sm hover:from-gray-300 hover:to-gray-400 dark:hover:from-gray-600 dark:hover:to-gray-500 hover:shadow-blue-300/50 dark:hover:shadow-blue-500/30"
            size="sm"
            style={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 255, 0.1), 0 2px 4px -1px rgba(0, 0, 255, 0.06)',
            }}
          >
            <Settings className="mr-1 h-4 w-4" />
            Settings
          </Button>
          <Button
            onClick={handleLogout}
            className="bg-gradient-to-r from-gray-300 to-gray-400 dark:from-gray-600 dark:to-gray-500 text-gray-800 dark:text-white font-bold rounded-full transition-all duration-300 ease-in-out flex items-center justify-center text-sm hover:from-gray-400 hover:to-gray-500 dark:hover:from-gray-500 dark:hover:to-gray-400 hover:shadow-blue-300/50 dark:hover:shadow-blue-500/30"
            size="sm"
            style={{
              boxShadow: '0 4px 6px -1px rgba(0, 0, 255, 0.1), 0 2px 4px -1px rgba(0, 0, 255, 0.06)',
            }}
          >
            <LogOut className="mr-1 h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Download button moved to bottom right */}
        <div className="bg-white p-2 rounded-xl shadow-md">
          {!isSplit ? (
            <Button 
              className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold transition-all duration-300 ease-in-out"
              onClick={handleInitialClick}
            >
              <Download className="mr-2 h-5 w-5" />
              Download (€3.00)
            </Button>
          ) : (
            <div className="flex justify-between w-full space-x-2">
              <Button 
                className="w-1/2 bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-300 ease-in-out"
                onClick={() => handlePayment('PayPal')}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                PayPal
              </Button>
              <Button 
                className="w-1/2 bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all duration-300 ease-in-out"
                onClick={() => handlePayment('Card')}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Card
              </Button>
            </div>
          )}
        </div>
      </div>

      {!isPaidCustomer && (
        <div className="text-sm text-gray-600 mt-2">
          Generations remaining today: {10 - generationCount}
        </div>
      )}
    </div>
  )
}

// Helper function to check authentication status (implement your actual logic here)
function checkAuthStatus() {
  // Placeholder: Replace with your actual auth check logic
  return true; // Assuming the user is authenticated for this example
}

export default Studio