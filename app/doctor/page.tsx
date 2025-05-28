"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { FileText, AlertTriangle } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"

type TokenStatus = 'current' | 'waiting' | 'completed' | 'hold'

interface Patient {
  id: number
  name: string
  phone?: string
  dob?: string
  age?: number
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

interface Case {
  id: number
  date: string
  reason: string
  prescription: string[]
  paymentStatus: string
  amount: number
}

interface QueueData {
  currentToken: Token | null
  waitingTokens: Token[]
  onHoldTokens: Token[]
  completedToday: Token[]
}

const initialQueueData: QueueData = {
  currentToken: { 
    id: 1, 
    number: 14, 
    patient: { id: 1, name: "John Smith" }, 
    isEmergency: false, 
    status: 'current' 
  },
  waitingTokens: [
    { id: 4, number: 17, patient: { id: 4, name: "Emily Davis" }, isEmergency: true, status: 'waiting' },
    { id: 2, number: 15, patient: { id: 2, name: "Sarah Johnson" }, isEmergency: false, status: 'waiting' },
    { id: 3, number: 16, patient: { id: 3, name: "Michael Brown" }, isEmergency: false, status: 'waiting' },
    { id: 5, number: 18, patient: { id: 5, name: "David Wilson" }, isEmergency: false, status: 'waiting' },
  ],
  onHoldTokens: [
    { id: 11, number: 8, patient: { id: 11, name: "Alex Turner" }, isEmergency: false, status: 'hold', holdAt: "10:30 AM" }
  ],
  completedToday: [
    { id: 6, number: 13, patient: { id: 6, name: "Jennifer Taylor" }, isEmergency: false, status: 'completed', completedAt: "09:15 AM" },
    { id: 7, number: 12, patient: { id: 7, name: "Robert Anderson" }, isEmergency: false, status: 'completed', completedAt: "09:30 AM" },
    { id: 8, number: 11, patient: { id: 8, name: "Lisa Thomas" }, isEmergency: true, status: 'completed', completedAt: "09:45 AM" },
  ],
}

const currentPatient = {
  id: 1,
  name: "John Smith",
  phone: "555-123-4567",
  dob: "1985-06-15",
  age: 38,
  note: "Patient has allergy to penicillin. Please be cautious when prescribing medication.",
  cases: [
    {
      id: 101,
      date: "2023-04-15",
      reason: "Fever and cough",
      prescription: ["Paracetamol", "Cough Syrup"],
      paymentStatus: "Paid",
      amount: 75,
    },
    {
      id: 102,
      date: "2023-06-22",
      reason: "Annual checkup",
      prescription: ["Multivitamins"],
      paymentStatus: "Paid",
      amount: 120,
    },
    {
      id: 103,
      date: "2023-09-10",
      reason: "Stomach pain",
      prescription: ["Antacid", "Probiotics"],
      paymentStatus: "Partial",
      amount: 95,
    },
  ],
}

export default function DoctorPage() {
  const [activeTab, setActiveTab] = useState("current")
  const [queueData, setQueueData] = useState<QueueData>(initialQueueData)
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false)

  useEffect(() => {
    const storedData = localStorage.getItem('queueData')
    if (storedData) {
      const parsedData = JSON.parse(storedData)
      const current = parsedData.tokens.find((t: Token) => t.status === "current")
      const waiting = parsedData.tokens.filter((t: Token) => t.status === "waiting")
      const onHold = parsedData.onHoldTokens || []
      const completedToday = parsedData.completedTokens?.filter((t: Token) => {
        const today = new Date().toLocaleDateString()
        return t.completedAt && new Date(t.completedAt).toLocaleDateString() === today
      }) || []

      setQueueData({
        currentToken: current || null,
        waitingTokens: waiting,
        onHoldTokens: onHold,
        completedToday: completedToday
      })
    }
  }, [])

  useEffect(() => {
    if (queueData.waitingTokens.some(t => t.isEmergency)) {
      setShowEmergencyAlert(true)
      const timer = setTimeout(() => setShowEmergencyAlert(false), 5000)
      return () => clearTimeout(timer)
    }
  }, [queueData.waitingTokens])

  const handleCompleteConsultation = () => {
    if (!queueData.currentToken) return

    const completedToken: Token = {
      ...queueData.currentToken,
      status: 'completed',
      completedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const updatedQueueData: QueueData = {
      ...queueData,
      currentToken: null,
      completedToday: [completedToken, ...queueData.completedToday]
    }

    setQueueData(updatedQueueData)
    
    const storedData = JSON.parse(localStorage.getItem('queueData') || '{}')
    localStorage.setItem('queueData', JSON.stringify({
      ...storedData,
      tokens: storedData.tokens.filter((t: Token) => t.id !== queueData.currentToken?.id),
      completedTokens: [completedToken, ...(storedData.completedTokens || [])]
    }))

    toast({
      title: "Consultation completed",
      description: `Patient ${queueData.currentToken.patient.name} has been marked as completed.`,
    })
  }

  const handleCallNext = () => {
    if (queueData.waitingTokens.length === 0) {
      toast({
        title: "No patients in queue",
        description: "There are no patients waiting in the queue.",
      })
      return
    }

    // Emergency cases come first
    const nextPatient = queueData.waitingTokens.find(t => t.isEmergency) || queueData.waitingTokens[0]
    const updatedNextPatient: Token = {
      ...nextPatient,
      status: 'current'
    }

    const updatedQueueData: QueueData = {
      ...queueData,
      currentToken: updatedNextPatient,
      waitingTokens: queueData.waitingTokens.filter(t => t.id !== nextPatient.id)
    }

    setQueueData(updatedQueueData)
    
    const storedData = JSON.parse(localStorage.getItem('queueData') || '{}')
    localStorage.setItem('queueData', JSON.stringify({
      ...storedData,
      tokens: [
        ...storedData.tokens.filter((t: Token) => t.id !== nextPatient.id),
        updatedNextPatient
      ]
    }))

    toast({
      title: "Next patient called",
      description: `Token #${nextPatient.number} (${nextPatient.patient.name}) has been called.`,
    })
  }

  const handlePutOnHold = () => {
    if (!queueData.currentToken) return

    const heldToken: Token = {
      ...queueData.currentToken,
      status: 'hold',
      holdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    }

    const updatedQueueData: QueueData = {
      ...queueData,
      currentToken: null,
      onHoldTokens: [heldToken, ...queueData.onHoldTokens]
    }

    setQueueData(updatedQueueData)
    
    const storedData = JSON.parse(localStorage.getItem('queueData') || '{}')
    localStorage.setItem('queueData', JSON.stringify({
      ...storedData,
      tokens: storedData.tokens.filter((t: Token) => t.id !== queueData.currentToken?.id),
      onHoldTokens: [heldToken, ...(storedData.onHoldTokens || [])]
    }))

    toast({
      title: "Token put on hold",
      description: `Token #${queueData.currentToken.number} has been put on hold.`,
    })
  }

  const handleRecallFromHold = (tokenId: number) => {
    const tokenToRecall = queueData.onHoldTokens.find(t => t.id === tokenId)
    if (!tokenToRecall) return

    const recalledToken: Token = {
      ...tokenToRecall,
      status: 'waiting'
    }

    const updatedQueueData: QueueData = {
      ...queueData,
      onHoldTokens: queueData.onHoldTokens.filter(t => t.id !== tokenId),
      waitingTokens: [...queueData.waitingTokens, recalledToken]
    }

    setQueueData(updatedQueueData)
    
    const storedData = JSON.parse(localStorage.getItem('queueData') || '{}')
    localStorage.setItem('queueData', JSON.stringify({
      ...storedData,
      onHoldTokens: storedData.onHoldTokens.filter((t: Token) => t.id !== tokenId),
      tokens: [...storedData.tokens, recalledToken]
    }))

    toast({
      title: "Token recalled from hold",
      description: `Token #${tokenToRecall.number} has been added back to the queue.`,
    })
  }

  const handleMoveNext = (tokenId: number) => {
    const tokenIndex = queueData.waitingTokens.findIndex(t => t.id === tokenId)
    if (tokenIndex === -1) return

    const tokenToMove = queueData.waitingTokens[tokenIndex]
    const updatedWaitingTokens = [...queueData.waitingTokens]
    
    const emergencyCount = queueData.waitingTokens.filter(t => t.isEmergency).length
    const insertPosition = emergencyCount
    
    updatedWaitingTokens.splice(tokenIndex, 1)
    updatedWaitingTokens.splice(insertPosition, 0, tokenToMove)

    setQueueData({
      ...queueData,
      waitingTokens: updatedWaitingTokens
    })
    
    const storedData = JSON.parse(localStorage.getItem('queueData') || '{}')
    const storedTokenIndex = storedData.tokens.findIndex((t: Token) => t.id === tokenId)
    if (storedTokenIndex !== -1) {
      const storedTokenToMove = storedData.tokens[storedTokenIndex]
      storedData.tokens.splice(storedTokenIndex, 1)
      storedData.tokens.splice(insertPosition, 0, storedTokenToMove)
      localStorage.setItem('queueData', JSON.stringify(storedData))
    }

    toast({
      title: "Token moved",
      description: `Token #${tokenToMove.number} has been moved to the next position.`,
    })
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-green-100 text-green-800"
      case "Partial":
        return "bg-yellow-100 text-yellow-800"
      case "Unpaid":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <RouteGuard allowedRoles={["doctor"]}>
      <div className="p-6 space-y-6">
        {showEmergencyAlert && (
          <div className="bg-red-500 text-white p-4 rounded-md flex items-center animate-pulse">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <span>Emergency case detected in the queue! Please attend immediately.</span>
          </div>
        )}

        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Doctor's Dashboard</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Today:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Queue Status</CardTitle>
              <CardDescription>Current patient information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {queueData.currentToken ? (
                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">Current Token</div>
                  <div className="text-5xl font-bold my-2">#{queueData.currentToken.number}</div>
                  <div className="text-sm font-medium">{queueData.currentToken.patient.name}</div>
                  {queueData.currentToken.isEmergency && (
                    <Badge className="mt-2 bg-red-500">Emergency</Badge>
                  )}
                </div>
              ) : (
                <div className="text-center p-6 bg-muted rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground">No current patient</div>
                  <div className="text-2xl font-bold my-2">--</div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Waiting Patients</span>
                  <span className="font-medium">{queueData.waitingTokens.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Emergency Cases</span>
                  <span className="font-medium">{queueData.waitingTokens.filter(t => t.isEmergency).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">On Hold</span>
                  <span className="font-medium">{queueData.onHoldTokens.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Completed Today</span>
                  <span className="font-medium">{queueData.completedToday.length}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                {queueData.currentToken && (
                  <>
                    <Button className="w-full" onClick={handleCompleteConsultation}>
                      Complete Consultation
                    </Button>
                    <Button 
                      className="w-full" 
                      variant="outline" 
                      onClick={handlePutOnHold}
                    >
                      Put Token on Hold
                    </Button>
                  </>
                )}
                <Button 
                  className="w-full" 
                  variant={queueData.waitingTokens.length > 0 ? "default" : "outline"}
                  onClick={handleCallNext}
                  disabled={queueData.waitingTokens.length === 0}
                >
                  Call Next Patient
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <Tabs defaultValue="current" onValueChange={setActiveTab}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Patient Information</CardTitle>
                  <TabsList>
                    <TabsTrigger value="current">Current Patient</TabsTrigger>
                    <TabsTrigger value="queue">Queue</TabsTrigger>
                    <TabsTrigger value="hold">On Hold</TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription>
                  {activeTab === "current"
                    ? "Details and history of the current patient"
                    : activeTab === "queue"
                    ? "Upcoming patients in the queue"
                    : "Tokens currently on hold"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TabsContent value="current">
                  <div className="space-y-6">
                    {queueData.currentToken ? (
                      <>
                        {currentPatient.note && (
                          <div className="p-4 bg-red-100 text-red-800 rounded-md animate-pulse">
                            <div className="font-bold mb-1">Important Note:</div>
                            <div>{currentPatient.note}</div>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Patient Name</p>
                              <p className="font-medium">{currentPatient.name}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
                              <p>{currentPatient.phone}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                              <p>{new Date(currentPatient.dob || '').toLocaleDateString()}</p>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-muted-foreground">Age</p>
                              <p>{currentPatient.age} years</p>
                            </div>
                          </div>
                        </div>

                        <div>
                          <h3 className="text-lg font-medium mb-2">Case History</h3>
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Date</TableHead>
                                  <TableHead>Reason</TableHead>
                                  <TableHead>Prescription</TableHead>
                                  <TableHead>Payment</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {currentPatient.cases.map((caseItem) => (
                                  <TableRow key={caseItem.id}>
                                    <TableCell>{new Date(caseItem.date).toLocaleDateString()}</TableCell>
                                    <TableCell>{caseItem.reason}</TableCell>
                                    <TableCell>
                                      <div className="flex flex-wrap gap-1">
                                        {caseItem.prescription.map((med, i) => (
                                          <Badge key={i} variant="secondary">
                                            {med}
                                          </Badge>
                                        ))}
                                      </div>
                                    </TableCell>
                                    <TableCell>
                                      <span
                                        className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(caseItem.paymentStatus)}`}
                                      >
                                        {caseItem.paymentStatus} (${caseItem.amount})
                                      </span>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        <div className="flex justify-between">
                          <Button variant="outline" asChild>
                            <Link href={`/patients/${currentPatient.id}`}>
                              <FileText className="mr-2 h-4 w-4" />
                              View Full Profile
                            </Link>
                          </Button>
                          <Button asChild>
                            <Link href={`/cases/new?patientId=${currentPatient.id}`}>Add New Case</Link>
                          </Button>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No current patient selected</p>
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="queue">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token #</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queueData.waitingTokens.length > 0 ? (
                          [...queueData.waitingTokens.filter(t => t.isEmergency), ...queueData.waitingTokens.filter(t => !t.isEmergency)].map((token) => (
                            <TableRow key={token.id}>
                              <TableCell className="font-medium">#{token.number}</TableCell>
                              <TableCell>
                                <Link href={`/patients/${token.patient.id}`} className="hover:underline">
                                  {token.patient.name}
                                </Link>
                              </TableCell>
                              <TableCell>
                                {token.isEmergency ? (
                                  <Badge className="bg-red-500">Emergency</Badge>
                                ) : (
                                  <Badge variant="outline">Waiting</Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-2">
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleMoveNext(token.id)}
                                  >
                                    Move Next
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      // Similar to put on hold but for waiting tokens
                                      const tokenToHold = queueData.waitingTokens.find(t => t.id === token.id)
                                      if (!tokenToHold) return

                                      setQueueData({
                                        ...queueData,
                                        waitingTokens: queueData.waitingTokens.filter(t => t.id !== token.id),
                                        onHoldTokens: [
                                          {
                                            ...tokenToHold,
                                            status: 'hold',
                                            holdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                          },
                                          ...queueData.onHoldTokens
                                        ]
                                      })

                                      // Update localStorage
                                      const storedData = JSON.parse(localStorage.getItem('queueData') || '{}')
                                      localStorage.setItem('queueData', JSON.stringify({
                                        ...storedData,
                                        tokens: storedData.tokens.filter((t: Token) => t.id !== token.id),
                                        onHoldTokens: [
                                          {
                                            ...tokenToHold,
                                            status: 'hold',
                                            holdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                                          },
                                          ...storedData.onHoldTokens
                                        ]
                                      }))

                                      toast({
                                        title: "Token put on hold",
                                        description: `Token #${tokenToHold.number} has been put on hold.`,
                                      })
                                    }}
                                  >
                                    Hold
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                              No patients in the queue
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="hold">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token #</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Hold At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queueData.onHoldTokens.length > 0 ? (
                          queueData.onHoldTokens.map((token) => (
                            <TableRow key={token.id}>
                              <TableCell className="font-medium">#{token.number}</TableCell>
                              <TableCell>
                                <Link href={`/patients/${token.patient.id}`} className="hover:underline">
                                  {token.patient.name}
                                </Link>
                              </TableCell>
                              <TableCell>
                                <Badge className="bg-yellow-500">On Hold</Badge>
                              </TableCell>
                              <TableCell>{token.holdAt}</TableCell>
                              <TableCell>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleRecallFromHold(token.id)}
                                >
                                  Recall to Queue
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                              No tokens on hold
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </div>
      </div>
    </RouteGuard>
  )
}