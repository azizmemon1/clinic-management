"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, AlertTriangle, Save, Check, ChevronsUpDown } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { RouteGuard } from "@/components/route-guard";
import { Combobox } from "@/components/ui/combobox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

// Mock data
const patients = [
  { id: 1, name: "John Smith", age: 38, phone: "555-123-4567", dob: "1985-06-15", note: "Patient has allergy to penicillin. Please be cautious when prescribing medication." },
  { id: 2, name: "Jane Doe", age: 45, phone: "555-234-5678", dob: "1978-03-22", note: "" },
  { id: 3, name: "Bob Johnson", age: 29, phone: "555-345-6789", dob: "1994-11-05", note: "Patient has history of high blood pressure." },
];

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
];

// Mock queue data for emergency alert
const mockQueueData = {
  waitingTokens: [
    { id: 4, number: 17, patient: { id: 4, name: "Emily Davis" }, isEmergency: true, status: 'waiting' },
    { id: 2, number: 15, patient: { id: 2, name: "Sarah Johnson" }, isEmergency: false, status: 'waiting' },
  ]
};

// Mock previous reasons
const previousReasons = [
  "Headache",
  "Fever",
  "Cough",
  "Stomach pain",
  "Back pain",
  "Dental checkup",
  "Skin rash",
  "Allergy",
  "Cold",
  "Sore throat"
];

interface FormDataState {
  patientId: number | null;
  reason: string;
  notes: string;
  selectedMedicines: number[];
  paymentStatus: string;
  amount: string;
  amountReceived: string;
}

export default function NewCasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get('patientId');

  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [reasons, setReasons] = useState<string[]>(previousReasons);
  const [formData, setFormData] = useState<FormDataState>({
    patientId: null,
    reason: "",
    notes: "",
    selectedMedicines: [],
    paymentStatus: "",
    amount: "",
    amountReceived: "",
  });

  useEffect(() => {
    if (patientIdFromQuery) {
      const patient = patients.find(p => p.id === Number(patientIdFromQuery));
      if (patient) {
        setSelectedPatient(patient);
        setFormData(prev => ({ ...prev, patientId: patient.id }));
      }
    }
  }, [patientIdFromQuery]);

  // Simulate emergency case alert
  useEffect(() => {
    const hasEmergency = mockQueueData.waitingTokens.some(t => t.isEmergency);
    if (hasEmergency) {
      setShowEmergencyAlert(true);
      const timer = setTimeout(() => setShowEmergencyAlert(false), 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleReasonSelect = (value: string) => {
    setFormData(prev => ({ ...prev, reason: value }));
    
    // Add to suggestions if it's a new reason
    if (value && !reasons.includes(value)) {
      setReasons(prev => [...prev, value]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => {
      const updatedData = { ...prev, [name]: value };
      
      if (name === "paymentStatus") {
        if (value !== "Custom") {
          updatedData.amountReceived = "";
        } else {
          updatedData.amountReceived = updatedData.amount || "";
        }
      }
      
      return updatedData;
    });
  };

  const handlePatientSelect = (patientId: string) => {
    const patient = patients.find(p => p.id === Number(patientId));
    setSelectedPatient(patient || null);
    setFormData(prev => ({
      ...prev,
      patientId: Number(patientId)
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.patientId) {
      toast({
        title: "Error",
        description: "Please select a patient.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.reason) {
      toast({
        title: "Error",
        description: "Please enter a reason for the visit.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.paymentStatus) {
      toast({
        title: "Error",
        description: "Please select a payment status.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Case added successfully",
        description: `New case has been added for ${selectedPatient?.name}.`,
      });

      router.push(`/patients/${selectedPatient?.id}`);
    } catch (error) {
      toast({
        title: "Error adding case",
        description: "There was a problem adding the case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <RouteGuard allowedRoles={["doctor", "staff"]}>
      <div className="p-6">
        {showEmergencyAlert && (
          <div className="bg-red-500 text-white p-4 rounded-md flex items-center animate-pulse mb-6">
            <AlertTriangle className="mr-2 h-5 w-5" />
            <span>Emergency case detected in the queue! Please attend immediately.</span>
          </div>
        )}

        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
            className="mr-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-3xl font-bold">New Case</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Add New Case</CardTitle>
            <CardDescription>
              Record details of the current consultation
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {!patientIdFromQuery && (
                <div className="space-y-2">
                  <Label htmlFor="patientSelect">Select Patient</Label>
                  <Select
                    name="patientSelect"
                    value={formData.patientId?.toString()}
                    onValueChange={handlePatientSelect}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a patient" />
                    </SelectTrigger>
                    <SelectContent>
                      {patients.map((patient) => (
                        <SelectItem key={patient.id} value={patient.id.toString()}>
                          {patient.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {selectedPatient && (
                <>
                  {selectedPatient.note && (
                    <div className="p-4 bg-red-100 text-red-800 rounded-md animate-pulse">
                      <div className="font-bold mb-1">Important Note:</div>
                      <div>{selectedPatient.note}</div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        Patient Name
                      </p>
                      <p className="font-medium">{selectedPatient.name}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Age</p>
                      <p>{selectedPatient.age} years</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Phone</p>
                      <p>{selectedPatient.phone}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Date of Birth</p>
                      <p>{selectedPatient.dob}</p>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Visit</Label>
                <Combobox
                  options={reasons.map(reason => ({ value: reason, label: reason }))}
                  value={formData.reason}
                  onChange={handleReasonSelect}
                  createable
                  placeholder="Select or enter a reason"
                />
              </div>

              <div className="space-y-4">
                <Label>Prescription</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      role="combobox"
                      className="w-full justify-between"
                    >
                      {formData.selectedMedicines.length > 0
                        ? `${formData.selectedMedicines.length} medicines selected`
                        : "Select medicines..."}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[400px] p-0">
                    <Command>
                      <CommandInput placeholder="Search medicines..." />
                      <CommandEmpty>No medicines found.</CommandEmpty>
                      <CommandGroup className="max-h-[300px] overflow-y-auto">
                        {medicines.map((medicine) => (
                          <CommandItem
                            key={medicine.id}
                            value={medicine.id.toString()}
                            onSelect={() => {
                              setFormData(prev => ({
                                ...prev,
                                selectedMedicines: prev.selectedMedicines.includes(medicine.id)
                                  ? prev.selectedMedicines.filter(id => id !== medicine.id)
                                  : [...prev.selectedMedicines, medicine.id]
                              }));
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                formData.selectedMedicines.includes(medicine.id)
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {medicine.name}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </Command>
                  </PopoverContent>
                </Popover>

                <div className="flex flex-wrap gap-2">
                  {formData.selectedMedicines.map((id) => {
                    const medicine = medicines.find(m => m.id === id);
                    if (!medicine) return null;
                    return (
                      <Badge
                        key={id}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        {medicine.name}
                        <button
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              selectedMedicines: prev.selectedMedicines.filter(m => m !== id)
                            }));
                          }}
                          className="ml-1 hover:text-destructive"
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
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
                    onValueChange={(value) =>
                      handleSelectChange("paymentStatus", value)
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select payment status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Paid">Paid</SelectItem>
                      <SelectItem value="Custom">Custom</SelectItem>
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

              {formData.paymentStatus === "Custom" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amountReceived">Amount Received</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5">$</span>
                      <Input
                        id="amountReceived"
                        name="amountReceived"
                        type="number"
                        placeholder="0.00"
                        className="pl-7"
                        value={formData.amountReceived}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    {formData.amount && (
                      <p className="text-sm text-muted-foreground">
                        Balance: ${(parseFloat(formData.amount) - parseFloat(formData.amountReceived || "0")).toFixed(2)}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => router.back()}>
                Cancel
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
    </RouteGuard>
  );
}