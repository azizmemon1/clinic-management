"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CreditCard, DollarSign, Search, Users, FileText } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { RouteGuard } from "@/components/route-guard"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format, startOfDay, endOfDay, isSameDay, isWithinInterval, isAfter, isBefore } from "date-fns"
import { DateRange } from "react-day-picker"

// Enhanced mock data
const mockTodayCases = [
  {
    id: 101,
    patientId: 1,
    patientName: "John Smith",
    date: "2023-04-15",
    reason: "Fever and cough",
    amount: 500,
    amountReceived: 0,
    paymentStatus: "Unpaid",
    isEmergency: false
  },
  {
    id: 102,
    patientId: 2,
    patientName: "Sarah Johnson",
    date: "2023-04-15",
    reason: "Dental checkup",
    amount: 300,
    amountReceived: 150,
    paymentStatus: "Partial",
    isEmergency: false
  },
  {
    id: 103,
    patientId: 3,
    patientName: "Michael Brown",
    date: "2023-04-15",
    reason: "Chest pain",
    amount: 700,
    amountReceived: 700,
    paymentStatus: "Paid",
    isEmergency: true
  }
]

const mockPendingPayments = [
  {
    id: 104,
    patientId: 4,
    patientName: "Emily Davis",
    date: "2023-04-14",
    reason: "Stomach ache",
    amount: 400,
    amountReceived: 0,
    paymentStatus: "Unpaid",
    isEmergency: false
  },
  {
    id: 105,
    patientId: 1,
    patientName: "John Smith",
    date: "2023-04-13",
    reason: "Follow up",
    amount: 200,
    amountReceived: 100,
    paymentStatus: "Partial",
    isEmergency: false
  },
  {
    id: 106,
    patientId: 5,
    patientName: "Robert Wilson",
    date: "2023-04-12",
    reason: "Annual checkup",
    amount: 350,
    amountReceived: 0,
    paymentStatus: "Unpaid",
    isEmergency: false
  },
  {
    id: 107,
    patientId: 6,
    patientName: "Lisa Taylor",
    date: "2023-04-11",
    reason: "Vaccination",
    amount: 150,
    amountReceived: 150,
    paymentStatus: "Paid",
    isEmergency: false
  },
  {
    id: 108,
    patientId: 7,
    patientName: "David Clark",
    date: "2023-04-10",
    reason: "Physical therapy",
    amount: 600,
    amountReceived: 300,
    paymentStatus: "Partial",
    isEmergency: false
  }
]

const mockFamilyDues = [
  {
    id: 1,
    familyName: "Smith Family",
    members: 4,
    totalDue: 1200,
    paidAmount: 600,
    balance: 600,
    lastPayment: "2023-04-10"
  },
  {
    id: 2,
    familyName: "Johnson Family",
    members: 2,
    totalDue: 800,
    paidAmount: 800,
    balance: 0,
    lastPayment: "2023-04-12"
  },
  {
    id: 3,
    familyName: "Brown Family",
    members: 3,
    totalDue: 900,
    paidAmount: 450,
    balance: 450,
    lastPayment: "2023-04-08"
  },
  {
    id: 4,
    familyName: "Wilson Family",
    members: 2,
    totalDue: 500,
    paidAmount: 500,
    balance: 0,
    lastPayment: "2023-04-05"
  }
]

const mockIndividualLedgers = [
  {
    id: 1,
    patientId: 1,
    patientName: "John Smith",
    entries: [
      { date: "2023-04-10", description: "Consultation", debit: 500, credit: 500, balance: 0 },
      { date: "2023-04-12", description: "Lab Test", debit: 300, credit: 300, balance: 0 },
      { date: "2023-04-15", description: "Medicine", debit: 400, credit: 0, balance: 400 }
    ],
    currentBalance: 400
  }
]

const mockFamilyLedgers = [
  {
    id: 1,
    familyId: 1,
    familyName: "Smith Family",
    entries: [
      { date: "2023-04-10", description: "John Smith - Consultation", debit: 500, credit: 500, balance: 0 },
      { date: "2023-04-12", description: "Mary Smith - Lab Test", debit: 300, credit: 150, balance: 150 },
      { date: "2023-04-15", description: "James Smith - Medicine", debit: 400, credit: 0, balance: 550 }
    ],
    currentBalance: 550
  }
]

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("today")
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [familyStatusFilter, setFamilyStatusFilter] = useState("All")
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  
  // Pagination states
  const [todayPage, setTodayPage] = useState(1)
  const [pendingPage, setPendingPage] = useState(1)
  const [familyPage, setFamilyPage] = useState(1)
  const [rowsPerPage, setRowsPerPage] = useState(5)

  const filteredTodayCases = mockTodayCases.filter(caseItem => {
    const matchesSearch = caseItem.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         caseItem.reason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || caseItem.paymentStatus === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredPendingPayments = mockPendingPayments.filter(payment => {
    const matchesSearch = payment.patientName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         payment.reason.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === "All" || payment.paymentStatus === statusFilter
    
    const paymentDate = new Date(payment.date)
    const from = dateRange?.from ? startOfDay(dateRange.from) : undefined
    const to = dateRange?.to ? endOfDay(dateRange.to) : undefined
    
    let matchesDate = true
    if (from && to && isSameDay(from, to)) {
      matchesDate = isSameDay(paymentDate, from)
    } else if (from && to) {
      matchesDate = isWithinInterval(paymentDate, { start: from, end: to })
    } else if (from) {
      matchesDate = isAfter(paymentDate, from) || isSameDay(paymentDate, from)
    } else if (to) {
      matchesDate = isBefore(paymentDate, to) || isSameDay(paymentDate, to)
    }

    return matchesSearch && matchesStatus && matchesDate
  })

  const filteredFamilyDues = mockFamilyDues.filter(family => {
    const matchesSearch = family.familyName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = familyStatusFilter === "All" || 
                         (familyStatusFilter === "Paid" && family.balance === 0) ||
                         (familyStatusFilter === "Unpaid" && family.balance > 0)
    return matchesSearch && matchesStatus
  })

  // Pagination calculations
  const todayTotalPages = Math.ceil(filteredTodayCases.length / rowsPerPage)
  const paginatedTodayCases = filteredTodayCases.slice(
    (todayPage - 1) * rowsPerPage,
    todayPage * rowsPerPage
  )

  const pendingTotalPages = Math.ceil(filteredPendingPayments.length / rowsPerPage)
  const paginatedPendingPayments = filteredPendingPayments.slice(
    (pendingPage - 1) * rowsPerPage,
    pendingPage * rowsPerPage
  )

  const familyTotalPages = Math.ceil(filteredFamilyDues.length / rowsPerPage)
  const paginatedFamilyDues = filteredFamilyDues.slice(
    (familyPage - 1) * rowsPerPage,
    familyPage * rowsPerPage
  )

  const resetDateFilter = () => {
    setDateRange(undefined)
  }

  return (
    <RouteGuard allowedRoles={["doctor"]}>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Payment Management</h1>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Today:</span>
            <span className="font-medium">{new Date().toLocaleDateString()}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Cases</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockTodayCases.length}</div>
              <p className="text-xs text-muted-foreground">
                {mockTodayCases.filter(c => c.paymentStatus === "Paid").length} paid
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockPendingPayments.reduce((sum, payment) => sum + (payment.amount - payment.amountReceived), 0)}
              </div>
              <p className="text-xs text-muted-foreground">{mockPendingPayments.length} cases</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Family Dues</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockFamilyDues.reduce((sum, family) => sum + family.balance, 0)}
              </div>
              <p className="text-xs text-muted-foreground">{mockFamilyDues.length} families</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${mockTodayCases.reduce((sum, c) => sum + c.amountReceived, 0) +
                  mockPendingPayments.reduce((sum, p) => sum + p.amountReceived, 0) +
                  mockFamilyDues.reduce((sum, f) => sum + f.paidAmount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">Today's collection</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Ledger Access</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mockIndividualLedgers.length + mockFamilyLedgers.length}
              </div>
              <p className="text-xs text-muted-foreground">
                {mockIndividualLedgers.length} individual, {mockFamilyLedgers.length} family
              </p>
              <Button variant="link" className="p-0 h-auto" asChild>
                <Link href="/payments/ledger">View All Ledgers</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <Tabs defaultValue="today" onValueChange={setActiveTab}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Payment Records</CardTitle>
                <TabsList>
                  <TabsTrigger value="today">Today's Cases</TabsTrigger>
                  <TabsTrigger value="pending">Pending Payments</TabsTrigger>
                  <TabsTrigger value="family">Family Dues</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                {activeTab === "today"
                  ? "Cases created today"
                  : activeTab === "pending"
                    ? "Pending and partial payments"
                    : "Family monthly dues"}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${activeTab === "family" ? "families" : "patients"}...`}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      // Reset to first page when searching
                      if (activeTab === "today") setTodayPage(1)
                      if (activeTab === "pending") setPendingPage(1)
                      if (activeTab === "family") setFamilyPage(1)
                    }}
                  />
                </div>
                {activeTab === "pending" && (
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="whitespace-nowrap">
                        {dateRange?.from && dateRange?.to
                          ? `${format(dateRange.from, "MMM d")} - ${format(
                              dateRange.to,
                              "MMM d"
                            )}`
                          : dateRange?.from
                            ? format(dateRange.from, "MMM d")
                            : "Select Date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="range"
                        selected={dateRange}
                        onSelect={setDateRange}
                        numberOfMonths={1}
                      />
                      <div className="flex items-center justify-end p-2 border-t">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={resetDateFilter}
                        >
                          Clear
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                )}
                {activeTab !== "family" && (
                  <Select 
                    value={statusFilter} 
                    onValueChange={(value) => {
                      setStatusFilter(value)
                      // Reset to first page when changing filter
                      if (activeTab === "today") setTodayPage(1)
                      if (activeTab === "pending") setPendingPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Partial">Partial</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
                {activeTab === "family" && (
                  <Select 
                    value={familyStatusFilter} 
                    onValueChange={(value) => {
                      setFamilyStatusFilter(value)
                      setFamilyPage(1)
                    }}
                  >
                    <SelectTrigger className="w-[120px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="All">All Status</SelectItem>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Unpaid">Unpaid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="today" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedTodayCases.map((caseItem) => (
                        <TableRow key={caseItem.id}>
                          <TableCell className="font-medium">
                            <Link href={`/patients/${caseItem.patientId}`} className="hover:underline">
                              {caseItem.patientName}
                            </Link>
                          </TableCell>
                          <TableCell>{caseItem.date}</TableCell>
                          <TableCell>{caseItem.reason}</TableCell>
                          <TableCell>${caseItem.amount.toFixed(2)}</TableCell>
                          <TableCell>${caseItem.amountReceived.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                caseItem.paymentStatus === "Paid"
                                  ? "default"
                                  : caseItem.paymentStatus === "Partial"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {caseItem.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" asChild>
                              <Link href={`/cases/${caseItem.id}/edit?payment=true`}>
                                Collect Payment
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                <div className="flex flex-wrap justify-between items-center gap-4 mt-4 w-full px-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(todayPage - 1) * rowsPerPage + 1}–
                    {Math.min(todayPage * rowsPerPage, filteredTodayCases.length)} of {filteredTodayCases.length}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Rows per page:
                    </span>
                    <Select
                      value={String(rowsPerPage)}
                      onValueChange={(val) => {
                        setRowsPerPage(Number(val))
                        setTodayPage(1)
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
                      onClick={() => setTodayPage((prev) => Math.max(prev - 1, 1))}
                      disabled={todayPage === 1}
                    >
                      Previous
                    </Button>

                    <Select
                      value={String(todayPage)}
                      onValueChange={(val) => setTodayPage(Number(val))}
                    >
                      <SelectTrigger className="w-20 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: todayTotalPages }, (_, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-sm text-muted-foreground">
                      of {todayTotalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setTodayPage((prev) => Math.min(prev + 1, todayTotalPages))
                      }
                      disabled={todayPage === todayTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="pending" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Received</TableHead>
                        <TableHead>Due</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedPendingPayments.map((payment) => (
                        <TableRow key={payment.id}>
                          <TableCell className="font-medium">
                            <Link href={`/patients/${payment.patientId}`} className="hover:underline">
                              {payment.patientName}
                            </Link>
                          </TableCell>
                          <TableCell>{payment.date}</TableCell>
                          <TableCell>{payment.reason}</TableCell>
                          <TableCell>${payment.amount.toFixed(2)}</TableCell>
                          <TableCell>${payment.amountReceived.toFixed(2)}</TableCell>
                          <TableCell>${(payment.amount - payment.amountReceived).toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                payment.paymentStatus === "Paid"
                                  ? "default"
                                  : payment.paymentStatus === "Partial"
                                    ? "secondary"
                                    : "destructive"
                              }
                            >
                              {payment.paymentStatus}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" asChild>
                              <Link href={`/cases/${payment.id}/edit?payment=true`}>
                                Collect Payment
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                <div className="flex flex-wrap justify-between items-center gap-4 mt-4 w-full px-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(pendingPage - 1) * rowsPerPage + 1}–
                    {Math.min(pendingPage * rowsPerPage, filteredPendingPayments.length)} of {filteredPendingPayments.length}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Rows per page:
                    </span>
                    <Select
                      value={String(rowsPerPage)}
                      onValueChange={(val) => {
                        setRowsPerPage(Number(val))
                        setPendingPage(1)
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
                      onClick={() => setPendingPage((prev) => Math.max(prev - 1, 1))}
                      disabled={pendingPage === 1}
                    >
                      Previous
                    </Button>

                    <Select
                      value={String(pendingPage)}
                      onValueChange={(val) => setPendingPage(Number(val))}
                    >
                      <SelectTrigger className="w-20 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: pendingTotalPages }, (_, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-sm text-muted-foreground">
                      of {pendingTotalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPendingPage((prev) => Math.min(prev + 1, pendingTotalPages))
                      }
                      disabled={pendingPage === pendingTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="family" className="space-y-4">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Family</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Total Due</TableHead>
                        <TableHead>Paid</TableHead>
                        <TableHead>Balance</TableHead>
                        <TableHead>Last Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {paginatedFamilyDues.map((family) => (
                        <TableRow key={family.id}>
                          <TableCell className="font-medium">{family.familyName}</TableCell>
                          <TableCell>{family.members}</TableCell>
                          <TableCell>${family.totalDue.toFixed(2)}</TableCell>
                          <TableCell>${family.paidAmount.toFixed(2)}</TableCell>
                          <TableCell className={family.balance > 0 ? "text-red-500" : "text-green-500"}>
                            ${family.balance.toFixed(2)}
                          </TableCell>
                          <TableCell>{family.lastPayment}</TableCell>
                          <TableCell>
                            <Badge variant={family.balance === 0 ? "default" : "destructive"}>
                              {family.balance === 0 ? "Paid" : "Unpaid"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button size="sm" asChild>
                              <Link href={`/payments/new?familyId=${family.id}`}>
                                Collect Payment
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {/* Pagination */}
                <div className="flex flex-wrap justify-between items-center gap-4 mt-4 w-full px-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(familyPage - 1) * rowsPerPage + 1}–
                    {Math.min(familyPage * rowsPerPage, filteredFamilyDues.length)} of {filteredFamilyDues.length}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Rows per page:
                    </span>
                    <Select
                      value={String(rowsPerPage)}
                      onValueChange={(val) => {
                        setRowsPerPage(Number(val))
                        setFamilyPage(1)
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
                      onClick={() => setFamilyPage((prev) => Math.max(prev - 1, 1))}
                      disabled={familyPage === 1}
                    >
                      Previous
                    </Button>

                    <Select
                      value={String(familyPage)}
                      onValueChange={(val) => setFamilyPage(Number(val))}
                    >
                      <SelectTrigger className="w-20 h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: familyTotalPages }, (_, i) => (
                          <SelectItem key={i} value={String(i + 1)}>
                            {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <span className="text-sm text-muted-foreground">
                      of {familyTotalPages}
                    </span>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setFamilyPage((prev) => Math.min(prev + 1, familyTotalPages))
                      }
                      disabled={familyPage === familyTotalPages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </RouteGuard>
  )
}