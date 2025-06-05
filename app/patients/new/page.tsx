"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import Link from "next/link"
import { RouteGuard } from "@/components/route-guard"

// Mock family groups
const familyGroups = [
  { id: "1", name: "Smith Family" },
  { id: "2", name: "Brown Family" },
  { id: "3", name: "Wilson Family" },
  { id: "4", name: "Thomas Family" },
]

// Mock function to fetch existing patient names
async function fetchPatientNames(): Promise<string[]> {
  // In a real app, this would be an API call to fetch existing patient names
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        "John Doe",
        "Jane Smith",
        "Robert Johnson",
        "Emily Davis",
        "Michael Wilson"
      ])
    }, 500)
  })
}

export default function NewPatientPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [existingNames, setExistingNames] = useState<string[]>([])
  const [nameError, setNameError] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dob: "",
    familyGroupId: undefined as string | undefined,
    notes: ""
  })

  useEffect(() => {
    // Fetch existing patient names when component mounts
    fetchPatientNames().then(names => {
      setExistingNames(names)
    })
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear name error when typing
    if (name === "name" && nameError) {
      setNameError("")
    }
  };

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, familyGroupId: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    // Check if name already exists
    if (existingNames.includes(formData.name.trim())) {
      setNameError("This name is already in use. Please choose a different name.")
      return
    }

    setIsSubmitting(true);

    try {
      // In a real app, this would be an API call to save the patient
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Patient registered successfully",
        description: `${formData.name} has been added to the system.`,
      })

      const referrerPatientId = searchParams.get("referrerPatientId")
      router.push(referrerPatientId ? `/patients/${referrerPatientId}` : "/patients")
    } catch (error) {
      toast({
        title: "Error registering patient",
        description: "There was a problem adding the patient. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RouteGuard allowedRoles={["doctor", "staff"]}>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">New Patient</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Patient Registration</CardTitle>
            <CardDescription>Enter the new patient's information</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div>
                  <Input
                    id="name"
                    name="name"
                    list="patientNames"
                    placeholder="Enter patient's full name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <datalist id="patientNames">
                    {existingNames.map((name) => (
                      <option key={name} value={name} />
                    ))}
                  </datalist>
                </div>
                {nameError && <p className="text-sm font-medium text-destructive">{nameError}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number (Optional)</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  type="tel"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Age / Date of Birth (Optional)</Label>
                <div className="flex gap-2">
                  <Input
                    id="dob"
                    name="dob"
                    type="date"
                    value={formData.dob}
                    onChange={handleChange}
                    className="flex-1"
                  />
                  <span className="flex items-center text-sm text-muted-foreground">or</span>
                  <Input
                    id="age"
                    name="age"
                    type="number"
                    placeholder="Age"
                    min="0"
                    max="120"
                    onChange={(e) => {
                      // Convert age to approximate date of birth
                      if (e.target.value) {
                        const age = parseInt(e.target.value)
                        const currentYear = new Date().getFullYear()
                        const birthYear = currentYear - age
                        setFormData(prev => ({
                          ...prev,
                          dob: `${birthYear}-01-01` // Default to Jan 1st of the birth year
                        }))
                      } else {
                        setFormData(prev => ({ ...prev, dob: "" }))
                      }
                    }}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="familyGroupId">Family Group (Optional)</Label>
                <Select
                  value={formData.familyGroupId}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a family group (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    {familyGroups.map((group) => (
                      <SelectItem key={group.id} value={group.id}>
                        {group.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Enter any additional notes about the patient"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/patients">Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  "Saving..."
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Patient
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