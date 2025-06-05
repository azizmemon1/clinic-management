"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DollarSign, FileText, ArrowLeft, Search, Download, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { RouteGuard } from "@/components/route-guard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as XLSX from "xlsx";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, startOfDay, endOfDay, isSameDay, isWithinInterval, isAfter, isBefore } from "date-fns";
import { DateRange } from "react-day-picker";

// Mock patient data
const mockPatient = {
  id: "123",
  name: "John Smith",
  phone: "555-1234",
  email: "john.smith@example.com"
};

// Mock data
const mockCases = [
  { id: 101, date: "2023-04-10", reason: "Consultation", amount: 500, paid: 500, status: "Paid" },
  { id: 102, date: "2023-04-12", reason: "Lab Test", amount: 300, paid: 300, status: "Paid" },
  { id: 103, date: "2023-04-15", reason: "Medicine", amount: 400, paid: 200, status: "Partial" },
  { id: 104, date: "2023-04-18", reason: "Follow Up", amount: 200, paid: 0, status: "Unpaid" }
];

const mockPayments = [
  { id: 1, date: "2023-04-10", amount: 500, type: "Cash", caseId: 101 },
  { id: 2, date: "2023-04-12", amount: 300, type: "Card", caseId: 102 },
  { id: 3, date: "2023-04-16", amount: 200, type: "Cash", caseId: 103 }
];

const mockLedgerEntries = [
  { id: 1, date: "2023-04-10", description: "Consultation", caseId: 101, type: "debit", amount: 500, balance: 500 },
  { id: 2, date: "2023-04-10", description: "Payment Received", caseId: 101, type: "credit", amount: 500, balance: 0 },
  { id: 3, date: "2023-04-12", description: "Lab Test", caseId: 102, type: "debit", amount: 300, balance: 300 },
  { id: 4, date: "2023-04-12", description: "Payment Received", caseId: 102, type: "credit", amount: 300, balance: 0 },
  { id: 5, date: "2023-04-15", description: "Medicine", caseId: 103, type: "debit", amount: 400, balance: 400 },
  { id: 6, date: "2023-04-16", description: "Payment Received", caseId: 103, type: "credit", amount: 200, balance: 200 },
  { id: 7, date: "2023-04-18", description: "Follow Up", caseId: 104, type: "debit", amount: 200, balance: 400 }
];

export default function PatientLedgerPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = params.patientId as string;
  
  // State for Cases tab
  const [casesSearch, setCasesSearch] = useState("");
  const [casesStatusFilter, setCasesStatusFilter] = useState("All");
  const [casesPage, setCasesPage] = useState(1);
  const casesPerPage = 5;
  
  // State for Payments tab
  const [paymentsSearch, setPaymentsSearch] = useState("");
  const [paymentsPage, setPaymentsPage] = useState(1);
  const paymentsPerPage = 5;
  
  // State for Ledger tab
  const [ledgerSearch, setLedgerSearch] = useState("");
  const [ledgerPage, setLedgerPage] = useState(1);
  const ledgerPerPage = 5;
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  // Filter cases
  const filteredCases = mockCases.filter(caseItem => {
    const matchesSearch = 
      caseItem.reason.toLowerCase().includes(casesSearch.toLowerCase()) ||
      caseItem.date.includes(casesSearch) ||
      caseItem.amount.toString().includes(casesSearch);
    const matchesStatus = casesStatusFilter === "All" || caseItem.status === casesStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filter payments
  const filteredPayments = mockPayments.filter(payment => 
    payment.date.includes(paymentsSearch) ||
    payment.amount.toString().includes(paymentsSearch));

  // Filter ledger entries
  const filteredLedger = mockLedgerEntries.filter(entry => {
    const matchesSearch = 
      entry.description.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
      entry.date.includes(ledgerSearch);
    
    const entryDate = new Date(entry.date);
    const from = dateRange?.from ? startOfDay(dateRange.from) : undefined;
    const to = dateRange?.to ? endOfDay(dateRange.to) : undefined;
    
    let matchesDate = true;
    if (from && to && isSameDay(from, to)) {
      matchesDate = isSameDay(entryDate, from);
    } else if (from && to) {
      matchesDate = isWithinInterval(entryDate, { start: from, end: to });
    } else if (from) {
      matchesDate = isAfter(entryDate, from) || isSameDay(entryDate, from);
    } else if (to) {
      matchesDate = isBefore(entryDate, to) || isSameDay(entryDate, to);
    }

    return matchesSearch && matchesDate;
  });

  // Calculate running balance
  const ledgerWithBalance = filteredLedger.reduce((acc, entry, index) => {
    const previousBalance = index === 0 ? 0 : acc[index - 1].runningBalance;
    const runningBalance = entry.type === "debit" 
      ? previousBalance + entry.amount 
      : previousBalance - entry.amount;
    
    return [...acc, { ...entry, runningBalance }];
  }, [] as Array<typeof filteredLedger[0] & { runningBalance: number }>);

  // Pagination calculations
  const casesTotalPages = Math.ceil(filteredCases.length / casesPerPage);
  const paginatedCases = filteredCases.slice(
    (casesPage - 1) * casesPerPage,
    casesPage * casesPerPage
  );

  const paymentsTotalPages = Math.ceil(filteredPayments.length / paymentsPerPage);
  const paginatedPayments = filteredPayments.slice(
    (paymentsPage - 1) * paymentsPerPage,
    paymentsPage * paymentsPerPage
  );

  const ledgerTotalPages = Math.ceil(ledgerWithBalance.length / ledgerPerPage);
  const paginatedLedger = ledgerWithBalance.slice(
    (ledgerPage - 1) * ledgerPerPage,
    ledgerPage * ledgerPerPage
  );

  // Download ledger as Excel
  const downloadLedger = () => {
    const worksheet = XLSX.utils.json_to_sheet(ledgerWithBalance);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Ledger");
    XLSX.writeFile(workbook, `${mockPatient.name}-ledger.xlsx`);
  };

  const resetDateFilter = () => {
    setDateRange(undefined);
    setLedgerPage(1);
  };

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
            <Tabs defaultValue="ledger">
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
                        setCasesSearch(e.target.value);
                        setCasesPage(1);
                      }}
                    />
                  </div>
                  <Select 
                    value={casesStatusFilter} 
                    onValueChange={(value) => {
                      setCasesStatusFilter(value);
                      setCasesPage(1);
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

                {/* Pagination */}
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
                        setCasesPage(1);
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
                        setPaymentsSearch(e.target.value);
                        setPaymentsPage(1);
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
                        setPaymentsPage(1);
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
                        setLedgerSearch(e.target.value);
                        setLedgerPage(1);
                      }}
                    />
                  </div>
                  <div className="flex gap-2">
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
                    <Button variant="outline" onClick={downloadLedger}>
                      <Download className="mr-2 h-4 w-4" />
                      Export Ledger
                    </Button>
                  </div>
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Case</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
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
                          <TableCell>
                            <Badge variant={entry.type === "debit" ? "destructive" : "default"}>
                              {entry.type}
                            </Badge>
                          </TableCell>
                          <TableCell className={entry.type === "debit" ? "text-red-500" : "text-green-500"}>
                            {entry.type === "debit" ? `-$${entry.amount.toFixed(2)}` : `+$${entry.amount.toFixed(2)}`}
                          </TableCell>
                          <TableCell className={entry.runningBalance > 0 ? "text-red-500" : "text-green-500"}>
                            ${entry.runningBalance.toFixed(2)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex flex-wrap justify-between items-center gap-4 mt-4 w-full px-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(ledgerPage - 1) * ledgerPerPage + 1}–
                    {Math.min(ledgerPage * ledgerPerPage, ledgerWithBalance.length)} of {ledgerWithBalance.length}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      Rows per page:
                    </span>
                    <Select
                      value={String(ledgerPerPage)}
                      onValueChange={(val) => {
                        setLedgerPage(1);
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
  );
}