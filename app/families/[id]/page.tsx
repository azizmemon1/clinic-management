"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import { useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { useParams, useRouter } from "next/navigation"
import { RouteGuard } from "@/components/route-guard"

// Mock family data
const family = {
    id: 1,
    name: "Smith Family",
    members: [
        { id: 1, name: "John Smith" },
        { id: 2, name: "Mary Smith" },
        { id: 3, name: "James Smith" },
        // ... more members as needed
    ],
    cases: [
        { id: 101, date: "2023-04-15", reason: "Fever and cough", amount: 75, status: "Paid", patientName: "John Smith" },
        { id: 102, date: "2023-06-22", reason: "Annual checkup", amount: 120, status: "Paid", patientName: "John Smith" },
        // ... more cases as needed
    ]
}

export default function FamilyDetailPage() {
    const params = useParams()
    const familyId = params?.id as string
    const [currentPage, setCurrentPage] = useState(1)
    const [currentCasesPage, setCurrentCasesPage] = useState(1)
    const [membersPerPage, setMembersPerPage] = useState(10)
    const [casesPerPage, setCasesPerPage] = useState(10)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter()

    const getPaymentStatusColor = (status: string) => {
        switch (status) {
            case "Paid": return "bg-green-100 text-green-800"
            case "Partial": return "bg-yellow-100 text-yellow-800"
            case "Unpaid": return "bg-red-100 text-red-800"
            default: return "bg-gray-100 text-gray-800"
        }
    }
    const handleDeleteFamily = async (familyId: number) => {
        setIsSubmitting(true)

        try {
            await new Promise(resolve => setTimeout(resolve, 1000)) // Simulated API call

            toast({
                title: "Family deleted successfully",
                description: "The family group has been removed.",
            })

            setOpen(false) // Close the dialog
            router.push("/families") // Redirect
        } catch (error) {
            toast({
                title: "Error deleting family",
                description: "There was a problem deleting the family. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    // Pagination for members
    const totalMembersPages = Math.ceil(family.members.length / membersPerPage)
    const paginatedMembers = family.members.slice(
        (currentPage - 1) * membersPerPage,
        currentPage * membersPerPage
    )

    // Pagination for cases
    const totalCasesPages = Math.ceil(family.cases.length / casesPerPage)
    const paginatedCases = family.cases.slice(
        (currentCasesPage - 1) * casesPerPage,
        currentCasesPage * casesPerPage
    )

    return (
        <RouteGuard allowedRoles={["doctor", "staff"]}>
            <div className="p-6 space-y-6">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" size="sm" className="mr-4" onClick={() => window.history.back()}>
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Card className="lg:col-span-1 flex flex-col">
                        <CardHeader>
                            <CardTitle>Family Information</CardTitle>
                            <CardDescription>Family group and Ledger</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Family Name</p>
                                    <p className="font-medium">{family.name}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                                    <p>{family.members.length}</p>
                                </div>
                            </div>
                        </CardContent>
                        <div className="p-6 border-t">
                            <div className="space-y-3">
                                <Button variant="outline" className="w-full" asChild>
                                    <Link href={`/families/${familyId}/ledger`}>
                                        View Ledger
                                    </Link>
                                </Button>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" asChild>
                                        <Link href={`/families/${familyId}/edit`}>
                                            <Edit className="mr-2 h-4 w-4" />
                                            Edit
                                        </Link>
                                    </Button>
                                    <Dialog open={open} onOpenChange={setOpen}>
                                        <DialogTrigger asChild>
                                            <Button variant="destructive" className="flex-1">
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Delete
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Delete {family.name}?</DialogTitle>
                                            </DialogHeader>
                                            <div className="py-4">
                                                <p>Are you sure you want to delete this family group?</p>
                                                <p className="text-sm text-muted-foreground mt-2">
                                                    This will not delete the patient records, only remove the family association.
                                                </p>
                                            </div>
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline">Cancel</Button>
                                                <Button
                                                    variant="destructive"
                                                    onClick={() => handleDeleteFamily(family.id)}
                                                    disabled={isSubmitting}
                                                >
                                                    {isSubmitting ? "Deleting..." : "Delete Family"}
                                                </Button>
                                            </div>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </div>
                        </div>
                    </Card>

                    <Card className="lg:col-span-2">
                        <Tabs defaultValue="members">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle>Family Details</CardTitle>
                                    <TabsList>
                                        <TabsTrigger value="members">Family Members</TabsTrigger>
                                        <TabsTrigger value="history">Medical History</TabsTrigger>
                                    </TabsList>
                                </div>
                                <CardDescription>View family members and their medical history</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <TabsContent value="members" className="space-y-4">
                                    <div className="rounded-md border">
                                        <div className="relative h-[500px] overflow-y-auto">
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-background">
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedMembers.map((member) => (
                                                        <TableRow key={member.id} className="hover:bg-accent cursor-pointer">
                                                            <TableCell className="font-medium">{member.name}</TableCell>
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
                                    </div>

                                    {/* Members Pagination */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm text-muted-foreground">Rows per page</p>
                                            <Select
                                                value={`${membersPerPage}`}
                                                onValueChange={(value) => {
                                                    setMembersPerPage(Number(value))
                                                    setCurrentPage(1)
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[70px]">
                                                    <SelectValue placeholder={membersPerPage} />
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
                                        <div className="flex gap-2">
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
                                                disabled={currentPage === totalMembersPages}
                                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalMembersPages))}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="history" className="space-y-4">
                                    <div className="rounded-md border">
                                        <div className="relative h-[500px] overflow-y-auto">
                                            <Table>
                                                <TableHeader className="sticky top-0 bg-background">
                                                    <TableRow>
                                                        <TableHead>Patient</TableHead>
                                                        <TableHead>Date</TableHead>
                                                        <TableHead>Reason</TableHead>
                                                        <TableHead>Amount</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedCases.map((caseItem) => (
                                                        <TableRow
                                                            key={`${caseItem.patientName}-${caseItem.id}`}
                                                            className="hover:bg-accent cursor-pointer"
                                                        >
                                                            <TableCell className="font-medium">{caseItem.patientName}</TableCell>
                                                            <TableCell>{new Date(caseItem.date).toLocaleDateString()}</TableCell>
                                                            <TableCell>{caseItem.reason}</TableCell>
                                                            <TableCell>${caseItem.amount}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className={getPaymentStatusColor(caseItem.status)}>
                                                                    {caseItem.status}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                    </div>

                                    {/* Cases Pagination */}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <p className="text-sm text-muted-foreground">Rows per page</p>
                                            <Select
                                                value={`${casesPerPage}`}
                                                onValueChange={(value) => {
                                                    setCasesPerPage(Number(value))
                                                    setCurrentCasesPage(1)
                                                }}
                                            >
                                                <SelectTrigger className="h-8 w-[70px]">
                                                    <SelectValue placeholder={casesPerPage} />
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
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentCasesPage === 1}
                                                onClick={() => setCurrentCasesPage(prev => Math.max(prev - 1, 1))}
                                            >
                                                <ChevronLeft className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                disabled={currentCasesPage === totalCasesPages}
                                                onClick={() => setCurrentCasesPage(prev => Math.min(prev + 1, totalCasesPages))}
                                            >
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </TabsContent>
                            </CardContent>
                        </Tabs>
                    </Card>
                </div>
            </div>
        </RouteGuard>
    )
}