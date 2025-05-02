"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock, ExternalLink } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"

// Mock queue data
const queueData = {
  currentToken: 14,
  tokens: [
    { id: 1, number: 14, patient: { id: 1, name: "John Smith" }, isEmergency: false, status: "current" },
    { id: 2, number: 15, patient: { id: 2, name: "Sarah Johnson" }, isEmergency: false, status: "waiting" },
    { id: 3, number: 16, patient: { id: 3, name: "Michael Brown" }, isEmergency: false, status: "waiting" },
    { id: 4, number: 17, patient: { id: 4, name: "Emily Davis" }, isEmergency: true, status: "waiting" },
    { id: 5, number: 18, patient: { id: 5, name: "David Wilson" }, isEmergency: false, status: "waiting" },
  ],
  completedTokens: [
    { id: 6, number: 13, patient: { id: 6, name: "Jennifer Taylor" }, isEmergency: false, status: "completed" },
    { id: 7, number: 12, patient: { id: 7, name: "Robert Anderson" }, isEmergency: false, status: "completed" },
    { id: 8, number: 11, patient: { id: 8, name: "Lisa Thomas" }, isEmergency: true, status: "completed" },
    { id: 9, number: 10, patient: { id: 9, name: "James Johnson" }, isEmergency: false, status: "completed" },
    { id: 10, number: 9, patient: { id: 10, name: "Patricia Martinez" }, isEmergency: false, status: "completed" },
  ],
}

export default function QueuePage() {
  const [activeTab, setActiveTab] = useState("active")

  const getStatusBadge = (status, isEmergency) => {
    if (isEmergency) {
      return <Badge className="bg-red-500">Emergency</Badge>
    }

    switch (status) {
      case "current":
        return <Badge className="bg-green-500">Current</Badge>
      case "waiting":
        return <Badge variant="outline">Waiting</Badge>
      case "completed":
        return <Badge variant="secondary">Completed</Badge>
      default:
        return null
    }
  }

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
                  {queueData.tokens.find((t) => t.status === "current")?.patient.name}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Total Waiting</span>
                  <span className="font-medium">{queueData.tokens.filter((t) => t.status === "waiting").length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Emergency Cases</span>
                  <span className="font-medium">{queueData.tokens.filter((t) => t.isEmergency).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Completed Today</span>
                  <span className="font-medium">{queueData.completedTokens.length}</span>
                </div>
              </div>

              <div className="pt-2">
                <Button className="w-full" variant="outline">
                  Call Next Patient
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-3">
            <Tabs defaultValue="active" onValueChange={setActiveTab}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Queue List</CardTitle>
                  <TabsList>
                    <TabsTrigger value="active">Active Queue</TabsTrigger>
                    <TabsTrigger value="completed">Completed</TabsTrigger>
                  </TabsList>
                </div>
                <CardDescription>
                  {activeTab === "active"
                    ? "Currently active tokens in the queue"
                    : "Tokens that have been completed today"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TabsContent value="active">
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
                        {queueData.tokens.map((token) => (
                          <TableRow key={token.id}>
                            <TableCell className="font-medium">#{token.number}</TableCell>
                            <TableCell>
                              <Link href={`/patients/${token.patient.id}`} className="hover:underline">
                                {token.patient.name}
                              </Link>
                            </TableCell>
                            <TableCell>{getStatusBadge(token.status, token.isEmergency)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {token.status === "waiting" && (
                                  <Button size="sm" variant="outline">
                                    Call Now
                                  </Button>
                                )}
                                {token.status === "current" && <Button size="sm">Complete</Button>}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>

                <TabsContent value="completed">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Token #</TableHead>
                          <TableHead>Patient</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Completed At</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {queueData.completedTokens.map((token) => (
                          <TableRow key={token.id}>
                            <TableCell className="font-medium">#{token.number}</TableCell>
                            <TableCell>
                              <Link href={`/patients/${token.patient.id}`} className="hover:underline">
                                {token.patient.name}
                              </Link>
                            </TableCell>
                            <TableCell>{getStatusBadge(token.status, token.isEmergency)}</TableCell>
                            <TableCell>
                              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                            </TableCell>
                          </TableRow>
                        ))}
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
