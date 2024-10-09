"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, Clock, SlidersHorizontal, RepeatIcon, Volume2, X, Sparkles, ChevronDown, Loader2, Download, CreditCard, LogOut } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { ScrollArea } from "@/components/ui/scroll-area"
import { loadStripe } from '@stripe/stripe-js'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useClerk } from "@clerk/nextjs";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

const inspirationPrompts = [
  "confident", "creative", "resilient", "compassionate", "determined",
  "optimistic", "courageous", "grateful", "adaptable", "empathetic",
]

function AffirmationSearch({ onAffirmationGenerated }: { onAffirmationGenerated: (affirmations: string[], audioUrl: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isTtsLoading, setIsTtsLoading] = useState(false)

  const addPrompt = () => {
    if (searchQuery.trim() !== "" && !prompts.includes(searchQuery.trim())) {
      setPrompts([...prompts, searchQuery.trim()])
      setSearchQuery("")
    }
  }

  const removePrompt = (promptToRemove: string) => {
    setPrompts(prompts.filter(prompt => prompt !== promptToRemove))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addPrompt()
    }
  }

  const generateAffirmation = async () => {
    setIsLoading(true)
    try {
      let promptToUse = prompts.join(', ')
      if (searchQuery.trim()) {
        promptToUse += promptToUse ? `, ${searchQuery.trim()}` : searchQuery.trim()
      }
      
      if (!promptToUse) {
        throw new Error('No prompt provided')
      }

      const response = await fetch('/api/generate-affirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: promptToUse }),
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
      setSearchQuery("")
    } catch (error) {
      console.error('Error generating affirmations or converting to speech:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4 flex flex-col h-full">
        <h2 className="text-xl font-bold mb-4">Affirmation Search</h2>
        <div className="flex space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Enter your prompt..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow"
          />
          <Button onClick={addPrompt} size="sm" asChild={false}>Add</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2 w-10 relative overflow-hidden">
                <Sparkles className="h-4 w-4 text-purple-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              {inspirationPrompts.map((prompt) => (
                <DropdownMenuItem
                  key={prompt}
                  onSelect={() => {
                    setSearchQuery(prompt)
                    addPrompt()
                  }}
                >
                  {prompt}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex-grow overflow-y-auto mb-4">
          <div className="flex flex-wrap gap-2">
            <AnimatePresence>
              {prompts.map((prompt) => (
                <motion.span 
                  key={prompt}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.2 }}
                  className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm flex items-center"
                >
                  {prompt}
                  <button 
                    onClick={() => removePrompt(prompt)}
                    className="ml-2 focus:outline-none text-purple-600 hover:text-purple-800"
                    aria-label={`Remove ${prompt}`}
                  >
                    <X size={14} />
                  </button>
                </motion.span>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <Button 
          onClick={generateAffirmation} 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 text-lg"
          disabled={isLoading || (prompts.length === 0 && !searchQuery.trim())}
        >
          {isLoading ? 'Generating...' : 'Generate Affirmations'}
        </Button>
        {isTtsLoading && (
          <p className="text-sm text-gray-500 mt-2">Converting to speech...</p>
        )}
      </CardContent>
    </Card>
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
      <div className="flex justify-between items-center mb-3">
        <div className="text-base font-semibold relative overflow-hidden">
          <span className={`transition-colors duration-500 ${isAnimating ? 'text-green-500' : ''}`}>
            Audio
          </span>
          <span className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            firmations
          </span>
        </div>
        <Select value={speedFactor.toString()} onValueChange={handleSpeedChange}>
          <SelectTrigger className="w-[100px]">
            <SelectValue placeholder="Speed" />
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
      <audio ref={audioRef} className="hidden" />
      <canvas ref={canvasRef} width="300" height="80" className="w-full mb-3" />
      <div className="flex justify-between text-sm mb-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="flex justify-center space-x-3 mb-3">
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
        <Volume2 className="h-5 w-5" />
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-full"
        />
      </div>
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
      <div className="flex justify-between items-center mb-3">
        <div className="text-base font-semibold relative overflow-hidden">
          <span className={`transition-colors duration-500 ${isAnimating ? 'text-green-500' : ''}`}>
            Audio
          </span>
          <span className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
            Layer
          </span>
        </div>
        <div className="flex items-center space-x-2">
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
      </div>
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
      <audio ref={audioRef} className="hidden" />
      <canvas ref={canvasRef} width="300" height="80" className="w-full mb-3" />
      <div className="flex justify-between text-sm mb-2">
        <span>{formatTime(currentTime)}</span>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="flex items-center space-x-2">
        <Volume2 className="h-5 w-5" />
        <Slider
          value={[volume]}
          max={1}
          step={0.01}
          onValueChange={handleVolumeChange}
          className="w-full"
        />
      </div>
    </div>
  )
}

function AffirmationList({ affirmations }: { affirmations: string[] }) {
  return (
    <Card className="w-full h-full">
      <CardContent className="p-4 h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Generated Affirmations</h2>
        <ScrollArea className="flex-grow pr-4">
          {affirmations.length > 0 ? (
            affirmations.map((affirmation, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <p className="text-lg text-gray-700 p-4 bg-white border border-gray-200 rounded-lg affirmation-hover hover:bg-purple-100 hover:text-purple-800 transition-colors duration-300">
                  {affirmation}
                </p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 italic">No affirmations generated yet.</p>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
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
  const { signOut } = useClerk();
  const [trackDuration, setTrackDuration] = useState(60)
  const [ttsDuration, setTtsDuration] = useState(10)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [generatedAffirmations, setGeneratedAffirmations] = useState<string[]>([])
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

  const handlePayment = async (method: 'PayPal' | 'Card') => {
    console.log(`Processing ${method} payment`);
    if (method === 'Card') {
      try {
        console.log('Fetching /api/create-payment-intent');
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        console.log('Response status:', response.status);
        const responseData = await response.text();
        console.log('Response data:', responseData);

        if (!response.ok) {
          throw new Error(`Failed to create Stripe session: ${responseData}`);
        }

        const { sessionId } = JSON.parse(responseData);
        console.log('Session ID:', sessionId);

        const stripe = await stripePromise;
        
        if (!stripe) {
          throw new Error('Stripe failed to load');
        }

        console.log('Redirecting to Stripe checkout');
        const { error } = await stripe.redirectToCheckout({ sessionId });
        
        if (error) {
          console.error('Stripe redirect error:', error);
          throw error;
        }
      } catch (error) {
        console.error('Detailed error:', error);
        alert('Failed to process payment. Please check the console for more details.');
      }
    } else if (method === 'PayPal') {
      // Implement PayPal payment logic here
      console.log('PayPal payment not implemented yet');
    }
    setIsSplit(false);
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

  return (
    <div className="container mx-auto p-4 h-screen relative">
      <div className="grid grid-cols-4 grid-rows-6 gap-4 h-full">
        <div className="col-span-2 row-span-2">
          <AffirmationSearch onAffirmationGenerated={handleAffirmationGenerated} />
        </div>
        <div className="col-span-1 row-span-2">
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <SubliminalAudioPlayer audioUrl={audioUrl} isLoading={isTtsLoading} />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 row-span-2">
          <Card className="h-full">
            <CardContent className="p-4 h-full flex flex-col">
              <AudioLayerPlayer />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-2 row-span-4">
          <AffirmationList affirmations={generatedAffirmations} />
        </div>
        <div className="col-span-2 row-span-4">
          <Card className="h-full overflow-hidden">
            <CardContent className="p-4 flex flex-col h-full">
              <h2 className="text-lg font-semibold mb-2">Audio Controls</h2>
              
              <div className="space-y-2 flex-grow overflow-y-auto">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <SlidersHorizontal className="w-4 h-4" />
                    <h3 className="text-sm font-semibold">Track Length</h3>
                  </div>
                  <Slider
                    id="track-length-slider"
                    min={10}
                    max={300}
                    step={1}
                    value={[trackDuration]}
                    onValueChange={handleTrackDurationChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    Track Length: {formatTime(trackDuration)}
                  </p>
                </div>
                
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <RepeatIcon className="w-4 h-4" />
                    <h3 className="text-sm font-semibold">TTS Loop Duration</h3>
                  </div>
                  <Slider
                    id="tts-loop-slider"
                    min={1}
                    max={trackDuration}
                    step={1}
                    value={[ttsDuration]}
                    onValueChange={handleTtsDurationChange}
                  />
                  <p className="text-xs text-muted-foreground">
                    TTS Loop: {formatTime(ttsDuration)}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold mb-1">Loop Visualization</h3>
                  {renderLoopVisualization()}
                </div>
                
                <div className="bg-secondary rounded-lg p-3 flex flex-col items-center justify-center">
                  <Clock className="w-6 h-6 mb-1 text-secondary-foreground" />
                  <p className="text-lg font-bold text-secondary-foreground">{formatTime(currentTime)} / {formatTime(trackDuration)}</p>
                  <p className="text-xs text-secondary-foreground/80">current / total</p>
                </div>

                {/* Moved button to this position */}
                <div className="bg-muted p-3 rounded-lg mt-2">
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
                        backgroundColor: isPlaying ? "#22c55e" : "#3b82f6",
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
                  <div className="flex items-center justify-center space-x-2">
                    <RepeatIcon className={`h-4 w-4 ${isLooping ? 'text-primary' : 'text-muted-foreground'}`} />
                    <Switch
                      id="loop-mode"
                      checked={isLooping}
                      onCheckedChange={handleLoopToggle}
                    />
                    <label htmlFor="loop-mode" className="text-xs font-medium">
                      Loop TTS
                    </label>
                  </div>
                </div>

                {/* Payment button */}
                <div className="relative w-full h-12 mt-2">
                  {!isSplit ? (
                    <Button 
                      className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold transition-all duration-300 ease-in-out"
                      onClick={() => setIsSplit(true)}
                    >
                      <Download className="mr-2 h-5 w-5" />
                      Download (€3.00)
                    </Button>
                  ) : (
                    <div className="flex justify-between w-full h-full space-x-2">
                      <Button 
                        className="w-1/2 h-full bg-blue-500 hover:bg-blue-600 text-white font-bold transition-all duration-300 ease-in-out"
                        onClick={() => handlePayment('PayPal')}
                      >
                        <CreditCard className="mr-2 h-5 w-5" />
                        PayPal
                      </Button>
                      <Button 
                        className="w-1/2 h-full bg-purple-500 hover:bg-purple-600 text-white font-bold transition-all duration-300 ease-in-out"
                        onClick={() => handlePayment('Card')}
                      >
                        <CreditCard className="mr-2 h-5 w-5" />
                        Card
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <audio ref={audioRef} />
      
      {/* Logout button */}
      <button
        onClick={handleLogout}
        className="fixed bottom-8 left-8 z-50 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center"
        aria-label="Logout"
      >
        <LogOut className="mr-2 h-5 w-5" />
        Logout
      </button>
      
      {/* Navigation button */}
      <button
        onClick={handleNavigateToLanding}
        className="fixed bottom-8 right-8 z-50 transition-transform hover:scale-110"
        aria-label="Go to Landing Page"
      >
        <Image
          src="/head.svg"
          alt="Go to Landing Page"
          width={80}
          height={80}
          className="rounded-full shadow-lg drop-shadow-[0_5px_5px_rgba(0,0,0,0.3)]"
        />
      </button>
    </div>
  )
}

// Helper function to check authentication status (implement your actual logic here)
function checkAuthStatus() {
  // Placeholder: Replace with your actual auth check logic
  return true; // Assuming the user is authenticated for this example
}

export default Studio