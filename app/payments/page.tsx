"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, CreditCard, DollarSign, Search, Users } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"

// Mock payment data
const paymentData = {
  today: [
    {
      id: 1,
      patient: { id: 1, name: "John Smith" },
      type: "Consultation",
      amount: 75,
      status: "Paid",
      date: "2024-04-30",
    },
    {
      id: 2,
      patient: { id: 2, name: "Sarah Johnson" },
      type: "Medicine",
      amount: 45,
      status: "Paid",
      date: "2024-04-30",
    },
    {
      id: 3,
      patient: { id: 3, name: "Michael Brown" },
      type: "Consultation",
      amount: 120,
      status: "Partial",
      date: "2024-04-30",
    },
    {
      id: 4,
      patient: { id: 4, name: "Emily Davis" },
      type: "Medicine",
      amount: 30,
      status: "Unpaid",
      date: "2024-04-30",
    },
  ],
  pending: [
    {
      id: 5,
      patient: { id: 5, name: "David Wilson" },
      type: "Consultation",
      amount: 95,
      status: "Partial",
      date: "2024-04-29",
    },
    {
      id: 6,
      patient: { id: 6, name: "Jennifer Taylor" },
      type: "Consultation",
      amount: 60,
      status: "Unpaid",
      date: "2024-04-28",
    },
    {
      id: 7,
      patient: { id: 3, name: "Michael Brown" },
      type: "Medicine",
      amount: 50,
      status: "Unpaid",
      date: "2024-04-27",
    },
  ],
  familyDues: [
    { id: 1, name: "Smith Family", members: 4, monthlyDue: 200, status: "Paid", lastPayment: "2024-04-15" },
    { id: 2, name: "Brown Family", members: 3, monthlyDue: 150, status: "Partial", lastPayment: "2024-04-10" },
    { id: 3, name: "Wilson Family", members: 5, monthlyDue: 250, status: "Unpaid", lastPayment: "2024-03-20" },
    { id: 4, name: "Thomas Family", members: 2, monthlyDue: 100, status: "Paid", lastPayment: "2024-04-05" },
  ],
}

export default function PaymentsPage() {
  const [activeTab, setActiveTab] = useState("today")
  const [searchQuery, setSearchQuery] = useState("")

  const getStatusBadge = (status) => {
    switch (status) {
      case "Paid":
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>
      case "Partial":
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
      case "Unpaid":
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>
      default:
        return null
    }
  }

  const filteredPayments = {
    today: searchQuery
      ? paymentData.today.filter((payment) => payment.patient.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : paymentData.today,
    pending: searchQuery
      ? paymentData.pending.filter((payment) => payment.patient.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : paymentData.pending,
    familyDues: searchQuery
      ? paymentData.familyDues.filter((family) => family.name.toLowerCase().includes(searchQuery.toLowerCase()))
      : paymentData.familyDues,
  }

  const totalToday = paymentData.today.reduce((sum, payment) => {
    if (payment.status === "Paid") {
      return sum + payment.amount
    } else if (payment.status === "Partial") {
      return sum + payment.amount / 2 // Assuming partial is half paid for simplicity
    }
    return sum
  }, 0)

  const totalPending = [...paymentData.today, ...paymentData.pending].reduce((sum, payment) => {
    if (payment.status === "Unpaid") {
      return sum + payment.amount
    } else if (payment.status === "Partial") {
      return sum + payment.amount / 2 // Assuming partial is half pending
    }
    return sum
  }, 0)

  const totalFamilyDues = paymentData.familyDues.reduce((sum, family) => {
    if (family.status === "Unpaid") {
      return sum + family.monthlyDue
    } else if (family.status === "Partial") {
      return sum + family.monthlyDue / 2
    }
    return sum
  }, 0)

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalToday.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{paymentData.today.length} transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalPending.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{paymentData.pending.length} pending transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Family Dues</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalFamilyDues.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">{paymentData.familyDues.length} family groups</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <Tabs defaultValue="today" onValueChange={setActiveTab}>
            <CardHeader>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <CardTitle>Payment Records</CardTitle>
                <TabsList>
                  <TabsTrigger value="today">Today's Payments</TabsTrigger>
                  <TabsTrigger value="pending">Pending Payments</TabsTrigger>
                  <TabsTrigger value="family">Family Dues</TabsTrigger>
                </TabsList>
              </div>
              <CardDescription>
                {activeTab === "today"
                  ? "Payments received today"
                  : activeTab === "pending"
                    ? "Pending and partial payments"
                    : "Monthly dues for family groups"}
              </CardDescription>
              <div className="relative mt-2">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={`Search ${activeTab === "family" ? "families" : "patients"}...`}
                  className="pl-8 w-full md:w-80"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <TabsContent value="today">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.today.length > 0 ? (
                        filteredPayments.today.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              <Link href={`/patients/${payment.patient.id}`} className="hover:underline">
                                {payment.patient.name}
                              </Link>
                            </TableCell>
                            <TableCell>{payment.type}</TableCell>
                            <TableCell>${payment.amount.toFixed(2)}</TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell>{payment.status !== "Paid" && <Button size="sm">Mark as Paid</Button>}</TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                            No payments found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="pending">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Patient</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.pending.length > 0 ? (
                        filteredPayments.pending.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              <Link href={`/patients/${payment.patient.id}`} className="hover:underline">
                                {payment.patient.name}
                              </Link>
                            </TableCell>
                            <TableCell>{payment.type}</TableCell>
                            <TableCell>${payment.amount.toFixed(2)}</TableCell>
                            <TableCell>{new Date(payment.date).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(payment.status)}</TableCell>
                            <TableCell>
                              <Button size="sm">Collect Payment</Button>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            No pending payments found.
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
                        <TableHead>Family Group</TableHead>
                        <TableHead>Members</TableHead>
                        <TableHead>Monthly Due</TableHead>
                        <TableHead>Last Payment</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments.familyDues.length > 0 ? (
                        filteredPayments.familyDues.map((family) => (
                          <TableRow key={family.id}>
                            <TableCell className="font-medium">{family.name}</TableCell>
                            <TableCell>{family.members}</TableCell>
                            <TableCell>${family.monthlyDue.toFixed(2)}</TableCell>
                            <TableCell>{new Date(family.lastPayment).toLocaleDateString()}</TableCell>
                            <TableCell>{getStatusBadge(family.status)}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="outline" asChild>
                                  <Link href={`/payments/family/${family.id}`}>
                                    <Calendar className="mr-1 h-3 w-3" />
                                    History
                                  </Link>
                                </Button>
                                {family.status !== "Paid" && <Button size="sm">Collect</Button>}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                            No family groups found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </RouteGuard>
  )
}
