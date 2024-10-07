"use client"

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Sparkles } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const inspirationPrompts = [
  "confident", "creative", "resilient", "compassionate", "determined",
  "optimistic", "courageous", "grateful", "adaptable", "empathetic",
]

export default function AffirmationSearchShowcase({ onAffirmationGenerated }: { onAffirmationGenerated: (affirmation: string) => void }) {
  const [searchQuery, setSearchQuery] = useState("")
  const [prompts, setPrompts] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)

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

  const generateAffirmation = () => {
    if (prompts.length > 0) {
      setIsLoading(true)
      setTimeout(() => {
        const affirmation = prompts.map(prompt => `You are ${prompt} and capable of amazing things!`).join(" ")
        onAffirmationGenerated(affirmation)
        setIsLoading(false)
      }, 2000)
    }
  }

  return (
    <Card className="w-full shadow-lg shadow-gray-400/10">
      <CardContent className="p-4">
        <div className="flex space-x-2 mb-4">
          <Input
            type="text"
            placeholder="Enter your prompt..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-grow"
          />
          <Button onClick={addPrompt}>Add</Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative overflow-hidden p-0 h-10 w-10">
                <motion.div
                  animate={{
                    opacity: [0.2, 1, 0.2],
                    scale: [0.8, 1.4, 0.8],
                    rotate: [0, 360, 0],
                  }}
                  transition={{
                    duration: 3,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <Sparkles className="h-4 w-4 text-purple-500" />
                </motion.div>
                <motion.div
                  animate={{
                    opacity: [0, 0.5, 0],
                    scale: [1, 1.5, 1],
                  }}
                  transition={{
                    duration: 2,
                    ease: "easeInOut",
                    times: [0, 0.5, 1],
                    repeat: Infinity,
                  }}
                  className="absolute inset-0 bg-purple-300 rounded-full"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
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
        <div className="flex flex-wrap gap-2 mb-4">
          <AnimatePresence>
            {prompts.map((prompt) => (
              <motion.span
                key={prompt}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm flex items-center"
              >
                {prompt}
                <button
                  onClick={() => removePrompt(prompt)}
                  className="ml-2 focus:outline-none text-purple-600 hover:text-purple-800"
                  aria-label={`Remove ${prompt}`}
                >
                  &times;
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
        </div>
        <motion.div
          className="relative overflow-hidden rounded-md"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <Button
            onClick={generateAffirmation}
            disabled={isLoading || prompts.length === 0}
            className="w-full bg-gray-800 hover:bg-gray-700 text-white relative z-10"
          >
            {isLoading ? "Generating..." : "Generate Affirmation"}
          </Button>
          {isLoading && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600"
              animate={{
                x: ["-100%", "100%"],
              }}
              transition={{
                duration: 1.5,
                ease: "linear",
                repeat: Infinity,
              }}
            />
          )}
        </motion.div>
      </CardContent>
    </Card>
  )
}