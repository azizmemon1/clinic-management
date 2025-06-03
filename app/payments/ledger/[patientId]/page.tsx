"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DollarSign, FileText, ArrowLeft, Search, Download, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { RouteGuard } from "@/components/route-guard"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import * as XLSX from "xlsx"

// Mock patient data
const mockPatient = {
  id: "123",
  name: "John Smith",
  phone: "555-1234",
  email: "john.smith@example.com"
}

// Mock data
const mockCases = [
  { id: 101, date: "2023-04-10", reason: "Consultation", amount: 500, paid: 500, status: "Paid" },
  { id: 102, date: "2023-04-12", reason: "Lab Test", amount: 300, paid: 300, status: "Paid" },
  { id: 103, date: "2023-04-15", reason: "Medicine", amount: 400, paid: 200, status: "Partial" },
  { id: 104, date: "2023-04-18", reason: "Follow Up", amount: 200, paid: 0, status: "Unpaid" }
]

const mockPayments = [
  { id: 1, date: "2023-04-10", amount: 500, type: "Cash", caseId: 101 },
  { id: 2, date: "2023-04-12", amount: 300, type: "Card", caseId: 102 },
  { id: 3, date: "2023-04-16", amount: 200, type: "Cash", caseId: 103 }
]

const mockLedgerEntries = [
  { id: 1, date: "2023-04-10", description: "Consultation", caseId: 101, debit: 500, credit: 500, balance: 0 },
  { id: 2, date: "2023-04-12", description: "Lab Test", caseId: 102, debit: 300, credit: 300, balance: 0 },
  { id: 3, date: "2023-04-15", description: "Medicine", caseId: 103, debit: 400, credit: 200, balance: 200 },
  { id: 4, date: "2023-04-16", description: "Payment Received", caseId: null, debit: 0, credit: 200, balance: 0 }
]

export default function PatientLedgerPage() {
  const params = useParams()
  const router = useRouter()
  const patientId = params.patientId as string
  
  // State for Cases tab
  const [casesSearch, setCasesSearch] = useState("")
  const [casesStatusFilter, setCasesStatusFilter] = useState("All")
  const [casesPage, setCasesPage] = useState(1)
  const casesPerPage = 5
  
  // State for Payments tab
  const [paymentsSearch, setPaymentsSearch] = useState("")
  const [paymentsPage, setPaymentsPage] = useState(1)
  const paymentsPerPage = 5
  
  // State for Ledger tab
  const [ledgerSearch, setLedgerSearch] = useState("")
  const [ledgerPage, setLedgerPage] = useState(1)
  const ledgerPerPage = 5

  // Filter cases
  const filteredCases = mockCases.filter(caseItem => {
    const matchesSearch = 
      caseItem.reason.toLowerCase().includes(casesSearch.toLowerCase()) ||
      caseItem.date.includes(casesSearch) ||
      caseItem.amount.toString().includes(casesSearch)
    const matchesStatus = casesStatusFilter === "All" || caseItem.status === casesStatusFilter
    return matchesSearch && matchesStatus
  })

  // Filter payments
  const filteredPayments = mockPayments.filter(payment => 
    payment.date.includes(paymentsSearch) ||
    payment.amount.toString().includes(paymentsSearch))

  // Filter ledger entries
  const filteredLedger = mockLedgerEntries.filter(entry => 
    entry.description.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
    entry.date.includes(ledgerSearch))

  // Pagination calculations
  const casesTotalPages = Math.ceil(filteredCases.length / casesPerPage)
  const paginatedCases = filteredCases.slice(
    (casesPage - 1) * casesPerPage,
    casesPage * casesPerPage
  )

  const paymentsTotalPages = Math.ceil(filteredPayments.length / paymentsPerPage)
  const paginatedPayments = filteredPayments.slice(
    (paymentsPage - 1) * paymentsPerPage,
    paymentsPage * paymentsPerPage
  )

  const ledgerTotalPages = Math.ceil(filteredLedger.length / ledgerPerPage)
  const paginatedLedger = filteredLedger.slice(
    (ledgerPage - 1) * ledgerPerPage,
    ledgerPage * ledgerPerPage
  )

  // Calculate running balance for each page
  const calculatePageBalance = (items: typeof paginatedLedger, previousBalance: number) => {
    return items.reduce((balance, item) => {
      return balance + (item.debit - item.credit)
    }, previousBalance)
  }

  // Download ledger as Excel
  const downloadLedger = () => {
    const worksheet = XLSX.utils.json_to_sheet(filteredLedger)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger")
    XLSX.writeFile(workbook, `${mockPatient.name}-ledger.xlsx`)
  }

  return (
    <RouteGuard allowedRoles={["doctor"]}>
      <div className="space-y-4 p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => router.back()}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <CardTitle className="text-2xl font-bold">{mockPatient.name}'s Ledger</CardTitle>
                <CardDescription className="flex gap-2">
                  <span>Patient ID: {patientId}</span>
                  <span>•</span>
                  <span>{mockPatient.phone}</span>
                  <span>•</span>
                  <span>{mockPatient.email}</span>
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={downloadLedger}>
                <Download className="mr-2 h-4 w-4" />
                Export Ledger
              </Button>
              <Link href={`/payments/new?patientId=${patientId}`}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Payment
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="cases">
              <div className="flex justify-end mb-4">
                <TabsList>
                  <TabsTrigger value="cases">
                    <FileText className="mr-2 h-4 w-4" />
                    Cases
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    <DollarSign className="mr-2 h-4 w-4" />
                    Payments
                  </TabsTrigger>
                  <TabsTrigger value="ledger">
                    <FileText className="mr-2 h-4 w-4" />
                    Ledger
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Cases Tab */}
              <TabsContent value="cases" className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search cases..."
                      className="pl-8"
                      value={casesSearch}
                      onChange={(e) => {
                        setCasesSearch(e.target.value)
                        setCasesPage(1)
                      }}
                    />
                  </div>
                  <Select 
                    value={casesStatusFilter} 
                    onValueChange={(value) => {
                      setCasesStatusFilter(value)
                      setCasesPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedCases.map((caseItem) => (
                        <TableRow key={caseItem.id}>
                          <TableCell>{caseItem.date}</TableCell>
                          <TableCell>{caseItem.reason}</TableCell>
                          <TableCell>${caseItem.amount.toFixed(2)}</TableCell>
                          <TableCell>${caseItem.paid.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge variant={
                              caseItem.status === "Paid" ? "default" :
                              caseItem.status === "Partial" ? "secondary" : "destructive"
                            }>
                              {caseItem.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/cases/${caseItem.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination - matching cases page style */}
                <div className="flex flex-wrap justify-between items-center gap-4 mt-4 w-full px-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(casesPage - 1) * casesPerPage + 1}–
                    {Math.min(casesPage * casesPerPage, filteredCases.length)} of {filteredCases.length}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Rows per page:
                    </span>
                    <Select
                      value={String(casesPerPage)}
                      onValueChange={(val) => {
                        // setRowsPerPage(Number(val))
                        setCasesPage(1)
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
                      onClick={() => setCasesPage((prev) => Math.max(prev - 1, 1))}
                      disabled={casesPage === 1}
                    >
                      Previous
                    </Button>

                    <Select
                      value={String(casesPage)}
                      onValueChange={(val) => setCasesPage(Number(val))}
                    >
                      <SelectTrigger className="w-20 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: casesTotalPages }, (_, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-sm text-muted-foreground">
                      of {casesTotalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCasesPage((prev) => Math.min(prev + 1, casesTotalPages))
                      }
                      disabled={casesPage === casesTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Payments Tab */}
              <TabsContent value="payments" className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search payments..."
                      className="pl-8"
                      value={paymentsSearch}
                      onChange={(e) => {
                        setPaymentsSearch(e.target.value)
                        setPaymentsPage(1)
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Case</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>{payment.type}</TableCell>
                          <TableCell>
                            {payment.caseId ? (
                              <Link href={`/cases/${payment.caseId}`} className="text-primary hover:underline">
                                Case #{payment.caseId}
                              </Link>
                            ) : "N/A"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap justify-between items-center gap-4 mt-4 w-full px-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(paymentsPage - 1) * paymentsPerPage + 1}–
                    {Math.min(paymentsPage * paymentsPerPage, filteredPayments.length)} of {filteredPayments.length}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Rows per page:
                    </span>
                    <Select
                      value={String(paymentsPerPage)}
                      onValueChange={(val) => {
                        // setRowsPerPage(Number(val))
                        setPaymentsPage(1)
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
                      onClick={() => setPaymentsPage((prev) => Math.max(prev - 1, 1))}
                      disabled={paymentsPage === 1}
                    >
                      Previous
                    </Button>

                    <Select
                      value={String(paymentsPage)}
                      onValueChange={(val) => setPaymentsPage(Number(val))}
                    >
                      <SelectTrigger className="w-20 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: paymentsTotalPages }, (_, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-sm text-muted-foreground">
                      of {paymentsTotalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPaymentsPage((prev) => Math.min(prev + 1, paymentsTotalPages))
                      }
                      disabled={paymentsPage === paymentsTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Ledger Tab */}
              <TabsContent value="ledger" className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search ledger entries..."
                      className="pl-8"
                      value={ledgerSearch}
                      onChange={(e) => {
                        setLedgerSearch(e.target.value)
                        setLedgerPage(1)
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Case</TableHead>
                        <TableHead>Debit</TableHead>
                        <TableHead>Credit</TableHead>
                        <TableHead>Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedLedger.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>{entry.date}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell>
                            {entry.caseId ? (
                              <Link href={`/cases/${entry.caseId}`} className="text-primary hover:underline">
                                #{entry.caseId}
                              </Link>
                            ) : "N/A"}
                          </TableCell>
                          <TableCell className={entry.debit > 0 ? "text-red-500" : ""}>
                            {entry.debit > 0 ? `$${entry.debit.toFixed(2)}` : "-"}
                          </TableCell>
                          <TableCell className={entry.credit > 0 ? "text-green-500" : ""}>
                            {entry.credit > 0 ? `$${entry.credit.toFixed(2)}` : "-"}
                          </TableCell>
                          <TableCell className={entry.balance > 0 ? "text-red-500" : "text-green-500"}>
                            ${entry.balance.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                      {/* Page Balance Row */}
                      <TableRow className="bg-muted/50">
                        <TableCell colSpan={5} className="text-right font-medium">Page Balance:</TableCell>
                        <TableCell className="font-medium">
                          ${calculatePageBalance(paginatedLedger, 0).toFixed(2)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap justify-between items-center gap-4 mt-4 w-full px-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(ledgerPage - 1) * ledgerPerPage + 1}–
                    {Math.min(ledgerPage * ledgerPerPage, filteredLedger.length)} of {filteredLedger.length}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Rows per page:
                    </span>
                    <Select
                      value={String(ledgerPerPage)}
                      onValueChange={(val) => {
                        // setRowsPerPage(Number(val))
                        setLedgerPage(1)
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
                      onClick={() => setLedgerPage((prev) => Math.max(prev - 1, 1))}
                      disabled={ledgerPage === 1}
                    >
                      Previous
                    </Button>

                    <Select
                      value={String(ledgerPage)}
                      onValueChange={(val) => setLedgerPage(Number(val))}
                    >
                      <SelectTrigger className="w-20 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: ledgerTotalPages }, (_, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-sm text-muted-foreground">
                      of {ledgerTotalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setLedgerPage((prev) => Math.min(prev + 1, ledgerTotalPages))
                      }
                      disabled={ledgerPage === ledgerTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  )
}