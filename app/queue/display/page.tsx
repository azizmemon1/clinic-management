"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Stethoscope } from "lucide-react"

type TokenStatus = 'current' | 'waiting' | 'completed' | 'hold'

interface Patient {
  id: number
  name: string
}

interface Token {
  id: number
  number: number
  patient: Patient
  isEmergency: boolean
  status: TokenStatus
  holdAt?: string
  completedAt?: string
}

interface QueueData {
  currentToken: number | null
  nextTokens: Token[]
  lastCalled: Token[]
}

const initialDisplayData: QueueData = {
  currentToken: 14,
  nextTokens: [
    { id: 15, number: 15, patient: { id: 2, name: "Sarah Johnson" }, isEmergency: false, status: 'waiting' },
    { id: 16, number: 16, patient: { id: 3, name: "Michael Brown" }, isEmergency: false, status: 'waiting' },
    { id: 17, number: 17, patient: { id: 4, name: "Emily Davis" }, isEmergency: true, status: 'waiting' },
    { id: 18, number: 18, patient: { id: 5, name: "David Wilson" }, isEmergency: false, status: 'waiting' },
  ],
  lastCalled: [
    { id: 13, number: 13, patient: { id: 6, name: "Jennifer Taylor" }, isEmergency: false, status: 'completed' },
    { id: 12, number: 12, patient: { id: 7, name: "Robert Anderson" }, isEmergency: false, status: 'completed' },
  ]
}

export default function QueueDisplayPage() {
  const [queueData, setQueueData] = useState<QueueData>(initialDisplayData)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [blink, setBlink] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setBlink(prev => !prev)
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const updateFromStorage = () => {
      const storedQueue = localStorage.getItem('queueData')
      if (storedQueue) {
        try {
          const parsedData = JSON.parse(storedQueue)
          
          const currentTokenObj = parsedData.tokens.find((t: Token) => t.status === 'current')
          const waitingTokens = parsedData.tokens.filter((t: Token) => t.status === 'waiting')
          const completedTokens = parsedData.completedTokens?.slice(0, 2) || []
          
          setQueueData({
            currentToken: currentTokenObj?.number || null,
            nextTokens: waitingTokens.map((t: Token) => ({
              id: t.id,
              number: t.number,
              patient: t.patient,
              isEmergency: t.isEmergency,
              status: t.status
            })),
            lastCalled: completedTokens.map((t: Token) => ({
              id: t.id,
              number: t.number,
              patient: t.patient,
              isEmergency: t.isEmergency,
              status: t.status
            }))
          })
        } catch (error) {
          console.error("Error parsing queue data:", error)
        }
      }
    }

    updateFromStorage()
    window.addEventListener('storage', updateFromStorage)
    const pollInterval = setInterval(updateFromStorage, 2000)

    return () => {
      window.removeEventListener('storage', updateFromStorage)
      clearInterval(pollInterval)
    }
  }, [])

  const sortedTokens = [...queueData.nextTokens].sort((a, b) => {
    if (a.isEmergency && !b.isEmergency) return -1
    if (!a.isEmergency && b.isEmergency) return 1
    return a.number - b.number
  })

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Stethoscope className="h-8 w-8" />
            <h1 className="text-3xl font-bold">Wet Baes Clinic</h1>
          </div>
          <div className="text-xl">
            {currentTime.toLocaleDateString()} |{" "}
            {currentTime.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold mb-4">Now Serving</h2>
            <Card className="bg-green-900 border-green-700">
              <CardContent className="p-8 flex flex-col items-center justify-center">
                <div className="text-8xl font-bold mb-4">#{queueData.currentToken || '--'}</div>
                <div className="text-2xl">
                  {queueData.nextTokens.find(t => t.number === queueData.currentToken)?.patient.name || 
                   sortedTokens[0]?.patient.name || 
                   "None"}
                </div>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mt-8 mb-4">Last Called</h2>
            <div className="space-y-4">
              {queueData.lastCalled.map((token) => (
                <Card key={token.id} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="text-xl font-bold">#{token.number}</div>
                    <div>{token.patient.name}</div>
                    {token.isEmergency && (
                      <div className="px-2 py-1 bg-red-700 text-white text-xs rounded-full">Emergency</div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Waiting List</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedTokens.map((token) => (
                <Card
                  key={token.id}
                  className={
                    token.isEmergency 
                      ? blink 
                        ? "bg-red-900 border-red-700" 
                        : "bg-red-800 border-red-600"
                      : "bg-blue-900 border-blue-700"
                  }
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="text-2xl font-bold">#{token.number}</div>
                    <div className="text-lg">{token.patient.name}</div>
                    {token.isEmergency && (
                      <div className="px-2 py-1 bg-red-700 text-white text-xs rounded-full animate-pulse">
                        Emergency
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        <footer className="mt-12 text-center text-gray-400">
          <p>Please wait for your token number to be called</p>
          <p className="text-sm mt-2">For assistance, please contact the reception desk</p>
        </footer>
      </div>
    </div>
  )
}