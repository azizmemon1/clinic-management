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

// Mock family data
const family = {
    id: 1,
    name: "Smith Family",
    members: [
        {
            id: 1,
            name: "John Smith",
            cases: [
                { id: 101, date: "2023-04-15", reason: "Fever and cough", amount: 75, status: "Paid" },
                { id: 102, date: "2023-06-22", reason: "Annual checkup", amount: 120, status: "Paid" },
                { id: 103, date: "2023-07-10", reason: "Back pain", amount: 90, status: "Paid" },
                { id: 104, date: "2023-09-05", reason: "Allergy check", amount: 65, status: "Paid" },
                { id: 105, date: "2023-09-05", reason: "Allergy check", amount: 65, status: "Paid" },
                { id: 106, date: "2023-09-05", reason: "Allergy check", amount: 65, status: "Paid" },
                { id: 107, date: "2023-09-05", reason: "Allergy check", amount: 65, status: "Paid" },
                { id: 108, date: "2023-09-05", reason: "Allergy check", amount: 65, status: "Paid" },
                { id: 109, date: "2023-09-05", reason: "Allergy check", amount: 65, status: "Paid" },
                { id: 110, date: "2023-09-05", reason: "Allergy check", amount: 65, status: "Paid" },
                { id: 111, date: "2023-09-05", reason: "Allergy check", amount: 65, status: "Paid" },
                { id: 112, date: "2023-09-05", reason: "Allergy check", amount: 65, status: "Paid" },
                { id: 113, date: "2023-09-05", reason: "Allergy check", amount: 65, status: "Paid" }
            ]
        },
        {
            id: 2,
            name: "Mary Smith",
            cases: [
                { id: 201, date: "2023-09-10", reason: "Stomach pain", amount: 95, status: "Partial" },
                { id: 202, date: "2023-11-15", reason: "Pregnancy checkup", amount: 150, status: "Paid" }
            ]
        },
        {
            id: 3,
            name: "James Smith",
            cases: [
                { id: 301, date: "2024-01-05", reason: "Headache and dizziness", amount: 60, status: "Unpaid" },
                { id: 302, date: "2024-02-12", reason: "Sports physical", amount: 85, status: "Paid" }
            ]
        }
    ]
}

interface PageProps {
    params: {
        id: string; // <-- Make sure 'id' matches your dynamic route segment, e.g., /your-route/[id]/page.tsx
    };
    // searchParams?: { [key: string]: string | string[] | undefined }; // Optional
}


export default function FamilyDetailPage() {
    const params = useParams()
    const familyId = params?.id as string
    const [currentPage, setCurrentPage] = useState(1)
    const [currentMembersPage, setCurrentMembersPage] = useState(1)
    const [itemsPerPage, setItemsPerPage] = useState(10)
    const [membersPerPage, setMembersPerPage] = useState(10)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [open, setOpen] = useState(false)
    const router = useRouter();

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


    // Combine and sort all cases
    const allCases = family.members.flatMap(member =>
        member.cases.map(caseItem => ({
            ...caseItem,
            patientName: member.name
        }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // Pagination logic for medical history
    const totalPages = Math.ceil(allCases.length / itemsPerPage)
    const paginatedCases = allCases.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    )

    // Pagination logic for family members
    const totalMembersPages = Math.ceil(family.members.length / membersPerPage)
    const paginatedMembers = family.members.slice(
        (currentMembersPage - 1) * membersPerPage,
        currentMembersPage * membersPerPage
    )

    // Format numbers with commas
    const formatNumber = (num: number) => {
        return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }

    return (
        <div className="p-6 space-y-6">
            <div className="flex items-center mb-6">
                <Button variant="ghost" size="sm" asChild className="mr-4">
                    <Link href="/families">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Families
                    </Link>
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
                                            >                             {isSubmitting ? "Deleting..." : "Delete Family"}
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </div>
                </Card>

                <Card className="lg:col-span-2">
                    <Tabs defaultValue="history">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle>Family History</CardTitle>
                                <TabsList>
                                    <TabsTrigger value="history">Medical History</TabsTrigger>
                                    <TabsTrigger value="members">Family Members</TabsTrigger>
                                </TabsList>
                            </div>
                            <CardDescription>View family member's medical history and information</CardDescription>
                        </CardHeader>
                        <CardContent>
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

                                {/* Pagination */}
                                <div className="flex items-center justify-between">
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
                                                {[5, 10, 25, 50, 100].map((pageSize) => (
                                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                                        {pageSize}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="text-sm text-muted-foreground">
                                            {`${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, allCases.length)} of ${formatNumber(allCases.length)}`}
                                        </div>
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
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </TabsContent>

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

                                {/* Pagination for members */}
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <p className="text-sm text-muted-foreground">Rows per page</p>
                                        <Select
                                            value={`${membersPerPage}`}
                                            onValueChange={(value) => {
                                                setMembersPerPage(Number(value))
                                                setCurrentMembersPage(1)
                                            }}
                                        >
                                            <SelectTrigger className="h-8 w-[70px]">
                                                <SelectValue placeholder={membersPerPage} />
                                            </SelectTrigger>
                                            <SelectContent side="top">
                                                {[5, 10, 25, 50, 100].map((pageSize) => (
                                                    <SelectItem key={pageSize} value={`${pageSize}`}>
                                                        {pageSize}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="text-sm text-muted-foreground">
                                            {`${(currentMembersPage - 1) * membersPerPage + 1}-${Math.min(currentMembersPage * membersPerPage, family.members.length)} of ${formatNumber(family.members.length)}`}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentMembersPage === 1}
                                            onClick={() => setCurrentMembersPage(prev => Math.max(prev - 1, 1))}
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            disabled={currentMembersPage === totalMembersPages}
                                            onClick={() => setCurrentMembersPage(prev => Math.min(prev + 1, totalMembersPages))}
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
    )
}