"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Search, Pill, Save } from "lucide-react"

// Mock patients data
const mockPatients = [
  {
    id: 1,
    name: "John Smith",
    phone: "555-123-4567",
    regularMedicines: [
      { id: 1, name: "Paracetamol", dosage: "500mg", frequency: "As needed" },
      { id: 7, name: "Cough Syrup", dosage: "10ml", frequency: "Twice daily" },
    ],
  },
  {
    id: 2,
    name: "Sarah Johnson",
    phone: "555-234-5678",
    regularMedicines: [{ id: 6, name: "Multivitamins", dosage: "1 tablet", frequency: "Once daily" }],
  },
  {
    id: 3,
    name: "Michael Brown",
    phone: "555-345-6789",
    regularMedicines: [
      { id: 3, name: "Amoxicillin", dosage: "250mg", frequency: "Three times daily" },
      { id: 8, name: "Antacid", dosage: "1 tablet", frequency: "After meals" },
    ],
  },
]

// Mock medicines list
const medicines = [
  { id: 1, name: "Paracetamol", stock: 120 },
  { id: 2, name: "Ibuprofen", stock: 85 },
  { id: 3, name: "Amoxicillin", stock: 60 },
  { id: 4, name: "Cetirizine", stock: 45 },
  { id: 5, name: "Omeprazole", stock: 30 },
  { id: 6, name: "Multivitamins", stock: 75 },
  { id: 7, name: "Cough Syrup", stock: 25 },
  { id: 8, name: "Antacid", stock: 50 },
  { id: 9, name: "Probiotics", stock: 40 },
  { id: 10, name: "Aspirin", stock: 90 },
]

export default function MedicinePage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatient, setSelectedPatient] = useState(null)
  const [dispensedMedicines, setDispensedMedicines] = useState({})
  const [paymentAmount, setPaymentAmount] = useState("")
  const [paymentStatus, setPaymentStatus] = useState("Paid")

  const filteredPatients = searchQuery
    ? mockPatients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || patient.phone.includes(searchQuery),
      )
    : []

  const handleSelectPatient = (patient) => {
    setSelectedPatient(patient)

    // Initialize dispensed medicines with patient's regular medicines
    const initialDispensed = {}
    patient.regularMedicines.forEach((med) => {
      initialDispensed[med.id] = true
    })

    setDispensedMedicines(initialDispensed)

    // Calculate initial payment amount based on selected medicines
    calculatePaymentAmount(initialDispensed)
  }

  const handleToggleMedicine = (medicineId) => {
    setDispensedMedicines((prev) => {
      const updated = {
        ...prev,
        [medicineId]: !prev[medicineId],
      }

      // Recalculate payment amount when medicines change
      calculatePaymentAmount(updated)

      return updated
    })
  }

  const calculatePaymentAmount = (dispensed) => {
    // Simple calculation - $10 per medicine
    const count = Object.values(dispensed).filter(Boolean).length
    setPaymentAmount((count * 10).toString())
  }

  const handleDispenseMedicines = () => {
    const selectedMeds = Object.entries(dispensedMedicines)
      .filter(([_, isSelected]) => isSelected)
      .map(([id]) => medicines.find((m) => m.id.toString() === id))

    if (selectedMeds.length === 0) {
      toast({
        title: "No medicines selected",
        description: "Please select at least one medicine to dispense.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Medicines dispensed successfully",
      description: `${selectedMeds.length} medicines dispensed to ${selectedPatient.name}.`,
    })

    // Reset form
    setSelectedPatient(null)
    setDispensedMedicines({})
    setPaymentAmount("")
    setSearchQuery("")
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Medicine Dispensing</h1>
        <Button variant="outline" asChild>
          <Link href="/medicine/inventory">
            <Pill className="mr-2 h-4 w-4" />
            Inventory
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Patient Search</CardTitle>
            <CardDescription>Find a patient to dispense medicine</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Search Patient</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name or phone number..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={!!selectedPatient}
                />
              </div>
            </div>

            {searchQuery && !selectedPatient && (
              <div className="border rounded-md">
                {filteredPatients.length > 0 ? (
                  <div className="divide-y">
                    {filteredPatients.map((patient) => (
                      <div
                        key={patient.id}
                        className="p-3 flex justify-between items-center hover:bg-muted cursor-pointer"
                        onClick={() => handleSelectPatient(patient)}
                      >
                        <div>
                          <div className="font-medium">{patient.name}</div>
                          <div className="text-sm text-muted-foreground">{patient.phone}</div>
                        </div>
                        <Button type="button" size="sm" variant="ghost">
                          Select
                        </Button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center">
                    <p className="text-muted-foreground">No patients found with that name or phone number.</p>
                  </div>
                )}
              </div>
            )}

            {selectedPatient && (
              <div className="space-y-4">
                <div className="p-4 border rounded-md bg-muted">
                  <div className="text-sm font-medium text-muted-foreground">Selected Patient</div>
                  <div className="font-medium text-lg">{selectedPatient.name}</div>
                  <div className="text-sm">{selectedPatient.phone}</div>
                </div>

                <div className="space-y-2">
                  <Label>Regular Medicines</Label>
                  {selectedPatient.regularMedicines.length > 0 ? (
                    <div className="space-y-2">
                      {selectedPatient.regularMedicines.map((medicine) => (
                        <div key={medicine.id} className="p-2 border rounded-md">
                          <div className="font-medium">{medicine.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {medicine.dosage} - {medicine.frequency}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No regular medicines.</p>
                  )}
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSelectedPatient(null)
                    setDispensedMedicines({})
                    setPaymentAmount("")
                  }}
                >
                  Change Patient
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Dispense Medicines</CardTitle>
            <CardDescription>Select medicines to dispense to the patient</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {!selectedPatient ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-2">Please select a patient first</p>
                <p className="text-sm text-muted-foreground">Search for a patient to dispense medicines</p>
              </div>
            ) : (
              <>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-12"></TableHead>
                        <TableHead>Medicine</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Regular</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {medicines.map((medicine) => {
                        const isRegular = selectedPatient.regularMedicines.some((med) => med.id === medicine.id)

                        return (
                          <TableRow key={medicine.id}>
                            <TableCell>
                              <Checkbox
                                checked={!!dispensedMedicines[medicine.id]}
                                onCheckedChange={() => handleToggleMedicine(medicine.id)}
                              />
                            </TableCell>
                            <TableCell className="font-medium">{medicine.name}</TableCell>
                            <TableCell>
                              {medicine.stock > 20 ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                                  {medicine.stock} in stock
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
                                  {medicine.stock} in stock
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{isRegular && <Badge>Regular</Badge>}</TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentStatus">Payment Status</Label>
                      <div className="flex gap-4">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="paid"
                            checked={paymentStatus === "Paid"}
                            onCheckedChange={() => setPaymentStatus("Paid")}
                          />
                          <Label htmlFor="paid">Paid</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="partial"
                            checked={paymentStatus === "Partial"}
                            onCheckedChange={() => setPaymentStatus("Partial")}
                          />
                          <Label htmlFor="partial">Partial</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="unpaid"
                            checked={paymentStatus === "Unpaid"}
                            onCheckedChange={() => setPaymentStatus("Unpaid")}
                          />
                          <Label htmlFor="unpaid">Unpaid</Label>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-2.5">$</span>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="0.00"
                          className="pl-7"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Button className="w-full" onClick={handleDispenseMedicines}>
                    <Save className="mr-2 h-4 w-4" />
                    Dispense Medicines
                  </Button>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
