"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Users, Search, Plus, Download } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RouteGuard } from "@/components/route-guard"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Mock data
const mockPatients = [
  { id: 1, name: "John Smith", phone: "555-1234", balance: 200, lastPayment: "2023-04-15", totalPaid: 500 },
  { id: 2, name: "Sarah Johnson", phone: "555-5678", balance: 150, lastPayment: "2023-04-10", totalPaid: 350 },
  { id: 3, name: "Michael Brown", phone: "555-9012", balance: 0, lastPayment: "2023-04-05", totalPaid: 200 }
]

const mockFamilies = [
  { id: 1, name: "Smith Family", phone: "555-1234", balance: 350, lastPayment: "2023-04-12", totalPaid: 700 },
  { id: 2, name: "Johnson Family", phone: "555-5678", balance: 0, lastPayment: "2023-04-08", totalPaid: 450 }
]

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function LedgerPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("individual")
  const [rowsPerPage, setRowsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)
  const debouncedSearchQuery = useDebounce(searchQuery, 500)

  // Calculate stats
  const stats = useMemo(() => {
    const totalPatients = mockPatients.length
    const totalFamilies = mockFamilies.length
    const totalPendingBalance = [...mockPatients, ...mockFamilies].reduce((sum, item) => sum + item.balance, 0)
    const totalPaymentReceived = [...mockPatients, ...mockFamilies].reduce((sum, item) => sum + item.totalPaid, 0)

    return {
      totalPatients,
      totalFamilies,
      totalPendingBalance,
      totalPaymentReceived
    }
  }, [])

  const filteredPatients = useMemo(() => {
    return mockPatients.filter(patient => 
      patient.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      patient.phone.includes(debouncedSearchQuery))
  }, [debouncedSearchQuery])
  
  const filteredFamilies = useMemo(() => {
    return mockFamilies.filter(family => 
      family.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
      family.phone.includes(debouncedSearchQuery))
  }, [debouncedSearchQuery])

  // Pagination
  const paginatedPatients = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredPatients.slice(start, start + rowsPerPage)
  }, [filteredPatients, currentPage, rowsPerPage])

  const paginatedFamilies = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage
    return filteredFamilies.slice(start, start + rowsPerPage)
  }, [filteredFamilies, currentPage, rowsPerPage])

  const totalPages = useMemo(() => {
    const totalItems = activeTab === "individual" ? filteredPatients.length : filteredFamilies.length
    return Math.ceil(totalItems / rowsPerPage)
  }, [activeTab, filteredPatients, filteredFamilies, rowsPerPage])

  const resetFilters = () => {
    setSearchQuery("")
    setCurrentPage(1)
  }

  return (
    <RouteGuard allowedRoles={["doctor"]}>
      <div className="space-y-4 p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-3xl font-bold">Patient Ledgers</CardTitle>
              <CardDescription>View and manage patient payment records</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              {/* <Link href="/payments/new">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Payment
                </Button>
              </Link> */}
            </div>
          </CardHeader>
          <CardContent>
            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Patients
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalPatients}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Families
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalFamilies}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Pending Balance
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalPendingBalance.toFixed(2)}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Received
                  </CardTitle>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    className="h-4 w-4 text-muted-foreground"
                  >
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">₹{stats.totalPaymentReceived.toFixed(2)}</div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
              <Input
                type="text"
                placeholder={`Search ${activeTab === "individual" ? "patients" : "families"}...`}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full sm:w-64"
              />

              <div className="flex items-center gap-2">
                {searchQuery && (
                  <Button variant="ghost" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                )}
              </div>
            </div>

            <Tabs defaultValue="individual" onValueChange={(value) => {
              setActiveTab(value)
              setCurrentPage(1)
            }}>
              <TabsList className="mb-4">
                <TabsTrigger value="individual">
                  <FileText className="mr-2 h-4 w-4" />
                  Individual Ledgers
                </TabsTrigger>
                <TabsTrigger value="family">
                  <Users className="mr-2 h-4 w-4" />
                  Family Ledgers
                </TabsTrigger>
              </TabsList>

              <TabsContent value="individual">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Last Payment</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Total Paid</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPatients.length > 0 ? (
                        paginatedPatients.map((patient) => (
                          <TableRow key={patient.id}>
                            <TableCell className="font-medium">{patient.name}</TableCell>
                            <TableCell>{patient.phone}</TableCell>
                            <TableCell>{patient.lastPayment}</TableCell>
                            <TableCell className={patient.balance > 0 ? "text-red-500" : "text-green-500"}>
                              ₹{patient.balance.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-green-500">
                              ₹{patient.totalPaid.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" asChild>
                                <Link href={`/payments/ledger/${patient.id}`}>
                                  View Ledger
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            No patients found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="family">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Family</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Last Payment</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Total Paid</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedFamilies.length > 0 ? (
                        paginatedFamilies.map((family) => (
                          <TableRow key={family.id}>
                            <TableCell className="font-medium">{family.name}</TableCell>
                            <TableCell>{family.phone}</TableCell>
                            <TableCell>{family.lastPayment}</TableCell>
                            <TableCell className={family.balance > 0 ? "text-red-500" : "text-green-500"}>
                              ₹{family.balance.toFixed(2)}
                            </TableCell>
                            <TableCell className="text-green-500">
                              ₹{family.totalPaid.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              <Button size="sm" asChild>
                                <Link href={`/payments/family-ledger/${family.id}`}>
                                  View Ledger
                                </Link>
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center h-24">
                            No families found
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </Tabs>

            {/* Pagination */}
            <div className="flex flex-wrap justify-between items-center gap-4 mt-4 w-full px-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * rowsPerPage + 1}–
                {Math.min(currentPage * rowsPerPage, activeTab === "individual" ? filteredPatients.length : filteredFamilies.length)} of{" "}
                {activeTab === "individual" ? filteredPatients.length : filteredFamilies.length}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Rows per page:
                </span>
                <Select
                  value={String(rowsPerPage)}
                  onValueChange={(val) => {
                    setRowsPerPage(Number(val))
                    setCurrentPage(1)
                  }}
                >
                  <SelectTrigger className="w-20 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map((count) => (
                      <SelectItem key={count} value={String(count)}>
                        {count}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>

                <Select
                  value={String(currentPage)}
                  onValueChange={(val) => setCurrentPage(Number(val))}
                >
                  <SelectTrigger className="w-20 h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: totalPages }, (_, i) => (
                      <SelectItem key={i} value={String(i + 1)}>
                        {i + 1}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <span className="text-sm text-muted-foreground">
                  of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}