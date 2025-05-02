"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Stethoscope } from "lucide-react"

// Mock queue data
const initialQueueData = {
  currentToken: 14,
  nextTokens: [
    { number: 15, patient: { name: "Sarah Johnson" }, isEmergency: false },
    { number: 16, patient: { name: "Michael Brown" }, isEmergency: false },
    { number: 17, patient: { name: "Emily Davis" }, isEmergency: true },
    { number: 18, patient: { name: "David Wilson" }, isEmergency: false },
  ],
  lastCalled: [
    { number: 13, patient: { name: "Jennifer Taylor" }, isEmergency: false },
    { number: 12, patient: { name: "Robert Anderson" }, isEmergency: false },
  ],
}

export default function QueueDisplayPage() {
  const [queueData, setQueueData] = useState(initialQueueData)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // In a real app, this would use Socket.io to get real-time updates
  // For demo purposes, we'll simulate updates every 10 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      // Simulate queue movement (not needed for demo, but would be here in real app)
    }, 10000)

    return () => clearInterval(timer)
  }, [])

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
                <div className="text-8xl font-bold mb-4">#{queueData.currentToken}</div>
                <div className="text-2xl">
                  {queueData.nextTokens.length > 0 && queueData.nextTokens[0].patient.name}
                </div>
              </CardContent>
            </Card>

            <h2 className="text-2xl font-bold mt-8 mb-4">Last Called</h2>
            <div className="space-y-4">
              {queueData.lastCalled.map((token) => (
                <Card key={token.number} className="bg-gray-800 border-gray-700">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="text-xl font-bold">#{token.number}</div>
                    <div>{token.patient.name}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-bold mb-4">Waiting List</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {queueData.nextTokens.map((token) => (
                <Card
                  key={token.number}
                  className={token.isEmergency ? "bg-red-900 border-red-700" : "bg-blue-900 border-blue-700"}
                >
                  <CardContent className="p-4 flex justify-between items-center">
                    <div className="text-2xl font-bold">#{token.number}</div>
                    <div className="text-lg">{token.patient.name}</div>
                    {token.isEmergency && (
                      <div className="px-2 py-1 bg-red-700 text-white text-xs rounded-full">Emergency</div>
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
