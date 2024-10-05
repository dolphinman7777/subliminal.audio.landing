"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { PlayIcon, PauseIcon, SkipBackIcon, SkipForwardIcon, Clock, SlidersHorizontal, RepeatIcon, Volume2, X, Sparkles } from "lucide-react"
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

const inspirationPrompts = [
  "confident", "creative", "resilient", "compassionate", "determined",
  "optimistic", "courageous", "grateful", "adaptable", "empathetic",
]

function AffirmationSearch({ onAffirmationGenerated }: { onAffirmationGenerated: (affirmations: string[]) => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [generatedAffirmations, setGeneratedAffirmations] = useState<string[]>([])

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
    if (prompts.length > 0) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/generate-affirmation', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt: prompts.join(', ') }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to generate affirmations: ${errorData.error || response.statusText}`);
        }

        const data = await response.json();
        const newAffirmations = data.affirmations;
        setGeneratedAffirmations(prev => [...prev, ...newAffirmations]);
        onAffirmationGenerated([...generatedAffirmations, ...newAffirmations]);
      } catch (error) {
        console.error('Error generating affirmations:', error);
        // Handle error (e.g., show error message to user)
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <Card className="h-full">
      <CardContent className="p-4 flex flex-col h-full">
        <h2 className="text-xl font-bold mb-2">Affirmation Search</h2>
        <div className="flex space-x-2 mb-2">
          <Input
            type="text"
            placeholder="Enter your prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow"
          />
          <Button onClick={addPrompt} size="sm">Add</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="px-2 w-8 relative overflow-hidden">
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
        <div className="flex flex-wrap gap-1 mb-2 flex-grow overflow-y-auto">
          <AnimatePresence>
            {prompts.map((prompt) => (
              <motion.span 
                key={prompt}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.2 }}
                className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs flex items-center"
              >
                {prompt}
                <button 
                  onClick={() => removePrompt(prompt)}
                  className="ml-1 focus:outline-none text-purple-600 hover:text-purple-800"
                  aria-label={`Remove ${prompt}`}
                >
                  <X size={12} />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <div className="relative h-8">
          <AnimatePresence mode="wait">
            {!isLoading ? (
              <motion.div
                key="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                <Button 
                  onClick={generateAffirmation} 
                  className="w-full h-full bg-gray-800 hover:bg-gray-900 text-white relative overflow-hidden"
                  disabled={prompts.length === 0}
                >
                  <span className="relative z-10">Generate Affirmation</span>
                  <motion.div
                    className="absolute inset-0 z-0"
                    initial={{ backgroundPosition: "0% 50%" }}
                    animate={{ backgroundPosition: "100% 50%" }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                      ease: "easeInOut"
                    }}
                    style={{
                      background: "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(255,255,255,0.3) 50%, rgba(0,0,0,0) 100%)",
                      backgroundSize: "200% 100%"
                    }}
                  />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0 bg-gray-200 rounded-md overflow-hidden"
              >
                <motion.div
                  className="h-full bg-black"
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    repeat: Infinity,
                    repeatType: "reverse"
                  }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  )
}

function SubliminalAudioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [voice, setVoice] = useState('default')
  const [volume, setVolume] = useState(1)
  const [visualizationType, setVisualizationType] = useState<'wave' | 'frequency'>('wave')
  const [isAnimating, setIsAnimating] = useState(false)
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

  const handleSpeedChange = (value: string) => {
    const speed = parseFloat(value)
    setPlaybackRate(speed)
    if (audioRef.current) {
      audioRef.current.playbackRate = speed
    }
  }

  const handleVoiceChange = (value: string) => {
    setVoice(value)
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
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
      <div className="p-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold relative overflow-hidden">
            <span className={`transition-colors duration-500 ${isAnimating ? 'text-green-500' : ''}`}>
              Audio
            </span>
            <span className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              firmations
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="visualization-type"
              checked={visualizationType === 'frequency'}
              onCheckedChange={(checked) => setVisualizationType(checked ? 'frequency' : 'wave')}
            />
            <Label htmlFor="visualization-type">
              {visualizationType === 'wave' ? 'Wave' : 'Frequency'}
            </Label>
          </div>
        </div>
        <audio ref={audioRef} src="https://v0.dev-public.vercel.app/audio/placeholder.mp3" />
        <canvas ref={canvasRef} width="300" height="100" className="w-full mb-4" />
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">{formatTime(currentTime)}</span>
          <span className="text-muted-foreground">{formatTime(duration)}</span>
        </div>
        <div className="flex justify-center space-x-4 mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={skipToStart}
            className="group"
          >
            <SkipBackIcon className="h-4 w-4 group-active:text-orange-500" />
          </Button>
          <Button 
            variant={isPlaying ? "default" : "outline"} 
            size="icon" 
            onClick={togglePlayPause}
            className={`relative ${isPlaying ? "bg-green-500 hover:bg-green-600" : ""}`}
          >
            {isPlaying ? (
              <>
                <PauseIcon className="h-4 w-4" />
                <span className="absolute inset-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full animate-wave-emit">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="2" />
                  </svg>
                </span>
              </>
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={skipToEnd}
            className="group"
          >
            <SkipForwardIcon className="h-4 w-4 group-active:text-orange-500" />
          </Button>
        </div>
        <div className="flex justify-between items-center mb-4">
          <Select value={playbackRate.toString()} onValueChange={handleSpeedChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Playback Speed" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0.5">0.5x</SelectItem>
              <SelectItem value="1">1x</SelectItem>
              <SelectItem value="1.5">1.5x</SelectItem>
              <SelectItem value="2">2x</SelectItem>
            </SelectContent>
          </Select>
          <Select value={voice} onValueChange={handleVoiceChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Voice" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="male">Male</SelectItem>
              <SelectItem value="female">Female</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4" />
          <div className="relative w-full">
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: `linear-gradient(to right, #e6f2ff ${volume * 100}%, #0066cc ${volume * 100}%)`,
              }}
            ></div>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="relative z-10"
            />
          </div>
        </div>
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
    <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl m-4">
      <div className="p-8">
        <div className="flex justify-between items-center mb-4">
          <div className="text-lg font-semibold relative overflow-hidden">
            <span className={`transition-colors duration-500 ${isAnimating ? 'text-green-500' : ''}`}>
              Audio
            </span>
            <span className={`transition-opacity duration-500 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              Layer
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="visualization-type"
              checked={visualizationType === 'frequency'}
              onCheckedChange={(checked) => setVisualizationType(checked ? 'frequency' : 'wave')}
            />
            <Label htmlFor="visualization-type">
              {visualizationType === 'wave' ? 'Wave' : 'Frequency'}
            </Label>
          </div>
        </div>
        <audio ref={audioRef} src="https://v0.dev-public.vercel.app/audio/placeholder.mp3" />
        <canvas ref={canvasRef} width="300" height="100" className="w-full mb-4" />
        <div className="flex justify-between items-center mb-4">
          <span className="text-muted-foreground">{formatTime(currentTime)}</span>
          <span className="text-muted-foreground">{formatTime(duration)}</span>
        </div>
        <div className="flex justify-center space-x-4 mb-4">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={skipToStart}
            className="group"
          >
            <SkipBackIcon className="h-4 w-4 group-active:text-orange-500" />
          </Button>
          <Button 
            variant={isPlaying ? "default" : "outline"} 
            size="icon" 
            onClick={togglePlayPause}
            className={`relative ${isPlaying ? "bg-green-500 hover:bg-green-600" : ""}`}
          >
            {isPlaying ? (
              <>
                <PauseIcon className="h-4 w-4" />
                <span className="absolute inset-0">
                  <svg viewBox="0 0 100 100" className="w-full h-full animate-wave-emit">
                    <circle cx="50" cy="50" r="45" fill="none" stroke="white" strokeWidth="2" />
                  </svg>
                </span>
              </>
            ) : (
              <PlayIcon className="h-4 w-4" />
            )}
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={skipToEnd}
            className="group"
          >
            <SkipForwardIcon className="h-4 w-4 group-active:text-orange-500" />
          </Button>
        </div>
        <div className="flex justify-between items-center mb-4">
          <Select value={audioLayer} onValueChange={handleAudioLayerChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Audio Layer" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="layer1">Rock Audio Layer</SelectItem>
              <SelectItem value="layer2">Jazz Audio Layer</SelectItem>
              <SelectItem value="layer3">Blues Audio Layer</SelectItem>
              <SelectItem value="layer4">Pop Audio Layer</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Volume2 className="h-4 w-4" />
          <div className="relative w-full">
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: `linear-gradient(to right, #e6f2ff ${volume * 100}%, #0066cc ${volume * 100}%)`,
              }}
            ></div>
            <Slider
              value={[volume]}
              max={1}
              step={0.01}
              onValueChange={handleVolumeChange}
              className="relative z-10"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function AffirmationList({ affirmations }: { affirmations: string[] }) {
  const [isAtBottom, setIsAtBottom] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current) {
        const { scrollTop, scrollHeight, clientHeight } = scrollAreaRef.current
        const isBottom = Math.abs(scrollHeight - clientHeight - scrollTop) < 1
        setIsAtBottom(isBottom)
      }
    }

    const scrollArea = scrollAreaRef.current
    if (scrollArea) {
      scrollArea.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (scrollArea) {
        scrollArea.removeEventListener('scroll', handleScroll)
      }
    }
  }, [])

  return (
    <Card className={`w-full h-full ${isAtBottom ? 'animate-vibrate' : ''}`}>
      <CardContent className="p-4 h-full flex flex-col">
        <h2 className="text-2xl font-bold mb-4">Generated Affirmations</h2>
        <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
          {affirmations.map((affirmation, index) => (
            <div key={index} className="mb-4 last:mb-0">
              <p className="text-lg text-gray-700 p-4 bg-white border border-gray-200 rounded-lg affirmation-hover hover:bg-purple-100 hover:text-purple-800 transition-colors duration-300">
                {affirmation}
              </p>
            </div>
          ))}
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

export default function LayoutSketch({ initialLayout }: LayoutSketchProps) {
  useEffect(() => {
    // Initialize layout
    if (initialLayout) {
      // Do something with initialLayout
    }
  }, [initialLayout]);

  const [trackDuration, setTrackDuration] = useState(60)
  const [ttsDuration, setTtsDuration] = useState(10)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLooping, setIsLooping] = useState(true)
  const [currentTime, setCurrentTime] = useState(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const [generatedAffirmations, setGeneratedAffirmations] = useState<string[]>([])

  const handleAffirmationGenerated = (newAffirmations: string[]) => {
    setGeneratedAffirmations(newAffirmations)
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

  return (
    <div className="container mx-auto p-4 h-screen">
      <div className="grid grid-cols-4 grid-rows-2 gap-4 h-full">
        <div className="col-span-2 row-span-1">
          <AffirmationSearch onAffirmationGenerated={handleAffirmationGenerated} />
        </div>
        <div className="col-span-1 row-span-1">
          <Card className="h-full">
            <CardContent className="p-4">
              <SubliminalAudioPlayer />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-1 row-span-1">
          <Card className="h-full">
            <CardContent className="p-4">
              <AudioLayerPlayer />
            </CardContent>
          </Card>
        </div>
        <div className="col-span-2 row-span-1">
          <AffirmationList affirmations={generatedAffirmations} />
        </div>
        <div className="col-span-2 row-span-1">
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
              </div>
              
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
            </CardContent>
          </Card>
        </div>
      </div>
      <audio ref={audioRef} />
    </div>
  )
}