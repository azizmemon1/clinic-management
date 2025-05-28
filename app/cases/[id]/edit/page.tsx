"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileX, Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { RouteGuard } from "@/components/route-guard";

// Reuse the same mock data from new case page
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

interface FormDataState {
  patientId: number;
  patientName: string;
  reason: string;
  notes: string;
  selectedMedicines: number[];
  paymentStatus: string;
  amount: string;
  isEmergency: boolean;
}

// Mock array of case details
const mockCases = [
  {
    id: "101",
    patientId: 1,
    patientName: "John Smith",
    reason: "Fever and cough",
    notes: "Patient reported high fever for 2 days",
    selectedMedicines: [1, 3],
    paymentStatus: "Paid",
    amount: "75.00",
    isEmergency: false
  },
  {
    id: "102",
    patientId: 2,
    patientName: "Jane Doe",
    reason: "Dental checkup",
    notes: "Regular cleaning and examination",
    selectedMedicines: [2, 4],
    paymentStatus: "Pending",
    amount: "150.00",
    isEmergency: false
  }
];

// Mock function to fetch case details
const fetchCaseDetails = async (id: string): Promise<FormDataState | null> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 1000));

  const caseDetails = mockCases.find(c => c.id === id);

  if (!caseDetails) {
    return null;
  }

  return {
    patientId: caseDetails.patientId,
    patientName: caseDetails.patientName,
    reason: caseDetails.reason,
    notes: caseDetails.notes,
    selectedMedicines: caseDetails.selectedMedicines,
    paymentStatus: caseDetails.paymentStatus,
    amount: caseDetails.amount,
    isEmergency: caseDetails.isEmergency
  };
};

export default function EditCasePage() {
  const router = useRouter();
  const params = useParams();
  const caseId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormDataState | null>(null);

  useEffect(() => {
    const loadCaseDetails = async () => {
      try {
        const caseDetails = await fetchCaseDetails(caseId);
        setFormData(caseDetails);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to load case details",
          variant: "destructive",
        });
        router.push("/cases");
      } finally {
        setIsLoading(false);
      }
    };

    loadCaseDetails();
  }, [caseId, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => prev ? ({ ...prev, [name]: value }) : null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData) return;

    setIsSubmitting(true);

    try {
      // Simulate API call to update case
      await new Promise((resolve) => setTimeout(resolve, 1000));

      toast({
        title: "Case updated successfully",
        description: `Case details have been updated for ${formData.patientName}`,
      });

      router.push(`/cases/${caseId}`);
    } catch (error) {
      toast({
        title: "Error updating case",
        description: "There was a problem updating the case. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <RouteGuard allowedRoles={["doctor", "staff"]}>
      <div className="p-6">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Loading edit form...
        </div>
      </div>
    </RouteGuard>
    );
  }

  if (!formData) {
    return (
      <RouteGuard allowedRoles={["doctor", "staff"]}>
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <FileX className="h-6 w-6 text-muted-foreground" />
            <p className="text-lg text-muted-foreground">Case not found</p>
          </div>
          <p className="text-sm text-muted-foreground mt-2">The case you are looking for does not exist</p>
        </div>
      </div>
    </RouteGuard>
    );
  }

  return (
    <RouteGuard allowedRoles={["doctor", "staff"]}>
      <div className="p-6">
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
          <h1 className="text-3xl font-bold">Edit Case</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Edit Case Details</CardTitle>
            <CardDescription>
              Update the details for {formData.patientName}&apos;s case
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Patient Name
                  </p>
                  <p className="font-medium">{formData.patientName}</p>
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
                              setFormData(prev => {
                                if (!prev) return null;
                                const selected = prev.selectedMedicines.includes(medicine.id)
                                  ? prev.selectedMedicines.filter(id => id !== medicine.id)
                                  : [...prev.selectedMedicines, medicine.id];
                                return { ...prev, selectedMedicines: selected };
                              });
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
                            setFormData(prev => {
                              if (!prev) return null;
                              return {
                                ...prev,
                                selectedMedicines: prev.selectedMedicines.filter(m => m !== id)
                              };
                            });
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
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Cancel
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
  );
}
