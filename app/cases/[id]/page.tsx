"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Loader2, Pencil } from "lucide-react";
import { RouteGuard } from "@/components/route-guard";

// Types
interface Medicine {
  id: number;
  name: string;
}

interface Case {
  id: number;
  patientId: number;
  patientName: string;
  patientAge: number;
  date: string;
  reason: string;
  notes: string;
  isEmergency: boolean;
  paymentStatus: "Paid" | "Pending" | "Partial";
  amount: number;
  medicines: Medicine[];
}

// Mock data - should match your new case form
const mockMedicines = [
  { id: 1, name: "Paracetamol" },
  { id: 2, name: "Ibuprofen" },
  { id: 3, name: "Amoxicillin" },
  { id: 4, name: "Cetirizine" },
  { id: 5, name: "Omeprazole" },
];

const fetchCaseById = async (id: number): Promise<Case | null> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  const cases: Case[] = [
    {
      id: 101,
      patientId: 1,
      patientName: "Rahul Sharma",
      patientAge: 38,
      date: "2023-04-15",
      reason: "Fever and persistent cough for 3 days. Reports body aches and fatigue.",
      notes: "Patient advised to rest and drink plenty of fluids. Follow up in 3 days if symptoms persist.",
      isEmergency: false,
      paymentStatus: "Paid",
      amount: 1200,
      medicines: [mockMedicines[0], mockMedicines[2]] // Paracetamol and Amoxicillin
    },
    {
      id: 102,
      patientId: 2,
      patientName: "Priya Patel",
      patientAge: 45,
      date: "2023-04-16",
      reason: "Routine dental checkup and cleaning",
      notes: "Minor plaque buildup noted. Recommended proper brushing technique.",
      isEmergency: false,
      paymentStatus: "Pending",
      amount: 800,
      medicines: []
    },
    {
      id: 103,
      patientId: 3,
      patientName: "Amit Singh",
      patientAge: 29,
      date: "2023-04-17",
      reason: "Acute chest pain and difficulty breathing",
      notes: "Suspected pleurisy. Referred to cardiologist for further evaluation.",
      isEmergency: true,
      paymentStatus: "Partial",
      amount: 2500,
      medicines: [mockMedicines[1], mockMedicines[3]] // Ibuprofen and Cetirizine
    },
  ];

  return cases.find(caseItem => caseItem.id === id) || null;
};

const Detail = ({
  label,
  value,
  badge,
  className,
}: {
  label: string;
  value: string | number | React.ReactNode;
  badge?: "default" | "destructive" | "outline" | "secondary";
  className?: string;
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      <p className="text-sm text-muted-foreground">{label}</p>
      {badge ? (
        <Badge variant={badge}>{value}</Badge>
      ) : (
        <p className="font-medium">{value}</p>
      )}
    </div>
  );
};

const getPaymentVariant = (
  status: "Paid" | "Pending" | "Partial"
): "default" | "destructive" | "outline" => {
  switch (status) {
    case "Paid":
      return "default";
    case "Partial":
      return "outline";
    case "Pending":
      return "destructive";
  }
};

export default function CaseDetailsPage() {
  const { id: caseIdParam } = useParams();
  const caseId = Number(caseIdParam);
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadCase = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCaseById(caseId);

        if (!isMounted) return;

        if (!data) {
          toast({
            title: "Case not found",
            description: `Case with ID ${caseId} could not be found. Redirecting to cases list.`,
            variant: "destructive"
          });
          router.push("/cases");
          return;
        }

        setCaseData(data);
      } catch (error) {
        toast({
          title: "Error loading case",
          description: "Please try again later",
          variant: "destructive"
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadCase();

    return () => {
      isMounted = false;
    };
  }, [caseId, router]);

  const handleEdit = () => router.push(`/cases/${caseId}/edit`);
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      toast({
        title: "Case deleted successfully",
        description: `Patient case #${caseId} has been deleted`
      });
      router.push("/cases");
    } catch (err) {
      toast({
        title: "Error deleting case",
        description: "Please try again later",
        variant: "destructive"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className="text-muted-foreground">Loading case details...</p>
        </div>
      </div>
    );
  }

  if (!caseData) return null;

  return (
    <RouteGuard allowedRoles={["doctor", "staff"]}>
      <div className="p-6">
        <Card className="flex flex-col">
          <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.back()}
                className="mr-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
              <div>
                <CardTitle className="text-3xl font-bold">
                  Case #{caseData.id}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {caseData.patientName} • {new Date(caseData.date).toDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleEdit} disabled={isDeleting}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </CardHeader>

          <Separator />

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            <div className="space-y-6">
              <Detail label="Patient Name" value={caseData.patientName} />
              <Detail label="Patient Age" value={`${caseData.patientAge} years`} />
              <Detail label="Date" value={new Date(caseData.date).toLocaleDateString()} />
              <Detail 
                label="Emergency" 
                value={caseData.isEmergency ? "Yes" : "No"} 
                badge={caseData.isEmergency ? "destructive" : "default"} 
              />
            </div>

            <div className="space-y-6">
              <Detail label="Amount" value={`₹${caseData.amount.toLocaleString()}`} />
              <Detail 
                label="Payment Status" 
                badge={getPaymentVariant(caseData.paymentStatus)} 
                value={caseData.paymentStatus} 
              />
            </div>

            <div className="md:col-span-2 space-y-6">
              <Detail 
                label="Reason for Visit" 
                value={caseData.reason} 
                className="md:col-span-2"
              />
              
              {caseData.notes && (
                <Detail 
                  label="Doctor's Notes" 
                  value={caseData.notes} 
                  className="md:col-span-2"
                />
              )}

              {caseData.medicines.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Prescribed Medicines</p>
                  <div className="flex flex-wrap gap-2">
                    {caseData.medicines.map(medicine => (
                      <Badge 
                        key={medicine.id} 
                        variant="secondary"
                        className="px-3 py-1 text-sm"
                      >
                        {medicine.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </RouteGuard>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}