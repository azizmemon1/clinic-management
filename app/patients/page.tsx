"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Clock } from "lucide-react"

// Mock data for patients
const mockPatients = [
  { id: 1, name: "John Smith", phone: "555-123-4567", dob: "1985-06-15", familyGroup: "Smith Family" },
  { id: 2, name: "Sarah Johnson", phone: "555-234-5678", dob: "1990-03-22", familyGroup: null },
  { id: 3, name: "Michael Brown", phone: "555-345-6789", dob: "1978-11-30", familyGroup: "Brown Family" },
  { id: 4, name: "Emily Davis", phone: "555-456-7890", dob: "1992-08-12", familyGroup: null },
  { id: 5, name: "David Wilson", phone: "555-567-8901", dob: "1982-04-25", familyGroup: "Wilson Family" },
  { id: 6, name: "Jennifer Taylor", phone: "555-678-9012", dob: "1975-09-18", familyGroup: null },
  { id: 7, name: "Robert Anderson", phone: "555-789-0123", dob: "1988-12-05", familyGroup: null },
  { id: 8, name: "Lisa Thomas", phone: "555-890-1234", dob: "1995-02-28", familyGroup: "Thomas Family" },
]

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredPatients = mockPatients.filter((patient) =>
    patient.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Patients</h1>
        <div className="flex gap-2">
        <Button asChild>
          <Link href="/patients/family/new">
            <UserPlus className="mr-2 h-4 w-4" />
            New Family
          </Link>
        </Button>
        <Button asChild>
          <Link href="/patients/new">
            <UserPlus className="mr-2 h-4 w-4" />
            New Patient
          </Link>
        </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Patient Management</CardTitle>
          <CardDescription>Search and manage patient records</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            {/* Advanced Search button removed */}
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Date of Birth</TableHead>
                  <TableHead>Family Group</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id}>
                      <TableCell className="font-medium">{patient.name}</TableCell>
                      <TableCell>{patient.phone}</TableCell>
                      <TableCell>{new Date(patient.dob).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {patient.familyGroup ? (
                          <Badge variant="outline">{patient.familyGroup}</Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">None</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/patients/${patient.id}`}>View</Link>
                          </Button>
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/queue/new?patientId=${patient.id}&referrer=/patients`}>
                              <Clock className="mr-1 h-3 w-3" />
                              Token
                            </Link>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      No patients found. Try a different search term or add a new patient.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
