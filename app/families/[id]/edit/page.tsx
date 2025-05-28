"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Save, X } from "lucide-react"
import Link from "next/link"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
} from "@/components/ui/command"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { RouteGuard } from "@/components/route-guard"

// Mock data - replace with API calls
const mockFamily = {
    id: 1,
    name: "Smith Family",
    members: [1, 4] // IDs of family members
}

const mockPatients = [
    { id: 1, name: "John Smith", phone: "555-123-4567", dob: "1985-06-15" },
    { id: 2, name: "Sarah Johnson", phone: "555-234-5678", dob: "1990-03-22" },
    { id: 3, name: "Michael Brown", phone: "555-345-6789", dob: "1978-11-30" },
    { id: 4, name: "Emily Davis", phone: "555-456-7890", dob: "1992-08-12" },
]

export default function EditFamilyPage() {
    const params = useParams()
    const familyId = params?.id as string
    const router = useRouter()

    const [originalFamily, setOriginalFamily] = useState({
        id: 0,
        name: "",
        members: [] as number[]
    })

    const [family, setFamily] = useState({
        id: 0,
        name: "",
        members: [] as number[]
    })

    const [allPatients, setAllPatients] = useState(mockPatients)
    const [searchTerm, setSearchTerm] = useState("")
    const [open, setOpen] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Load initial data
    useEffect(() => {
        // In a real app, you would fetch these from your API
        const initialFamily = mockFamily
        setOriginalFamily(initialFamily)
        setFamily(initialFamily)
        setAllPatients(mockPatients)
    }, [])

    // Check if there are changes
    const hasChanges = () => {
        return (
            family.name !== originalFamily.name ||
            JSON.stringify([...family.members].sort()) !==
            JSON.stringify([...originalFamily.members].sort())
        )
    }

    // Get available patients
    const getAvailablePatients = () => {
        return allPatients.filter(patient =>
            !mockFamily.members.includes(patient.id) ||
            family.members.includes(patient.id)
        )
    }

    const availablePatients = getAvailablePatients()
    const filteredPatients = availablePatients.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFamily(prev => ({
            ...prev,
            name: e.target.value
        }))
    }

    const handleSelectPatient = (patientId: number) => {
        setFamily(prev => {
            if (prev.members.includes(patientId)) {
                return {
                    ...prev,
                    members: prev.members.filter(id => id !== patientId)
                }
            } else {
                return {
                    ...prev,
                    members: [...prev.members, patientId]
                }
            }
        })
    }

    const handleSaveFamily = async () => {

        setIsSubmitting(true)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000))

            toast({
                title: "Family updated successfully",
                description: `${family.name} has been updated.`,
            })

            // Update original family to current state
            setOriginalFamily(family)
            router.push(`/families/${familyId}`)
        } catch (error) {
            toast({
                title: "Error updating family",
                description: "There was a problem updating the family. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <RouteGuard allowedRoles={["doctor", "staff"]}>
            <div className="p-6 max-w-4xl mx-auto">
                <div className="flex items-center mb-6">
                    <Button variant="ghost" size="sm" asChild className="mr-4">
                        <Link href={`/families/${familyId}`}>
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back to Family
                        </Link>
                    </Button>
                    <h1 className="text-2xl font-bold">Edit Family Group</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Family Details</CardTitle>
                        <CardDescription>Update family name and members</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="familyName">Family Name</Label>
                            <Input
                                id="familyName"
                                name="familyName"
                                placeholder="Enter family name"
                                value={family.name}
                                onChange={handleNameChange}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Family Members</Label>
                            <Popover open={open} onOpenChange={setOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={open}
                                        className="w-full justify-between"
                                    >
                                        {family.members.length > 0
                                            ? `${family.members.length} selected`
                                            : "Select patients..."}
                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-[400px] p-0">
                                    <Command>
                                        <CommandInput
                                            placeholder="Search patients..."
                                            value={searchTerm}
                                            onValueChange={setSearchTerm}
                                        />
                                        <CommandEmpty>No available patients found.</CommandEmpty>
                                        <CommandGroup className="max-h-[300px] overflow-y-auto">
                                            {filteredPatients.map((patient) => (
                                                <CommandItem
                                                    key={patient.id}
                                                    value={patient.id.toString()}
                                                    onSelect={() => {
                                                        handleSelectPatient(patient.id)
                                                    }}
                                                >
                                                    <Check
                                                        className={`
                            mr-2 h-4 w-4
                            ${family.members.includes(patient.id) ? "opacity-100" : "opacity-0"}
                          `}
                                                    />
                                                    {patient.name} ({patient.dob})
                                                </CommandItem>
                                            ))}
                                        </CommandGroup>
                                    </Command>
                                </PopoverContent>
                            </Popover>

                            <div className="mt-2 flex flex-wrap gap-2">
                                {family.members.map(memberId => {
                                    const patient = allPatients.find(p => p.id === memberId)
                                    return patient ? (
                                        <Badge
                                            key={patient.id}
                                            variant="secondary"
                                            className="cursor-pointer hover:bg-gray-200"
                                            onClick={() => handleSelectPatient(patient.id)}
                                        >
                                            {patient.name}
                                            <X className="ml-2 h-3 w-3" />
                                        </Badge>
                                    ) : null
                                })}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button variant="outline" asChild>
                            <Link href={`/families/${familyId}`}>
                                Cancel
                            </Link>
                        </Button>
                        <Button
                            onClick={handleSaveFamily}
                            disabled={
                                isSubmitting ||
                                !family.name ||
                                family.members.length === 0 ||
                                !hasChanges() // Disable if no changes
                            }
                        >
                            {isSubmitting ? (
                                "Saving..."
                            ) : (
                                <>
                                    <Save className="mr-2 h-4 w-4" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </RouteGuard>
    )
}