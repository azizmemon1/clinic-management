"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { FileText } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"

// Mock queue data
const queueData = {
  currentToken: { id: 1, number: 14, patient: { id: 1, name: "John Smith" }, isEmergency: false },
  waitingTokens: [
    { id: 2, number: 15, patient: { id: 2, name: "Sarah Johnson" }, isEmergency: false },
    { id: 3, number: 16, patient: { id: 3, name: "Michael Brown" }, isEmergency: false },
    { id: 4, number: 17, patient: { id: 4, name: "Emily Davis" }, isEmergency: true },
    { id: 5, number: 18, patient: { id: 5, name: "David Wilson" }, isEmergency: false },
  ],
  completedToday: [
    { id: 6, number: 13, patient: { id: 6, name: "Jennifer Taylor" }, isEmergency: false },
    { id: 7, number: 12, patient: { id: 7, name: "Robert Anderson" }, isEmergency: false },
    { id: 8, number: 11, patient: { id: 8, name: "Lisa Thomas" }, isEmergency: true },
  ],
}

// Mock patient data for current patient
const currentPatient = {
  id: 1,
  name: "John Smith",
  phone: "555-123-4567",
  dob: "1985-06-15",
  age: 38,
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

  const handleCompleteConsultation = () => {
    toast({
      title: "Consultation completed",
      description: `Patient ${currentPatient.name} has been marked as completed.`,
    })
  }

  const handleCallNext = () => {
    toast({
      title: "Next patient called",
      description: `Token #${queueData.waitingTokens[0].number} (${queueData.waitingTokens[0].patient.name}) has been called.`,
    })
  }

  const getPaymentStatusColor = (status : string) => {
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
    <RouteGuard allowedRoles={["doctor", "admin"]}>
      <div className="p-6 space-y-6">
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
              <div className="text-center p-6 bg-muted rounded-lg">
                <div className="text-sm font-medium text-muted-foreground">Current Token</div>
                <div className="text-5xl font-bold my-2">#{queueData.currentToken.number}</div>
                <div className="text-sm font-medium">{queueData.currentToken.patient.name}</div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Waiting Patients</span>
                  <span className="font-medium">{queueData.waitingTokens.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Emergency Cases</span>
                  <span className="font-medium">{queueData.waitingTokens.filter((t) => t.isEmergency).length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-muted-foreground">Completed Today</span>
                  <span className="font-medium">{queueData.completedToday.length}</span>
                </div>
              </div>

              <div className="space-y-2 pt-2">
                <Button className="w-full" onClick={handleCompleteConsultation}>
                  Complete Consultation
                </Button>
                <Button className="w-full" variant="outline" onClick={handleCallNext}>
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
                  </TabsList>
                </div>
                <CardDescription>
                  {activeTab === "current"
                    ? "Details and history of the current patient"
                    : "Upcoming patients in the queue"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TabsContent value="current">
                  <div className="space-y-6">
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
                          <p>{new Date(currentPatient.dob).toLocaleDateString()}</p>
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
                        <Link href={`/cases/new/${currentPatient.id}`}>Add New Case</Link>
                      </Button>
                    </div>
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
                        {queueData.waitingTokens.map((token) => (
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
                              <Button size="sm" variant="outline">
                                Call Now
                              </Button>
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
