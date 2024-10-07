'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PaymentSuccess() {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        // Here you would typically verify the payment with your backend
        // For now, we'll just simulate a successful verification
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsLoading(false)
      } catch (err) {
        setError('Failed to verify payment. Please contact support.')
        setIsLoading(false)
      }
    }

    verifyPayment()
  }, [])

  if (isLoading) {
    return <div>Verifying payment...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Payment Successful</h1>
      <p className="mb-4">Thank you for your purchase!</p>
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => router.push('/')}
      >
        Return to Home
      </button>
    </div>
  )
}