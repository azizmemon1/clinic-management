"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/hooks/use-toast"
import { ArrowLeft, Save } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"

// Mock family groups
const familyGroups = [
  { id: "1", name: "Smith Family" },
  { id: "2", name: "Brown Family" },
  { id: "3", name: "Wilson Family" },
  { id: "4", name: "Thomas Family" },
]

// Mock patient data
const mockPatients = [
  { id: "1", name: "John Smith", phone: "555-123-4567", dob: "1985-06-15", familyGroupId: "1", notes: "Allergic to penicillin" },
  { id: "2", name: "Sarah Johnson", phone: "555-234-5678", dob: "1990-03-22", familyGroupId: undefined, notes: "" },
  { id: "3", name: "Michael Brown", phone: "555-345-6789", dob: "1978-11-30", familyGroupId: "2", notes: "Prefers morning appointments" },
]

export default function EditPatientPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const patientId = params.id
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    dob: "",
    familyGroupId: undefined as string | undefined,
    notes: ""
  })

  // Fetch patient data
  useEffect(() => {
    // In a real app, this would be an API call
    const patient = mockPatients.find((p) => p.id === patientId)
    if (patient) {
      setFormData({
        name: patient.name,
        phone: patient.phone,
        dob: patient.dob,
        familyGroupId: patient.familyGroupId,
        notes: patient.notes || ""
      })
    }
  }, [patientId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (value: string) => {
    setFormData((prev) => ({ ...prev, familyGroupId: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call to update the patient
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Patient updated successfully",
        description: `${formData.name}'s information has been updated.`,
      })

      router.push(`/patients/${patientId}`)
    } catch (error) {
      toast({
        title: "Error updating patient",
        description: "There was a problem updating the patient. Please try again.",
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
          <Button variant="ghost" size="sm" asChild className="mr-4">
            <Link href={`/patients/${patientId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Edit Patient</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Patient Information</CardTitle>
            <CardDescription>Update the patient's details</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Enter patient's full name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" name="dob" type="date" value={formData.dob} onChange={handleChange} required />
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
                <Link href={`/patients/${patientId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
          </form>
        </Card>
      </div>
    </RouteGuard>
  )
}