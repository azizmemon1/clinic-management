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
import { Calendar, CreditCard, DollarSign, Search, Users, FileText } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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
    return matchesSearch && matchesStatus
  })

  const filteredFamilyDues = mockFamilyDues.filter(family => {
    const matchesSearch = family.familyName.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = familyStatusFilter === "All" || 
                         (familyStatusFilter === "Paid" && family.balance === 0) ||
                         (familyStatusFilter === "Unpaid" && family.balance > 0)
    return matchesSearch && matchesStatus
  })

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
                  <TabsTrigger value="ledger">Ledger</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                {activeTab === "today"
                  ? "Cases created today"
                  : activeTab === "pending"
                    ? "Pending and partial payments"
                    : activeTab === "family"
                      ? "Family monthly dues"
                      : "Complete payment ledger"}
              </CardDescription>
              <div className="flex items-center gap-2 mt-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${activeTab === "family" ? "families" : "patients"}...`}
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                {activeTab !== "family" && activeTab !== "ledger" && (
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                  <Select value={familyStatusFilter} onValueChange={setFamilyStatusFilter}>
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
                      {filteredTodayCases.map((caseItem) => (
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
                      {filteredPendingPayments.map((payment) => (
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
                      {filteredFamilyDues.map((family) => (
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
              </TabsContent>

              <TabsContent value="ledger" className="space-y-4">
                <Tabs defaultValue="individual" className="mb-4">
                  <TabsList>
                    <TabsTrigger value="individual">Individual Ledger</TabsTrigger>
                    <TabsTrigger value="family">Family Ledger</TabsTrigger>
                  </TabsList>
                  <TabsContent value="individual">
                    <div className="rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Patient</TableHead>
                            <TableHead>Current Balance</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockIndividualLedgers.map((ledger) => (
                            <TableRow key={ledger.id}>
                              <TableCell className="font-medium">
                                <Link href={`/patients/${ledger.patientId}`} className="hover:underline">
                                  {ledger.patientName}
                                </Link>
                              </TableCell>
                              <TableCell className={ledger.currentBalance > 0 ? "text-red-500" : "text-green-500"}>
                                ${ledger.currentBalance.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/payments/ledger/${ledger.patientId}`}>
                                    <FileText className="mr-1 h-3 w-3" />
                                    View Ledger
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
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
                            <TableHead>Current Balance</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {mockFamilyLedgers.map((ledger) => (
                            <TableRow key={ledger.id}>
                              <TableCell className="font-medium">{ledger.familyName}</TableCell>
                              <TableCell className={ledger.currentBalance > 0 ? "text-red-500" : "text-green-500"}>
                                ${ledger.currentBalance.toFixed(2)}
                              </TableCell>
                              <TableCell>
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/payments/family-ledger/${ledger.familyId}`}>
                                    <FileText className="mr-1 h-3 w-3" />
                                    View Ledger
                                  </Link>
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </TabsContent>
                </Tabs>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </RouteGuard>
  )
}