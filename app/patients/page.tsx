"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Search, UserPlus, Clock, ChevronLeft, ChevronRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RouteGuard } from "@/components/route-guard"

// Mock data for patients
const mockPatients = [
  { id: 1, name: "John Smith", phone: "555-123-4567", dob: "1985-06-15", familyGroup: "Smith Family" },
  { id: 2, name: "Sarah Johnson", phone: "555-234-5678", dob: "1990-03-22", familyGroup: null },
  { id: 3, name: "Michael Brown", phone: "555-345-6789", dob: "1978-11-30", familyGroup: "Brown Family" },
  // ... add more mock patients as needed (total > 10 for pagination testing)
]

export default function PatientsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filter patients by name or family group
  const filteredPatients = mockPatients.filter((patient) => {
    const searchLower = searchQuery.toLowerCase()
    return (
      patient.name.toLowerCase().includes(searchLower) ||
      (patient.familyGroup && patient.familyGroup.toLowerCase().includes(searchLower))
    ) // Added this closing parenthesis
  })

  // Pagination logic
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage)
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  return (
    <RouteGuard allowedRoles={["doctor", "staff"]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Patients</h1>
          <Button asChild>
            <Link href="/patients/new">
              <UserPlus className="mr-2 h-4 w-4" />
              New Patient
            </Link>
          </Button>
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
                  placeholder="Search patients by name or family..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    setCurrentPage(1) // Reset to first page on new search
                  }}
                />
              </div>
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
                  {paginatedPatients.length > 0 ? (
                    paginatedPatients.map((patient) => (
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

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">Rows per page</p>
                <Select
                  value={`${itemsPerPage}`}
                  onValueChange={(value) => {
                    setItemsPerPage(Number(value))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="h-8 w-[70px]">
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent side="top">
                    {[5, 10, 25, 50].map((pageSize) => (
                      <SelectItem key={pageSize} value={`${pageSize}`}>
                        {pageSize}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages || totalPages === 0}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}