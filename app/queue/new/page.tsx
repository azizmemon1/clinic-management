"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"
import { ArrowLeft, Search, UserPlus } from "lucide-react"
import { RouteGuard } from "@/components/route-guard"

const mockPatients = [
  { id: 1, name: "John Smith", phone: "555-123-4567" },
  { id: 2, name: "Sarah Johnson", phone: "555-234-5678" },
  { id: 3, name: "Michael Brown", phone: "555-345-6789" },
  { id: 4, name: "Emily Davis", phone: "555-456-7890" },
  { id: 5, name: "David Wilson", phone: "555-567-8901" },
]

export default function NewTokenPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const patientIdParam = searchParams.get("patientId")
  const referrer = searchParams.get("referrer") || "/queue"

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedPatientId, setSelectedPatientId] = useState(patientIdParam || "")
  const [isEmergency, setIsEmergency] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const filteredPatients = searchQuery
    ? mockPatients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchQuery.toLowerCase()) || patient.phone.includes(searchQuery),
    )
    : []

  const selectedPatient = mockPatients.find((p) => p.id.toString() === selectedPatientId?.toString())

  useEffect(() => {
    if (patientIdParam) {
      setSelectedPatientId(patientIdParam)
    }
  }, [patientIdParam])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
  
    if (!selectedPatientId) {
      toast({
        title: "Error",
        description: "Please select a patient first.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true)

    try {
      // Get current queue data from localStorage
      const queueData = JSON.parse(localStorage.getItem('queueData') || '{"tokens":[],"onHoldTokens":[],"completedTokens":[]}')
      
      // Generate new token number (increment highest existing number)
      const allTokens = [...queueData.tokens, ...queueData.onHoldTokens, ...queueData.completedTokens]
      const highestTokenNumber = allTokens.length > 0 
        ? Math.max(...allTokens.map(t => t.number))
        : 13 // Starting number if no tokens exist
      const newTokenNumber = highestTokenNumber + 1

      // Create new token
      const newToken = {
        id: Date.now(), // Unique ID
        number: newTokenNumber,
        patient: selectedPatient!,
        isEmergency,
        status: "waiting"
      }

      // Update queue data
      const updatedQueueData = {
        ...queueData,
        tokens: [...queueData.tokens, newToken]
      }

      // Save to localStorage
      localStorage.setItem('queueData', JSON.stringify(updatedQueueData))

      // Trigger storage event to update other tabs
      window.dispatchEvent(new Event('storage'))

      toast({
        title: "Token generated successfully",
        description: `Token #${newTokenNumber} has been assigned to ${selectedPatient?.name}.`,
      })

      router.push("/queue")
    } catch (error) {
      console.error("Error generating token:", error)
      toast({
        title: "Error generating token",
        description: "There was a problem generating the token. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <RouteGuard allowedRoles={["staff", "admin"]}>
      <div className="p-6 max-w-2xl mx-auto">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mr-4" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">Generate Token</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>New Queue Token</CardTitle>
            <CardDescription>Generate a token for a patient</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              {!selectedPatient ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Search Patient</Label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by name or phone number..."
                        className="pl-8"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>

                  {searchQuery && (
                    <div className="border rounded-md">
                      {filteredPatients.length > 0 ? (
                        <div className="divide-y">
                          {filteredPatients.map((patient) => (
                            <div
                              key={patient.id}
                              className="p-3 flex justify-between items-center hover:bg-muted cursor-pointer"
                              onClick={() => setSelectedPatientId(patient.id.toString())}
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
                          <p className="text-muted-foreground mb-4">
                            No patients found with that name or phone number.
                          </p>
                          <Button type="button" variant="outline" asChild>
                            <Link href="/patients/new">
                              <UserPlus className="mr-2 h-4 w-4" />
                              Register New Patient
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 border rounded-md bg-muted">
                    <div className="text-sm font-medium text-muted-foreground">Selected Patient</div>
                    <div className="font-medium text-lg">{selectedPatient.name}</div>
                    <div className="text-sm">{selectedPatient.phone}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="emergency"
                      checked={isEmergency}
                      onCheckedChange={(checked) => setIsEmergency(checked === true)}
                    />
                    <Label htmlFor="emergency" className="font-medium text-red-500">
                      Mark as Emergency Case
                    </Label>
                  </div>

                  <div className="pt-2">
                    <Button type="button" variant="outline" onClick={() => setSelectedPatientId("")}>
                      Change Patient
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href="/queue">Cancel</Link>
              </Button>
              <Button type="submit" disabled={!selectedPatientId || isSubmitting}>
                {isSubmitting ? "Generating..." : "Generate Token"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </RouteGuard>
  )
}