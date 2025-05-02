// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
// import { toast } from "@/components/ui/use-toast"
// import { ArrowLeft, Edit, Save, Trash2, Plus } from "lucide-react"
// import Link from "next/link"
// import {
//   Command,
//   CommandEmpty,
//   CommandGroup,
//   CommandInput,
//   CommandItem,
// } from "@/components/ui/command"
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover"
// import { Check, ChevronsUpDown } from "lucide-react"
// import { Badge } from "@/components/ui/badge"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

// // Mock data
// const mockFamilyGroups = [
//   { id: 1, name: "Smith Family", members: [1, 4] },
//   { id: 2, name: "Brown Family", members: [3] },
//   { id: 3, name: "Wilson Family", members: [5] },
//   { id: 4, name: "Thomas Family", members: [8] },
// ]

// const mockPatients = [
//   { id: 1, name: "John Smith", phone: "555-123-4567", dob: "1985-06-15" },
//   { id: 2, name: "Sarah Johnson", phone: "555-234-5678", dob: "1990-03-22" },
//   { id: 3, name: "Michael Brown", phone: "555-345-6789", dob: "1978-11-30" },
//   { id: 4, name: "Emily Davis", phone: "555-456-7890", dob: "1992-08-12" },
//   { id: 5, name: "David Wilson", phone: "555-567-8901", dob: "1982-04-25" },
//   { id: 6, name: "Jennifer Taylor", phone: "555-678-9012", dob: "1975-09-18" },
//   { id: 7, name: "Robert Anderson", phone: "555-789-0123", dob: "1988-12-05" },
//   { id: 8, name: "Lisa Thomas", phone: "555-890-1234", dob: "1995-02-28" },
// ]

// export default function FamilyGroupsPage() {
//   const router = useRouter()
//   const [isSubmitting, setIsSubmitting] = useState(false)
//   const [editingFamily, setEditingFamily] = useState<{
//     id: number | null
//     name: string
//     members: number[]
//   } | null>(null)
//   const [searchTerm, setSearchTerm] = useState("")
//   const [open, setOpen] = useState(false)

//   // Get available patients (not in any family or only in the current editing family)
//   const getAvailablePatients = () => {
//     const allFamilyMembers = mockFamilyGroups.flatMap(f => f.members)
//     const currentEditingFamilyMembers = editingFamily?.members || []
    
//     return mockPatients.filter(patient => 
//       !allFamilyMembers.includes(patient.id) || 
//       currentEditingFamilyMembers.includes(patient.id)
//     )
//   }

//   const handleEditFamily = (family: typeof mockFamilyGroups[0]) => {
//     setEditingFamily({ ...family })
//   }

//   const handleCancelEdit = () => {
//     setEditingFamily(null)
//   }

//   const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (editingFamily) {
//       setEditingFamily({
//         ...editingFamily,
//         name: e.target.value
//       })
//     }
//   }

//   const handleSelectPatient = (patientId: number) => {
//     if (!editingFamily) return
    
//     setEditingFamily(prev => {
//       if (!prev) return null
      
//       if (prev.members.includes(patientId)) {
//         return {
//           ...prev,
//           members: prev.members.filter(id => id !== patientId)
//         }
//       } else {
//         return {
//           ...prev,
//           members: [...prev.members, patientId]
//         }
//       }
//     })
//   }

//   const handleSaveFamily = async () => {
//     if (!editingFamily) return
//     setIsSubmitting(true)

//     try {
//       // In a real app, this would be an API call to update the family
//       await new Promise(resolve => setTimeout(resolve, 1000))
      
//       toast({
//         title: "Family updated successfully",
//         description: `${editingFamily.name} has been updated.`,
//       })
      
//       setEditingFamily(null)
//     } catch (error) {
//       toast({
//         title: "Error updating family",
//         description: "There was a problem updating the family. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const handleDeleteFamily = async (familyId: number) => {
//     setIsSubmitting(true)
    
//     try {
//       // In a real app, this would be an API call to delete the family
//       await new Promise(resolve => setTimeout(resolve, 1000))
      
//       toast({
//         title: "Family deleted successfully",
//         description: "The family group has been removed.",
//       })
//     } catch (error) {
//       toast({
//         title: "Error deleting family",
//         description: "There was a problem deleting the family. Please try again.",
//         variant: "destructive",
//       })
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   const availablePatients = getAvailablePatients()
//   const filteredPatients = availablePatients.filter(patient =>
//     patient.name.toLowerCase().includes(searchTerm.toLowerCase())
//   )

//   return (
//     <div className="p-6 max-w-4xl mx-auto">
//       <div className="flex items-center justify-between mb-6">
//         <div className="flex items-center">
//           <Button variant="ghost" size="sm" className="mr-4" onClick={() => window.history.back()}>
//             <ArrowLeft className="mr-2 h-4 w-4" />
//             Back
//           </Button>
//           <h1 className="text-3xl font-bold">Family Groups</h1>
//         </div>
//         <Button asChild>
//           <Link href="/families/new">
//             <Plus className="mr-2 h-4 w-4" />
//             New Family
//           </Link>
//         </Button>
//       </div>

//       {editingFamily ? (
//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle>Edit Family Group</CardTitle>
//             <CardDescription>Update family name and members</CardDescription>
//           </CardHeader>
//           <CardContent className="space-y-4">
//             <div className="space-y-2">
//               <Label htmlFor="familyName">Family Name</Label>
//               <Input
//                 id="familyName"
//                 name="familyName"
//                 placeholder="Enter family name"
//                 value={editingFamily.name}
//                 onChange={handleNameChange}
//                 required
//               />
//             </div>

//             <div className="space-y-2">
//               <Label>Family Members</Label>
//               <Popover open={open} onOpenChange={setOpen}>
//                 <PopoverTrigger asChild>
//                   <Button
//                     variant="outline"
//                     role="combobox"
//                     aria-expanded={open}
//                     className="w-full justify-between"
//                   >
//                     {editingFamily.members.length > 0
//                       ? `${editingFamily.members.length} selected`
//                       : "Select patients..."}
//                     <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
//                   </Button>
//                 </PopoverTrigger>
//                 <PopoverContent className="w-[400px] p-0">
//                   <Command>
//                     <CommandInput
//                       placeholder="Search patients..."
//                       value={searchTerm}
//                       onValueChange={setSearchTerm}
//                     />
//                     <CommandEmpty>No available patients found.</CommandEmpty>
//                     <CommandGroup className="max-h-[300px] overflow-y-auto">
//                       {filteredPatients.map((patient) => (
//                         <CommandItem
//                           key={patient.id}
//                           value={patient.id.toString()}
//                           onSelect={() => {
//                             handleSelectPatient(patient.id)
//                           }}
//                         >
//                           <Check
//                             className={`
//                               mr-2 h-4 w-4
//                               ${editingFamily.members.includes(patient.id) ? "opacity-100" : "opacity-0"}
//                             `}
//                           />
//                           {patient.name} ({patient.dob})
//                         </CommandItem>
//                       ))}
//                     </CommandGroup>
//                   </Command>
//                 </PopoverContent>
//               </Popover>

//               <div className="mt-2 flex flex-wrap gap-2">
//                 {editingFamily.members.map(memberId => {
//                   const patient = mockPatients.find(p => p.id === memberId)
//                   return patient ? (
//                     <Badge
//                       key={patient.id}
//                       variant="secondary"
//                       className="cursor-pointer"
//                       onClick={() => handleSelectPatient(patient.id)}
//                     >
//                       {patient.name}
//                       <span className="ml-2">×</span>
//                     </Badge>
//                   ) : null
//                 })}
//               </div>
//             </div>
//           </CardContent>
//           <CardFooter className="flex justify-between">
//             <Button variant="outline" onClick={handleCancelEdit}>
//               Cancel
//             </Button>
//             <Button 
//               type="button" 
//               onClick={handleSaveFamily}
//               disabled={isSubmitting || !editingFamily.name || editingFamily.members.length === 0}
//             >
//               {isSubmitting ? (
//                 "Saving..."
//               ) : (
//                 <>
//                   <Save className="mr-2 h-4 w-4" />
//                   Save Changes
//                 </>
//               )}
//             </Button>
//           </CardFooter>
//         </Card>
//       ) : null}

//       <div className="space-y-4">
//         {mockFamilyGroups.map(family => {
//           const familyMembers = mockPatients.filter(patient => 
//             family.members.includes(patient.id)
//           )
//           return(
//             <Card key={family.id}>
//               <CardHeader>
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <CardTitle>{family.name}</CardTitle>
//                     <CardDescription>
//                       {family.members.length} family member{family.members.length !== 1 ? 's' : ''}
//                     </CardDescription>
//                   </div>
//                   <div className="flex gap-2">
//                     <Button 
//                       variant="outline" 
//                       size="sm"
//                       onClick={() => handleEditFamily(family)}
//                     >
//                       <Edit className="mr-2 h-4 w-4" />
//                       Edit
//                     </Button>
//                     <Dialog>
//                       <DialogTrigger asChild>
//                         <Button variant="destructive" size="sm">
//                           <Trash2 className="mr-2 h-4 w-4" />
//                           Delete
//                         </Button>
//                       </DialogTrigger>
//                       <DialogContent>
//                         <DialogHeader>
//                           <DialogTitle>Delete {family.name}?</DialogTitle>
//                         </DialogHeader>
//                         <div className="py-4">
//                           <p>Are you sure you want to delete this family group?</p>
//                           <p className="text-sm text-muted-foreground mt-2">
//                             This will not delete the patient records, only remove the family association.
//                           </p>
//                         </div>
//                         <div className="flex justify-end gap-2">
//                           <Button variant="outline">Cancel</Button>
//                           <Button 
//                             variant="destructive"
//                             onClick={() => handleDeleteFamily(family.id)}
//                             disabled={isSubmitting}
//                           >
//                             {isSubmitting ? "Deleting..." : "Delete Family"}
//                           </Button>
//                         </div>
//                       </DialogContent>
//                     </Dialog>
//                   </div>
//                 </div>
//               </CardHeader>
//               <CardContent>
//                 <div className="flex flex-wrap gap-2">
//                   {familyMembers.map(patient => (
//                     <Badge key={patient.id} variant="secondary">
//                       {patient.name}
//                     </Badge>
//                   ))}
//                 </div>
//               </CardContent>
//             </Card>
//           )
//         })}
//       </div>
//     </div>
//   )
// }
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

// Mock family data
const family = {
  id: "1",
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

export default function FamilyDetailPage({ params }) {
  const familyId = params.id
  const [currentPage, setCurrentPage] = useState(1)
  const [currentMembersPage, setCurrentMembersPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  const [membersPerPage, setMembersPerPage] = useState(10)

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "Paid": return "bg-green-100 text-green-800"
      case "Partial": return "bg-yellow-100 text-yellow-800"
      case "Unpaid": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
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
                <Button variant="destructive" className="flex-1">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
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