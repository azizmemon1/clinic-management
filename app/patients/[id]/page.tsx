"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Clock, Edit, UserPlus } from "lucide-react"

// Mock patient data
const patient = {
  id: 1,
  name: "John Smith",
  phone: "555-123-4567",
  dob: "1985-06-15",
  familyGroup: "Smith Family",
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
    {
      id: 104,
      date: "2024-01-05",
      reason: "Headache and dizziness",
      prescription: ["Paracetamol", "Rest"],
      paymentStatus: "Unpaid",
      amount: 60,
    },
  ],
  familyMembers: [
    { id: 2, name: "Mary Smith", relation: "Spouse" },
    { id: 3, name: "James Smith", relation: "Son" },
    { id: 4, name: "Emma Smith", relation: "Daughter" },
  ],
}

export default function PatientDetailPage({ params }) {
  const patientId = params.id

  const getPaymentStatusColor = (status :string) => {
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
    <div className="p-6 space-y-6">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href="/patients">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Patients
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{patient.name}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Patient Information</CardTitle>
            <CardDescription>Basic details and family group</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Full Name</p>
              <p>{patient.name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Phone Number</p>
              <p>{patient.phone}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
              <p>{new Date(patient.dob).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Age</p>
              <p>{new Date().getFullYear() - new Date(patient.dob).getFullYear()} years</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Family Group</p>
              {patient.familyGroup ? (
                <Badge variant="outline">{patient.familyGroup}</Badge>
              ) : (
                <span className="text-muted-foreground text-sm">None</span>
              )}
            </div>

            <div className="pt-4 flex flex-col gap-2">
              <Button asChild>
                <Link href={`/queue/new?patientId=${patient.id}&referrer=/patients/${patient.id}`}>
                  <Clock className="mr-2 h-4 w-4" />
                  Generate Token
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={`/patients/${patient.id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Patient
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <Tabs defaultValue="cases">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Patient History</CardTitle>
                <TabsList>
                  <TabsTrigger value="cases">Case History</TabsTrigger>
                  <TabsTrigger value="family">Family Members</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>View patient's medical history and family information</CardDescription>
            </CardHeader>
            <CardContent>
              <TabsContent value="cases" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Prescription</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {patient.cases.map((caseItem) => (
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
                          <TableCell>${caseItem.amount}</TableCell>
                          <TableCell>
                            <span
                              className={`px-2 py-1 rounded-full text-xs ${getPaymentStatusColor(caseItem.paymentStatus)}`}
                            >
                              {caseItem.paymentStatus}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <div className="flex justify-end">
                  <Button asChild>
                    <Link href={`/doctor/new-case/${patient.id}`}>Add New Case</Link>
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="family">
                {patient.familyMembers && patient.familyMembers.length > 0 ? (
                  <div className="space-y-4">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Relation</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {patient.familyMembers.map((member) => (
                            <TableRow key={member.id}>
                              <TableCell className="font-medium">{member.name}</TableCell>
                              <TableCell>{member.relation}</TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/patients/${member.id}`}>View</Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                    <div className="flex justify-end">
                      <Button variant="outline" asChild>
                        <Link href={`/patients/new?familyGroup=${patient.familyGroup}&referrerPatientId=${patient.id}`}>
                          <UserPlus className="mr-2 h-4 w-4" />
                          Add Family Member
                        </Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No family members linked to this patient.</p>
                    <Button variant="outline" asChild>
                      <Link href={`/patients/new?familyGroup=${patient.familyGroup}&referrerPatientId=${patient.id}`}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Add Family Member
                      </Link>
                    </Button>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
