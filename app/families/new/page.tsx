"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Save } from "lucide-react"
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

// Mock data for patients
const mockPatients = [
  { id: 1, name: "John Smith", phone: "555-123-4567", dob: "1985-06-15", familyGroup: "Smith Family" },
  { id: 2, name: "Sarah Johnson", phone: "555-234-5678", dob: "1990-03-22", familyGroup: null },
  { id: 3, name: "Michael Brown", phone: "555-345-6789", dob: "1978-11-30", familyGroup: "Brown Family" },
  { id: 4, name: "Emily Davis", phone: "555-456-7890", dob: "1992-08-12", familyGroup: null },
  { id: 5, name: "David Wilson", phone: "555-567-8901", dob: "1982-04-25", familyGroup: "Wilson Family" },
  { id: 6, name: "Jennifer Taylor", phone: "555-678-9012", dob: "1975-09-18", familyGroup: null },
  { id: 7, name: "Robert Anderson", phone: "555-789-0123", dob: "1988-12-05", familyGroup: null },
  { id: 8, name: "Lisa Thomas", phone: "555-890-1234", dob: "1995-02-28", familyGroup: "Thomas Family" },
]

export default function NewPatientFamilyPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    familyName: "",
    selectedPatients: [] as number[],
  })
  const [searchTerm, setSearchTerm] = useState("")
  const [open, setOpen] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectPatient = (patientId: number) => {
    setFormData((prev) => {
      if (prev.selectedPatients.includes(patientId)) {
        return {
          ...prev,
          selectedPatients: prev.selectedPatients.filter(id => id !== patientId)
        }
      } else {
        return {
          ...prev,
          selectedPatients: [...prev.selectedPatients, patientId]
        }
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call to save the family group
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Family group created successfully",
        description: `${formData.familyName} has been created with ${formData.selectedPatients.length} members.`,
      })

      router.push("/families")
    } catch (error) {
      toast({
        title: "Error creating family group",
        description: "There was a problem creating the family group. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Filter patients who don't belong to any family group
  const availablePatients = mockPatients.filter(patient =>
    patient.familyGroup === null
  )

  const filteredPatients = availablePatients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedPatientsData = mockPatients.filter(patient =>
    formData.selectedPatients.includes(patient.id)
  )

  return (
    <RouteGuard allowedRoles={["doctor", "staff"]}>
      <div className="p-6 mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">New Family Group</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Create Family Group</CardTitle>
            <CardDescription>Enter family name and select members</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="familyName">Family Name</Label>
                <Input
                  id="familyName"
                  name="familyName"
                  placeholder="Enter family name"
                  value={formData.familyName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Select Family Members</Label>
                <Popover open={open} onOpenChange={setOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      aria-expanded={open}
                      className="w-full justify-between"
                    >
                      {formData.selectedPatients.length > 0
                        ? `${formData.selectedPatients.length} selected`
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
                        {filteredPatients.length === 0 ? (
                          <div className="py-6 text-center text-sm text-muted-foreground">
                            All patients already belong to families
                          </div>
                        ) : (
                          filteredPatients.map((patient) => (
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
                                ${formData.selectedPatients.includes(patient.id) ? "opacity-100" : "opacity-0"}
                              `}
                              />
                              {patient.name} ({patient.dob})
                            </CommandItem>
                          ))
                        )}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                {selectedPatientsData.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {selectedPatientsData.map((patient) => (
                      <Badge
                        key={patient.id}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => handleSelectPatient(patient.id)}
                      >
                        {patient.name}
                        <span className="ml-2">×</span>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/patients">Cancel</Link>
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || !formData.familyName || formData.selectedPatients.length === 0}
              >
                {isSubmitting ? (
                  "Creating..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Create Family
                  </>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </RouteGuard>
  )
}