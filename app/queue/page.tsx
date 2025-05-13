"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, ExternalLink, ChevronLeft, ChevronRight } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"
import { useRouter } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Define TokenStatus as a union of string literals
const TOKEN_STATUSES = ['current', 'waiting', 'completed', 'hold'] as const
type TokenStatus = typeof TOKEN_STATUSES[number]

interface Patient {
  id: number
  name: string
}

interface Token {
  id: number
  number: number
  patient: Patient
  isEmergency: boolean
  status: TokenStatus // Use the TokenStatus type here
  holdAt?: string
  completedAt?: string
}

interface QueueData {
  currentToken: number
  tokens: Token[]
  onHoldTokens: Token[]
  completedTokens: Token[]
}

const initialQueueData: QueueData = {
  currentToken: 14,
  tokens: [
    { id: 1, number: 14, patient: { id: 1, name: "John Smith" }, isEmergency: false, status: "current" },
    { id: 4, number: 17, patient: { id: 4, name: "Emily Davis" }, isEmergency: true, status: "waiting" },
    { id: 2, number: 15, patient: { id: 2, name: "Sarah Johnson" }, isEmergency: false, status: "waiting" },
    { id: 3, number: 16, patient: { id: 3, name: "Michael Brown" }, isEmergency: false, status: "waiting" },
    { id: 5, number: 18, patient: { id: 5, name: "David Wilson" }, isEmergency: false, status: "waiting" },
  ],
  onHoldTokens: [
    { id: 11, number: 8, patient: { id: 11, name: "Alex Turner" }, isEmergency: false, status: "hold", holdAt: "10:30 AM" }
  ],
  completedTokens: [
    { id: 6, number: 13, patient: { id: 6, name: "Jennifer Taylor" }, isEmergency: false, status: "completed", completedAt: "09:15 AM" },
    { id: 7, number: 12, patient: { id: 7, name: "Robert Anderson" }, isEmergency: false, status: "completed", completedAt: "09:30 AM" },
    { id: 8, number: 11, patient: { id: 8, name: "Lisa Thomas" }, isEmergency: true, status: "completed", completedAt: "09:45 AM" },
  ],
}

export default function QueuePage() {
  const [queueData, setQueueData] = useState<QueueData>(initialQueueData)
  const [activeTab, setActiveTab] = useState("active")
  const router = useRouter()

  // Pagination
  const [rowsPerPage, setRowsPerPage] = useState(5)
  const [activePage, setActivePage] = useState(1)
  const [holdPage, setHoldPage] = useState(1)
  const [completedPage, setCompletedPage] = useState(1)

  const getStatusBadge = (status: TokenStatus, isEmergency: boolean) => {
    if (isEmergency) return <Badge className="bg-red-500">Emergency</Badge>
    switch (status) {
      case "current": return <Badge className="bg-green-500">Current</Badge>
      case "waiting": return <Badge variant="outline">Waiting</Badge>
      case "completed": return <Badge variant="secondary">Completed</Badge>
      case "hold": return <Badge className="bg-yellow-500">On Hold</Badge>
      default: return null
    }
  }

  // Organize tokens: current → emergencies → regular
  const getDisplayTokens = () => {
    const current = queueData.tokens.find(t => t.status === "current")
    const emergencies = queueData.tokens.filter(t => t.status === "waiting" && t.isEmergency)
    const regular = queueData.tokens.filter(t => t.status === "waiting" && !t.isEmergency)
    return [...(current ? [current] : []), ...emergencies, ...regular]
  }

  const callNextPatient = () => {
    setQueueData(prev => {
      const current = prev.tokens.find(t => t.status === "current")
      const completedPatient = current ? {
        ...current,
        status: "completed" as const, // Explicitly type as TokenStatus
        completedAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      } : null
      
      const emergencies = prev.tokens.filter(t => t.status === "waiting" && t.isEmergency)
      const regular = prev.tokens.filter(t => t.status === "waiting" && !t.isEmergency)
      
      const nextPatient = emergencies[0] || regular[0]
      
      return {
        ...prev,
        currentToken: nextPatient?.number || prev.currentToken,
        tokens: [
          ...prev.tokens.filter(t => t.id !== current?.id && t.id !== nextPatient?.id),
          ...(nextPatient ? [{ ...nextPatient, status: "current" as const }] : [])
        ],
        completedTokens: completedPatient ? [completedPatient, ...prev.completedTokens] : prev.completedTokens,
        onHoldTokens: prev.onHoldTokens
      }
    })
  }

  const moveToNextPosition = (tokenId: number) => {
    setQueueData(prev => {
      // Find the token we want to move
      const tokenToMove = prev.tokens.find(t => t.id === tokenId);
      if (!tokenToMove) return prev;
  
      // Filter out the token we're moving
      const otherTokens = prev.tokens.filter(t => t.id !== tokenId);
  
      // Find current token and emergency tokens
      const currentToken = prev.tokens.find(t => t.status === "current");
      const emergencyTokens = prev.tokens.filter(t => t.isEmergency && t.status === "waiting");
  
      // Determine where to insert the token
      let insertPosition = 0;
      
      // If there's a current token, insert after it
      if (currentToken) {
        insertPosition = otherTokens.findIndex(t => t.id === currentToken.id) + 1;
      }
      
      // If there are emergencies, insert after the last emergency
      if (emergencyTokens.length > 0) {
        const lastEmergency = emergencyTokens[emergencyTokens.length - 1];
        insertPosition = otherTokens.findIndex(t => t.id === lastEmergency.id) + 1;
      }
  
      // Create the new tokens array with the moved token in the correct position
      const newTokens = [
        ...otherTokens.slice(0, insertPosition),
        tokenToMove,
        ...otherTokens.slice(insertPosition)
      ];
  
      return {
        ...prev,
        tokens: newTokens,
        onHoldTokens: prev.onHoldTokens,
        completedTokens: prev.completedTokens
      };
    });
  };

  const putOnHold = (tokenId: number) => {
    setQueueData(prev => {
      const token = prev.tokens.find(t => t.id === tokenId)
      if (!token) return prev
      
      return {
        ...prev,
        tokens: prev.tokens.filter(t => t.id !== tokenId),
        onHoldTokens: [
          ...prev.onHoldTokens,
          { 
            ...token, 
            status: "hold" as const,
            holdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) 
          }
        ],
        completedTokens: prev.completedTokens
      }
    })
  }

  const recallFromHold = (tokenId: number) => {
    setQueueData(prev => {
      const tokenToRecall = prev.onHoldTokens.find(t => t.id === tokenId)
      if (!tokenToRecall) return prev
      
      return {
        ...prev,
        onHoldTokens: prev.onHoldTokens.filter(t => t.id !== tokenId),
        tokens: [
          ...prev.tokens,
          { ...tokenToRecall, status: "waiting" as const }
        ],
        completedTokens: prev.completedTokens
      }
    })
  }

  // Paginated data
  const displayTokens = getDisplayTokens()
  const paginatedActive = displayTokens.slice((activePage - 1) * rowsPerPage, activePage * rowsPerPage)
  const paginatedHold = queueData.onHoldTokens.slice((holdPage - 1) * rowsPerPage, holdPage * rowsPerPage)
  const paginatedCompleted = queueData.completedTokens.slice((completedPage - 1) * rowsPerPage, completedPage * rowsPerPage)

  return (
    <RouteGuard allowedRoles={["staff", "admin"]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Queue Management</h1>
          <div className="flex items-center gap-2">
            <Button asChild>
              <Link href="/queue/new">
                <Clock className="mr-2 h-4 w-4" />
                Generate Token
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/queue/display" target="_blank">
                <ExternalLink className="mr-2 h-4 w-4" />
                Open Display
              </Link>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle>Queue Status</CardTitle>
              <CardDescription>Current token information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Now Serving</div>
                <div className="text-5xl font-bold my-2">#{queueData.currentToken}</div>
                <div className="text-sm font-medium">
                  {queueData.tokens.find(t => t.status === "current")?.patient.name || "None"}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Waiting:</span>
                  <span>{queueData.tokens.filter(t => t.status === "waiting").length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Emergencies:</span>
                  <span>{queueData.tokens.filter(t => t.isEmergency).length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">On Hold:</span>
                  <span>{queueData.onHoldTokens.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Completed:</span>
                  <span>{queueData.completedTokens.length}</span>
                </div>
              </div>

              <Button className="w-full" onClick={callNextPatient}>
                Call Next Patient
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <Tabs defaultValue="active" onValueChange={setActiveTab}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Queue List</CardTitle>
                  <TabsList>
                    <TabsTrigger value="active">Active</TabsTrigger>
                    <TabsTrigger value="hold">On Hold</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Active Queue */}
                <TabsContent value="active" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedActive.map(token => (
                          <TableRow key={token.id}>
                            <TableCell>#{token.number}</TableCell>
                            <TableCell>
                              <Link href={`/patients/${token.patient.id}`} className="hover:underline">
                                {token.patient.name}
                              </Link>
                            </TableCell>
                            <TableCell>{getStatusBadge(token.status, token.isEmergency)}</TableCell>
                            <TableCell>
                              {token.status === "current" ? (
                                <Button size="sm" onClick={callNextPatient}>Complete</Button>
                              ) : (
                                <Button size="sm" variant="outline" onClick={() => moveToNextPosition(token.id)}>
                                  Move Next
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Select
                        value={`${rowsPerPage}`}
                        onValueChange={val => {
                          setRowsPerPage(Number(val))
                          setActivePage(1)
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 20].map(size => (
                            <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activePage === 1}
                        onClick={() => setActivePage(p => Math.max(p - 1, 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activePage * rowsPerPage >= displayTokens.length}
                        onClick={() => setActivePage(p => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* On Hold */}
                <TabsContent value="hold" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Hold At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedHold.map(token => (
                          <TableRow key={token.id}>
                            <TableCell>#{token.number}</TableCell>
                            <TableCell>
                              <Link href={`/patients/${token.patient.id}`} className="hover:underline">
                                {token.patient.name}
                              </Link>
                            </TableCell>
                            <TableCell>{getStatusBadge(token.status, token.isEmergency)}</TableCell>
                            <TableCell>{token.holdAt}</TableCell>
                            <TableCell>
                              <Button size="sm" variant="outline" onClick={() => recallFromHold(token.id)}>
                                Recall
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Select
                        value={`${rowsPerPage}`}
                        onValueChange={val => {
                          setRowsPerPage(Number(val))
                          setActivePage(1)
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 20].map(size => (
                            <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activePage === 1}
                        onClick={() => setActivePage(p => Math.max(p - 1, 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activePage * rowsPerPage >= displayTokens.length}
                        onClick={() => setActivePage(p => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                {/* Completed */}
                <TabsContent value="completed" className="space-y-4">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Completed At</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedCompleted.map(token => (
                          <TableRow key={token.id}>
                            <TableCell>#{token.number}</TableCell>
                            <TableCell>
                              <Link href={`/patients/${token.patient.id}`} className="hover:underline">
                                {token.patient.name}
                              </Link>
                            </TableCell>
                            <TableCell>{getStatusBadge(token.status, token.isEmergency)}</TableCell>
                            <TableCell>{token.completedAt}</TableCell>
                            <TableCell>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => router.push(`/patients/${token.patient.id}/today`)}
                              >
                                View Case
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Select
                        value={`${rowsPerPage}`}
                        onValueChange={val => {
                          setRowsPerPage(Number(val))
                          setActivePage(1)
                        }}
                      >
                        <SelectTrigger className="h-8 w-[70px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[5, 10, 20].map(size => (
                            <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activePage === 1}
                        onClick={() => setActivePage(p => Math.max(p - 1, 1))}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={activePage * rowsPerPage >= displayTokens.length}
                        onClick={() => setActivePage(p => p + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
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