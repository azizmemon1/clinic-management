"use client";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AlertCircle, Plus, Download, Loader2 } from "lucide-react";
import * as XLSX from "xlsx";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { endOfDay, format, isAfter, isBefore, isSameDay, isWithinInterval, startOfDay } from "date-fns";
import Link from "next/link";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { type DateRange } from "react-day-picker";

// Mock data types
interface Case {
  id: number;
  patientName: string;
  date: string;
  reason: string;
  isEmergency: boolean;
  paymentStatus: "Paid" | "Pending" | "Partial";
  amount: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// Mock API function
const fetchCases = async (): Promise<Case[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return [
    {
      id: 101,
      patientName: "Rahul Sharma",
      date: "2023-04-15",
      reason: "Fever and cough",
      isEmergency: false,
      paymentStatus: "Paid",
      amount: 75,
    },
    {
      id: 102,
      patientName: "Priya Patel",
      date: "2023-04-16",
      reason: "Dental checkup",
      isEmergency: false,
      paymentStatus: "Pending",
      amount: 200,
    },
    {
      id: 103,
      patientName: "Amit Singh",
      date: "2023-04-17",
      reason: "Chest pain",
      isEmergency: true,
      paymentStatus: "Partial",
      amount: 350,
    },
    {
      id: 104,
      patientName: "Amit Singh",
      date: "2023-04-17",
      reason: "Chest pain",
      isEmergency: true,
      paymentStatus: "Partial",
      amount: 350,
    },
    {
      id: 105,
      patientName: "Amit Singh",
      date: "2023-04-17",
      reason: "Chest pain",
      isEmergency: true,
      paymentStatus: "Partial",
      amount: 350,
    },
    {
      id: 106,
      patientName: "Amit Singh",
      date: "2025-04-17",
      reason: "Chest pain",
      isEmergency: true,
      paymentStatus: "Partial",
      amount: 350,
    },
  ];
};

export default function CasesPage() {
  const router = useRouter();
  const [cases, setCases] = useState<Case[]>([]);
  const [filteredCases, setFilteredCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true);
  // pages states
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  // filters states 
  const [searchQuery, setSearchQuery] = useState(""); // TODO: add debounce search
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const totalItems = cases.length;
  const totalPages = Math.ceil(totalItems / rowsPerPage);

  // const filteredCases = useMemo(async () => {
  //   await loadData();
  //   const from = dateRange?.from ? startOfDay(dateRange.from) : undefined;
  //   const to = dateRange?.to ? endOfDay(dateRange.to) : undefined;

  //   setIsLoading(true);
  //   // mock api call
  //   // Simulate network delay
  //   await new Promise((resolve) => setTimeout(resolve, 500));
  //   setIsLoading(false);
  
  //   return cases.filter((c) => {
  //     const matchesSearch =
  //       c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
  //       c.reason.toLowerCase().includes(searchQuery.toLowerCase());

  //       const caseDate = startOfDay(new Date(c.date));
  //       let matchesDate = true;

  //       if (from && to && isSameDay(from, to)) {
  //         // Single day filter
  //         matchesDate = isSameDay(caseDate, from);
  //       } else if (from && to) {
  //         matchesDate = isWithinInterval(caseDate, { start: from, end: to });
  //       } else if (from) {
  //         matchesDate = isAfter(caseDate, from) || isSameDay(caseDate, from);
  //       } else if (to) {
  //         matchesDate = isBefore(caseDate, to) || isSameDay(caseDate, to);
  //       }

  //     const matchesStatus =
  //       statusFilter === "All" || c.paymentStatus === statusFilter;

  //     return matchesSearch && matchesDate && matchesStatus;
  //   });
  // }, [cases, searchQuery, dateRange, statusFilter]);

  // Async function to load and filter data
const loadFilteredCases = async () => {
  setIsLoading(true);
  await loadData(); // Your data loading function
  const from = dateRange?.from ? startOfDay(dateRange.from) : undefined;
  const to = dateRange?.to ? endOfDay(dateRange.to) : undefined;

  // Mock API call simulation
  await new Promise((resolve) => setTimeout(resolve, 500));

  const filtered = cases.filter((c) => {
    const matchesSearch =
      c.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.reason.toLowerCase().includes(searchQuery.toLowerCase());

    const caseDate = startOfDay(new Date(c.date));
    let matchesDate = true;

    if (from && to && isSameDay(from, to)) {
      matchesDate = isSameDay(caseDate, from);
    } else if (from && to) {
      matchesDate = isWithinInterval(caseDate, { start: from, end: to });
    } else if (from) {
      matchesDate = isAfter(caseDate, from) || isSameDay(caseDate, from);
    } else if (to) {
      matchesDate = isBefore(caseDate, to) || isSameDay(caseDate, to);
    }

    const matchesStatus =
      statusFilter === "All" || c.paymentStatus === statusFilter;

    return matchesSearch && matchesDate && matchesStatus;
  });

  setFilteredCases(filtered);
  setIsLoading(false);
};

// Run the filtering logic whenever `cases`, `searchQuery`, `dateRange`, or `statusFilter` change
useEffect(() => {
  loadFilteredCases();
}, [searchQuery, dateRange, statusFilter]);

  const paginatedCases = useMemo(() => {
    return filteredCases.slice(
      (currentPage - 1) * rowsPerPage,
      currentPage * rowsPerPage
    );
  }, [filteredCases, currentPage, rowsPerPage]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages || 1); // fallback to 1 if totalPages = 0
    }
  }, [totalPages]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchCases();
      setCases(data);
      // toast({ title: "Data loaded successfully" });
    } catch (error) {
      toast({ title: "Failed to load data", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const downloadCasesSheet = () => {
    const worksheet = XLSX.utils.json_to_sheet(cases);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cases");

    XLSX.writeFile(workbook, "patient-cases.xlsx");
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Patient Cases</CardTitle>
            <CardDescription>Recent medical cases and payments</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={downloadCasesSheet}
              disabled={isLoading}
            >
              <Download className="mr-2 h-4 w-4" />
              {isLoading ? "Loading..." : "Download"}
            </Button>
            <Link href="/cases/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Case
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            {/* Search on the left */}
            <Input
              type="text"
              placeholder="Search patient or reason"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full sm:w-64"
            />

            {/* Date range & status on the right */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-4">
              {/* Date Range Picker */}
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
                      onClick={() => setDateRange(undefined)}
                    >
                      Clear
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="min-w-[120px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {["All", "Paid", "Pending", "Partial"].map((status) => (
                    <SelectItem key={status} value={status}>
                      {status}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Emergency</TableHead>
                <TableHead>Amount (₹)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    <div className="flex justify-center items-center gap-2 text-muted-foreground">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Loading cases...
                    </div>
                  </TableCell>
                </TableRow>
              ) : paginatedCases.length > 0 ? (
                paginatedCases.map((caseItem) => (
                  <TableRow
                    key={caseItem.id}
                    onClick={() => router.push(`/cases/${caseItem.id}`)}
                  >
                    <TableCell className="font-medium">
                      {caseItem.patientName}
                    </TableCell>
                    <TableCell>
                      {format(new Date(caseItem.date), "dd MMM yyyy, hh:mm a")}
                    </TableCell>
                    <TableCell>{caseItem.reason}</TableCell>
                    <TableCell>
                      {caseItem.isEmergency && (
                        <AlertCircle className="text-red-500 h-4 w-4" />
                      )}
                    </TableCell>
                    <TableCell>{caseItem.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          caseItem.paymentStatus === "Paid"
                            ? "default"
                            : caseItem.paymentStatus === "Pending"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {caseItem.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          router.push(`/cases/${caseItem.id}`);
                        }}
                      >
                        View
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="text-center h-24">
                    {isLoading ? "Loading cases..." : "No cases found"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Footer below the table */}
          <div className="flex flex-wrap justify-between items-center gap-4 mt-4 w-full px-4">
            <div className="text-sm text-muted-foreground">
              Showing {(currentPage - 1) * rowsPerPage + 1}–
              {Math.min(currentPage * rowsPerPage, totalItems)} of {totalItems}
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                Rows per page:
              </span>
              <Select
                value={String(rowsPerPage)}
                onValueChange={(val) => {
                  setRowsPerPage(Number(val));
                  setCurrentPage(1); // Reset to first page when changing rows per page
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
  );
}
