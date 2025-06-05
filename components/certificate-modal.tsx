// components/certificate-modal.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { Printer } from "lucide-react";

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

export const CertificateModal = ({ 
  patientName,
  reason,
  onPrint,
  onClose 
}: {
  patientName: string;
  reason: string;
  onPrint: (certificate: string) => void;
  onClose: () => void;
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

  const handleGenerate = () => {
    const template = certificateTemplates.find(c => c.id === selectedCertificate);
    if (!template) return;

    const clinicData = {
      clinicName: "XYZ Clinic",
      clinicAddress: "123 Medical Street, Health City",
      clinicPhone: "+1 234 567 890",
      clinicEmail: "contact@xyzclinic.com",
      doctorName: "Dr. John Smith",
      doctorLicense: "MED123456",
      advertisement: "We provide 24/7 emergency services. Call us anytime for medical assistance.",
      patientName,
      reason,
      ...formData
    };

    const certificate = template.template(clinicData);
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
                    onChange={(e) => setFormData({...formData, fromDate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>To Date</Label>
                  <Input
                    type="date"
                    value={formData.toDate}
                    onChange={(e) => setFormData({...formData, toDate: e.target.value})}
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
                onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
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
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Time of Death</Label>
                  <Input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Cause of Death</Label>
                <Textarea
                  value={formData.causeOfDeath}
                  onChange={(e) => setFormData({...formData, causeOfDeath: e.target.value})}
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