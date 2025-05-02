"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Save } from "lucide-react"

// Mock patient data
const patient = {
  id: 1,
  name: "John Smith",
  phone: "555-123-4567",
  dob: "1985-06-15",
  age: 38,
}

// Mock medicines list
const medicines = [
  { id: 1, name: "Paracetamol" },
  { id: 2, name: "Ibuprofen" },
  { id: 3, name: "Amoxicillin" },
  { id: 4, name: "Cetirizine" },
  { id: 5, name: "Omeprazole" },
  { id: 6, name: "Multivitamins" },
  { id: 7, name: "Cough Syrup" },
  { id: 8, name: "Antacid" },
  { id: 9, name: "Probiotics" },
  { id: 10, name: "Aspirin" },
]

interface FormDataState {
  reason: string;
  notes: string;
  selectedMedicines: number[]; // Specify that this is an array of numbers
  paymentStatus: string;
  amount: string; // Consider if amount should be number type
}

interface NewCasePageProps {
  params: {
    id: string; // <-- Make sure 'id' matches your dynamic route segment, e.g., /your-route/[id]/page.tsx
  };
  // searchParams?: { [key: string]: string | string[] | undefined }; // Optional
}

export default function NewCasePage({ params }: NewCasePageProps) {
  const router = useRouter()
  const patientId = params.id

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<FormDataState>({
    reason: "",
    notes: "",
    selectedMedicines: [],
    paymentStatus: "",
    amount: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMedicineToggle = (medicineId: number) => {
    setFormData((prev) => {
      const selectedMedicines: number[] = [...prev.selectedMedicines]

      if (selectedMedicines.includes(medicineId)) {
        return {
          ...prev,
          selectedMedicines: selectedMedicines.filter((id) => id !== medicineId),
        }
      } else {
        return {
          ...prev,
          selectedMedicines: [...selectedMedicines, medicineId],
        }
      }
    })
  }

  const handleSubmit = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault()

    if (!formData.reason) {
      toast({
        title: "Error",
        description: "Please enter a reason for the visit.",
        variant: "destructive",
      })
      return
    }

    if (!formData.paymentStatus) {
      toast({
        title: "Error",
        description: "Please select a payment status.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call to save the case
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Case added successfully",
        description: `New case has been added for ${patient.name}.`,
      })

      router.push(`/patients/${patientId}`)
    } catch (error) {
      toast({
        title: "Error adding case",
        description: "There was a problem adding the case. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" asChild className="mr-4">
          <Link href={`/patients/${patientId}`}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">New Case</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add New Case for {patient.name}</CardTitle>
          <CardDescription>Record details of the current consultation</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Patient Name</p>
                <p className="font-medium">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Age</p>
                <p>{patient.age} years</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                name="reason"
                placeholder="Enter the reason for the patient's visit"
                value={formData.reason}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Prescription</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border rounded-md">
                {medicines.map((medicine) => (
                  <div key={medicine.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`medicine-${medicine.id}`}
                      checked={formData.selectedMedicines.includes(medicine.id)}
                      onCheckedChange={() => handleMedicineToggle(medicine.id)}
                    />
                    <Label htmlFor={`medicine-${medicine.id}`} className="cursor-pointer">
                      {medicine.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Enter any additional notes or instructions"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select
                  name="paymentStatus"
                  value={formData.paymentStatus}
                  onValueChange={(value) => handleSelectChange("paymentStatus", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select payment status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                    <SelectItem value="Unpaid">Unpaid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Amount Charged</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5">$</span>
                  <Input
                    id="amount"
                    name="amount"
                    type="number"
                    placeholder="0.00"
                    className="pl-7"
                    value={formData.amount}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
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
                  Save Case
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
