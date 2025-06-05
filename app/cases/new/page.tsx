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
import { ArrowLeft, AlertTriangle, Save, Check, ChevronsUpDown, Printer, Plus, Trash2, Pencil } from "lucide-react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { format } from "date-fns";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";

const patients = [
  { id: 1, name: "John Smith", age: 38, phone: "555-123-4567", dob: "1985-06-15", note: "Patient has allergy to penicillin. Please be cautious when prescribing medication." },
  { id: 2, name: "Jane Doe", age: 45, phone: "555-234-5678", dob: "1978-03-22", note: "" },
  { id: 3, name: "Bob Johnson", age: 29, phone: "555-345-6789", dob: "1994-11-05", note: "Patient has history of high blood pressure." },
];

const initialMedicines = [
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

const initialReasons = [
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

const mockQueueData = {
  waitingTokens: [
    { id: 4, number: 17, patient: { id: 4, name: "Emily Davis" }, isEmergency: true, status: 'waiting' },
    { id: 2, number: 15, patient: { id: 2, name: "Sarah Johnson" }, isEmergency: false, status: 'waiting' },
  ]
};

interface PrescriptionItem {
  id: string;
  medicine: string;
  dosage: string;
  timing: {
    morning: boolean;
    afternoon: boolean;
    evening: boolean;
    night: boolean;
    beforeFood: boolean;
    afterFood: boolean;
  };
}

interface FormDataState {
  patientId: number | null;
  reason: string;
  notes: string;
  selectedMedicines: number[];
  paymentStatus: string;
  amount: string;
  amountReceived: string;
  isEmergency: boolean;
}

const CertificateModal = ({
  patientName,
  reason,
  onPrint,
  onClose,
  clinicConfig
}: {
  patientName: string;
  reason: string;
  onPrint: (certificate: string) => void;
  onClose: () => void;
  clinicConfig: {
    name: string;
    address: string;
    phone: string;
    email: string;
    doctorName: string;
    doctorLicense: string;
    advertisement: string;
  };
}) => {
  const [selectedCertificate, setSelectedCertificate] = useState("");
  const [formData, setFormData] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    fromDate: format(new Date(), 'yyyy-MM-dd'),
    toDate: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    validUntil: format(new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    time: format(new Date(), 'HH:mm'),
    causeOfDeath: ""
  });

  const certificateTemplates = [
    {
      id: "medical",
      name: "Medical Certificate",
      template: (data: any) => `
        <div class="letterhead">
          <h1>${data.clinicName}</h1>
          <p>${data.clinicAddress}</p>
          <p>Phone: ${data.clinicPhone} | Email: ${data.clinicEmail}</p>
        </div>
        
        <div class="certificate-content">
          <h2>MEDICAL CERTIFICATE</h2>
          <p>This is to certify that ${data.patientName} was examined by me on ${data.date} and was found to be suffering from ${data.reason}.</p>
          <p>The patient is advised rest from ${data.fromDate} to ${data.toDate}.</p>
          <p>This certificate is issued at the request of the patient.</p>
          
          <div class="signature">
            <p>Dr. ${data.doctorName}</p>
            <p>License No: ${data.doctorLicense}</p>
          </div>
        </div>
        
        <div class="footer">
          <p class="advertisement">${data.advertisement}</p>
        </div>
      `
    },
    {
      id: "fitness",
      name: "Fitness Certificate",
      template: (data: any) => `
        <div class="letterhead">
          <h1>${data.clinicName}</h1>
          <p>${data.clinicAddress}</p>
          <p>Phone: ${data.clinicPhone} | Email: ${data.clinicEmail}</p>
        </div>
        
        <div class="certificate-content">
          <h2>FITNESS CERTIFICATE</h2>
          <p>This is to certify that I have examined ${data.patientName} on ${data.date} and found them physically fit.</p>
          <p>This fitness certificate is valid until ${data.validUntil}.</p>
          
          <div class="signature">
            <p>Dr. ${data.doctorName}</p>
            <p>License No: ${data.doctorLicense}</p>
          </div>
        </div>
        
        <div class="footer">
          <p class="advertisement">${data.advertisement}</p>
        </div>
      `
    },
    {
      id: "death",
      name: "Death Certificate",
      template: (data: any) => `
        <div class="letterhead">
          <h1>${data.clinicName}</h1>
          <p>${data.clinicAddress}</p>
          <p>Phone: ${data.clinicPhone} | Email: ${data.clinicEmail}</p>
        </div>
        
        <div class="certificate-content">
          <h2>DEATH CERTIFICATE</h2>
          <p>This is to certify that ${data.patientName} was under my treatment from ${data.fromDate} to ${data.toDate}.</p>
          <p>The patient expired on ${data.date} at ${data.time} due to ${data.causeOfDeath}.</p>
          
          <div class="signature">
            <p>Dr. ${data.doctorName}</p>
            <p>License No: ${data.doctorLicense}</p>
          </div>
        </div>
        
        <div class="footer">
          <p class="advertisement">${data.advertisement}</p>
        </div>
      `
    }
  ];

  const handleGenerate = () => {
    const template = certificateTemplates.find(c => c.id === selectedCertificate);
    if (!template) return;

    const certificate = template.template({
      ...clinicConfig,
      patientName,
      reason,
      ...formData
    });
    onPrint(certificate);
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Certificate</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Certificate Type</Label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              value={selectedCertificate}
              onChange={(e) => setSelectedCertificate(e.target.value)}
            >
              <option value="">Select a certificate</option>
              {certificateTemplates.map((cert) => (
                <option key={cert.id} value={cert.id}>{cert.name}</option>
              ))}
            </select>
          </div>

          {selectedCertificate === "medical" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>From Date</Label>
                  <Input
                    type="date"
                    value={formData.fromDate}
                    onChange={(e) => setFormData({ ...formData, fromDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({ ...formData, toDate: e.target.value })}
                  />
                </div>
              </div>
            </>
          )}

          {selectedCertificate === "fitness" && (
            <div className="space-y-2">
              <Label>Valid Until</Label>
              <Input
                type="date"
                value={formData.validUntil}
                onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
              />
            </div>
          )}

          {selectedCertificate === "death" && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Date of Death</Label>
                  <Input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time of Death</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cause of Death</Label>
                <Textarea
                  value={formData.causeOfDeath}
                  onChange={(e) => setFormData({ ...formData, causeOfDeath: e.target.value })}
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={!selectedCertificate}
          >
            <Printer className="mr-2 h-4 w-4" />
            Generate & Print
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default function NewCasePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const patientIdFromQuery = searchParams.get('patientId');

  const [selectedPatient, setSelectedPatient] = useState<typeof patients[0] | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEmergencyAlert, setShowEmergencyAlert] = useState(false);
  const [medicines, setMedicines] = useState(initialMedicines);
  const [reasons, setReasons] = useState(initialReasons);
  const [formData, setFormData] = useState<FormDataState>({
    patientId: null,
    reason: "",
    notes: "",
    selectedMedicines: [],
    paymentStatus: "",
    amount: "",
    amountReceived: "",
    isEmergency: false
  });
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [outsidePrescriptions, setOutsidePrescriptions] = useState<PrescriptionItem[]>([]);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [newPrescription, setNewPrescription] = useState<PrescriptionItem>({
    id: Math.random().toString(36).substring(2, 9),
    medicine: "",
    dosage: "",
    timing: {
      morning: false,
      afternoon: false,
      evening: false,
      night: false,
      beforeFood: false,
      afterFood: false
    }
  });
  const [editingMedicineId, setEditingMedicineId] = useState<number | null>(null);
  const [editingReason, setEditingReason] = useState<string | null>(null);
  const [newMedicineName, setNewMedicineName] = useState("");
  const [newReasonName, setNewReasonName] = useState("");

  const clinicConfig = {
    name: "XYZ Clinic",
    address: "123 Medical Street, Health City",
    phone: "+1 234 567 890",
    email: "contact@xyzclinic.com",
    doctorName: "Dr. John Smith",
    doctorLicense: "MED123456",
    advertisement: "We provide 24/7 emergency services. Call us anytime for medical assistance."
  };

  useEffect(() => {
    if (patientIdFromQuery) {
      const patient = patients.find(p => p.id === Number(patientIdFromQuery));
      if (patient) {
        setSelectedPatient(patient);
        setFormData(prev => ({ ...prev, patientId: patient.id }));
      }
    }
  }, [patientIdFromQuery]);

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

  const handlePrintCertificate = (certificateHtml: string) => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Certificate</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2cm; }
            .letterhead { text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #000; padding-bottom: 1rem; }
            .certificate-content { margin: 2rem 0; }
            .signature { margin-top: 3rem; text-align: right; }
            .footer { margin-top: 3rem; font-size: 0.8rem; text-align: center; color: #666; }
            @page { size: A4; margin: 2cm; }
          </style>
        </head>
        <body>
          ${certificateHtml}
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            };
          </script>
        </body>
      </html>
    `);
    printWindow?.document.close();
  };

  const handleAddPrescription = () => {
    setOutsidePrescriptions([...outsidePrescriptions, newPrescription]);
    setNewPrescription({
      id: Math.random().toString(36).substring(2, 9),
      medicine: "",
      dosage: "",
      timing: {
        morning: false,
        afternoon: false,
        evening: false,
        night: false,
        beforeFood: false,
        afterFood: false
      }
    });
    setShowPrescriptionModal(false);
  };

  const handleRemovePrescription = (id: string) => {
    setOutsidePrescriptions(outsidePrescriptions.filter(p => p.id !== id));
  };

  const handlePrintPrescription = () => {
    const printWindow = window.open('', '_blank');
    printWindow?.document.write(`
      <html>
        <head>
          <title>Prescription</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; margin: 2cm; }
            .letterhead { text-align: center; margin-bottom: 2rem; border-bottom: 2px solid #000; padding-bottom: 1rem; }
            .prescription-content { margin: 2rem 0; }
            table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f5f5f5; }
            .signature { margin-top: 3rem; text-align: right; }
            .footer { margin-top: 3rem; font-size: 0.8rem; text-align: center; color: #666; }
            @page { size: A4; margin: 2cm; }
          </style>
        </head>
        <body>
          <div class="letterhead">
            <h1>${clinicConfig.name}</h1>
            <p>${clinicConfig.address}</p>
            <p>Phone: ${clinicConfig.phone} | Email: ${clinicConfig.email}</p>
          </div>
          
          <div class="prescription-content">
            <h2>PRESCRIPTION</h2>
            <p>Patient: ${selectedPatient?.name}</p>
            <p>Date: ${new Date().toLocaleDateString()}</p>
            
            <table>
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Timing</th>
                </tr>
              </thead>
              <tbody>
                ${outsidePrescriptions.map(p => `
                  <tr>
                    <td>${p.medicine}</td>
                    <td>${p.dosage}</td>
                    <td>
                      ${p.timing.morning ? 'Morning ' : ''}
                      ${p.timing.afternoon ? 'Afternoon ' : ''}
                      ${p.timing.evening ? 'Evening ' : ''}
                      ${p.timing.night ? 'Night ' : ''}
                      ${p.timing.beforeFood ? 'Before Food' : ''}
                      ${p.timing.afterFood ? 'After Food' : ''}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            
            <div class="signature">
              <p>${clinicConfig.doctorName}</p>
              <p>License No: ${clinicConfig.doctorLicense}</p>
            </div>
          </div>
          
          <div class="footer">
            <p class="advertisement">${clinicConfig.advertisement}</p>
          </div>
          
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            };
          </script>
        </body>
      </html>
    `);
    printWindow?.document.close();
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

  const handleAddMedicine = () => {
    if (newMedicineName.trim()) {
      const newMedicine = {
        id: Math.max(...medicines.map(m => m.id)) + 1,
        name: newMedicineName.trim()
      };
      setMedicines([...medicines, newMedicine]);
      setNewMedicineName("");
    }
  };

  const handleEditMedicine = (id: number) => {
    const medicine = medicines.find(m => m.id === id);
    if (medicine) {
      setNewMedicineName(medicine.name);
      setEditingMedicineId(id);
    }
  };

  const handleSaveEditedMedicine = () => {
    if (editingMedicineId && newMedicineName.trim()) {
      setMedicines(medicines.map(m =>
        m.id === editingMedicineId ? { ...m, name: newMedicineName.trim() } : m
      ));
      setEditingMedicineId(null);
      setNewMedicineName("");
    }
  };

  const handleDeleteMedicine = (id: number) => {
    if (!formData.selectedMedicines.includes(id)) {
      setMedicines(medicines.filter(m => m.id !== id));
    }
  };

  const handleEditReason = (reason: string) => {
    setNewReasonName(reason);
    setEditingReason(reason);
  };

  const handleSaveEditedReason = () => {
    if (editingReason && newReasonName.trim()) {
      setReasons(reasons.map(r =>
        r === editingReason ? newReasonName.trim() : r
      ));
      if (formData.reason === editingReason) {
        setFormData(prev => ({ ...prev, reason: newReasonName.trim() }));
      }
      setEditingReason(null);
      setNewReasonName("");
    }
  };

  const handleDeleteReason = (reason: string) => {
    if (formData.reason !== reason) {
      setReasons(reasons.filter(r => r !== reason));
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
                <div className="flex gap-2">
                  <Combobox
                    options={reasons.map(reason => ({ value: reason, label: reason }))}
                    value={formData.reason}
                    onChange={handleReasonSelect}
                    createable
                    placeholder="Select or enter a reason"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingReason("")}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {editingReason !== null && (
                <Dialog open onOpenChange={() => setEditingReason(null)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingReason ? "Edit Reason" : "Add New Reason"}
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={newReasonName}
                        onChange={(e) => setNewReasonName(e.target.value)}
                        placeholder="Enter reason"
                      />
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setEditingReason(null)}>
                        Cancel
                      </Button>
                      <Button
                        onClick={editingReason ? handleSaveEditedReason : () => {
                          if (newReasonName.trim()) {
                            setReasons([...reasons, newReasonName.trim()]);
                            setEditingReason(null);
                            setNewReasonName("");
                          }
                        }}
                      >
                        {editingReason ? "Save" : "Add"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}

              <div className="space-y-4">
                <Label>Emergency Case</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="emergency"
                    checked={formData.isEmergency}
                    onCheckedChange={(checked) => setFormData({
                      ...formData,
                      isEmergency: !!checked
                    })}
                  />
                  <Label htmlFor="emergency">Mark as emergency case</Label>
                </div>
              </div>

              <div className="space-y-4">
                <Label>Prescription</Label>
                <div className="flex gap-2">
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
                        <CommandInput
                          placeholder="Search medicines..."
                          onValueChange={setNewMedicineName}
                        />
                        <CommandEmpty>
                          No medicines found. Press Enter to add "{newMedicineName}" as new medicine.
                        </CommandEmpty>
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
                              className="flex justify-between items-center"
                            >
                              <div className="flex items-center">
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    formData.selectedMedicines.includes(medicine.id)
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {medicine.name}
                              </div>
                              <div className="flex gap-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditMedicine(medicine.id);
                                  }}
                                  className="text-primary hover:bg-primary/10 p-1 rounded"
                                >
                                  <Pencil className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteMedicine(medicine.id);
                                  }}
                                  className="text-destructive hover:bg-destructive/10 p-1 rounded"
                                  disabled={formData.selectedMedicines.includes(medicine.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setNewMedicineName("");
                      setEditingMedicineId(0);
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>

                {editingMedicineId !== null && (
                  <Dialog open onOpenChange={() => setEditingMedicineId(null)}>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>
                          {editingMedicineId ? "Edit Medicine" : "Add New Medicine"}
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <Input
                          value={newMedicineName}
                          onChange={(e) => setNewMedicineName(e.target.value)}
                          placeholder="Enter medicine name"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingMedicineId(null)}>
                          Cancel
                        </Button>
                        <Button
                          onClick={editingMedicineId ? handleSaveEditedMedicine : handleAddMedicine}
                          disabled={!newMedicineName.trim()}
                        >
                          {editingMedicineId ? "Save" : "Add"}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}

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

              {outsidePrescriptions.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Outside Prescriptions</Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePrintPrescription}
                    >
                      <Printer className="mr-2 h-4 w-4" />
                      Print
                    </Button>
                  </div>
                  <div className="border rounded-lg">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="p-3 text-left text-sm font-medium">Medicine</th>
                          <th className="p-3 text-left text-sm font-medium">Dosage</th>
                          <th className="p-3 text-left text-sm font-medium">Timing</th>
                          <th className="p-3 text-left text-sm font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {outsidePrescriptions.map((prescription) => (
                          <tr key={prescription.id} className="border-b">
                            <td className="p-3">{prescription.medicine}</td>
                            <td className="p-3">{prescription.dosage}</td>
                            <td className="p-3">
                              <div className="flex flex-wrap gap-1">
                                {prescription.timing.morning && <Badge variant="outline">Morning</Badge>}
                                {prescription.timing.afternoon && <Badge variant="outline">Afternoon</Badge>}
                                {prescription.timing.evening && <Badge variant="outline">Evening</Badge>}
                                {prescription.timing.night && <Badge variant="outline">Night</Badge>}
                                {prescription.timing.beforeFood && <Badge variant="outline">Before Food</Badge>}
                                {prescription.timing.afterFood && <Badge variant="outline">After Food</Badge>}
                              </div>
                            </td>
                            <td className="p-3">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemovePrescription(prescription.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

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
                      <SelectItem value="Pending">Pending</SelectItem>
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
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowCertificateModal(true)}
                  disabled={!selectedPatient}
                >
                  <Printer className="mr-2 h-4 w-4" />
                  Generate Certificate
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowPrescriptionModal(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Outside Prescription
                </Button>
              </div>
              <div className="flex gap-2">
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
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>

      {showCertificateModal && selectedPatient && (
        <CertificateModal
          patientName={selectedPatient.name}
          reason={formData.reason}
          onPrint={handlePrintCertificate}
          onClose={() => setShowCertificateModal(false)}
          clinicConfig={clinicConfig}
        />
      )}

      {showPrescriptionModal && (
        <Dialog open onOpenChange={() => setShowPrescriptionModal(false)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Outside Prescription</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Medicine Name</Label>
                <Input
                  value={newPrescription.medicine}
                  onChange={(e) => setNewPrescription({ ...newPrescription, medicine: e.target.value })}
                  placeholder="Enter medicine name"
                />
              </div>

              <div className="space-y-2">
                <Label>Dosage</Label>
                <Input
                  value={newPrescription.dosage}
                  onChange={(e) => setNewPrescription({ ...newPrescription, dosage: e.target.value })}
                  placeholder="Enter dosage instructions"
                />
              </div>

              <div className="space-y-2">
                <Label>Timing</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="morning"
                      checked={newPrescription.timing.morning}
                      onCheckedChange={(checked) => setNewPrescription({
                        ...newPrescription,
                        timing: { ...newPrescription.timing, morning: !!checked }
                      })}
                    />
                    <Label htmlFor="morning">Morning</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="afternoon"
                      checked={newPrescription.timing.afternoon}
                      onCheckedChange={(checked) => setNewPrescription({
                        ...newPrescription,
                        timing: { ...newPrescription.timing, afternoon: !!checked }
                      })}
                    />
                    <Label htmlFor="afternoon">Afternoon</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="evening"
                      checked={newPrescription.timing.evening}
                      onCheckedChange={(checked) => setNewPrescription({
                        ...newPrescription,
                        timing: { ...newPrescription.timing, evening: !!checked }
                      })}
                    />
                    <Label htmlFor="evening">Evening</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="night"
                      checked={newPrescription.timing.night}
                      onCheckedChange={(checked) => setNewPrescription({
                        ...newPrescription,
                        timing: { ...newPrescription.timing, night: !!checked }
                      })}
                    />
                    <Label htmlFor="night">Night</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="beforeFood"
                      checked={newPrescription.timing.beforeFood}
                      onCheckedChange={(checked) => setNewPrescription({
                        ...newPrescription,
                        timing: { ...newPrescription.timing, beforeFood: !!checked }
                      })}
                    />
                    <Label htmlFor="beforeFood">Before Food</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="afterFood"
                      checked={newPrescription.timing.afterFood}
                      onCheckedChange={(checked) => setNewPrescription({
                        ...newPrescription,
                        timing: { ...newPrescription.timing, afterFood: !!checked }
                      })}
                    />
                    <Label htmlFor="afterFood">After Food</Label>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPrescriptionModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleAddPrescription}
                disabled={!newPrescription.medicine || !newPrescription.dosage}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Prescription
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </RouteGuard>
  );
}