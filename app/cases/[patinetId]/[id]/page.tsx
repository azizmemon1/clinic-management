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

// Type
interface Case {
  id: number;
  patientName: string;
  date: string;
  reason: string;
  isEmergency: boolean;
  paymentStatus: "Paid" | "Pending" | "Partial";
  amount: number;
}

// Mock API
const fetchCases = async (): Promise<Case[]> => {
  await new Promise((resolve) => setTimeout(resolve, 500));
  return [
    {
      id: 101,
      patientName: "Rahul Sharma",
      date: "2023-04-15",
      reason: "Fever and cough",
      isEmergency: false,
      paymentStatus: "Paid",
      amount: 75,
    },
    {
      id: 102,
      patientName: "Priya Patel",
      date: "2023-04-16",
      reason: "Dental checkup",
      isEmergency: false,
      paymentStatus: "Pending",
      amount: 200,
    },
    {
      id: 103,
      patientName: "Amit Singh",
      date: "2023-04-17",
      reason: "Chest pain",
      isEmergency: true,
      paymentStatus: "Partial",
      amount: 350,
    },
  ];
};

const fetchCaseById = async (id: number): Promise<Case | null> => {
  const all = await fetchCases();
  return all.find((item) => item.id === id) || null;
};

export default function CaseDetailsPage() {
  const { id: caseIdParam } = useParams();
  const caseId = Number(caseIdParam);
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);

  useEffect(() => {
    (async () => {
      const data = await fetchCaseById(caseId);
      if (!data) {
        toast({ title: "Case not found", variant: "destructive" });
        router.push("/cases");
      } else {
        setCaseData(data);
      }
    })();
  }, [caseId]);

  const handleEdit = () => router.push(`/cases/${caseId}/edit`);
  const handleDelete = () => {
    toast({ title: "Case deleted" });
    router.push("/cases");
  };

  if (!caseData) return null;

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <CardTitle className="text-xl font-semibold">
            Case #{caseData.id}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {caseData.patientName} • {new Date(caseData.date).toDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleEdit}>Edit</Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardHeader>

      <Separator />

      <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 p-6">
        <Detail label="Patient Name" value={caseData.patientName} />
        <Detail label="Date" value={new Date(caseData.date).toLocaleDateString()} />
        <Detail label="Reason" value={caseData.reason} />
        <Detail label="Emergency" value={caseData.isEmergency ? "Yes" : "No"} badge={caseData.isEmergency ? "destructive" : "default"} />
        <Detail label="Amount" value={`₹${caseData.amount}`} />
        <Detail label="Payment Status" badge={getPaymentVariant(caseData.paymentStatus)} value={caseData.paymentStatus} />
      </CardContent>
    </Card>
  );
}

function Detail({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: "default" | "destructive" | "outline" | "secondary";
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      {badge ? (
        <Badge variant={badge}>{value}</Badge>
      ) : (
        <p className="font-medium">{value}</p>
      )}
    </div>
  );
}

function getPaymentVariant(
  status: "Paid" | "Pending" | "Partial"
): | "destructive" | "outline" | "default" {
  switch (status) {
    case "Paid":
      return "default";
    case "Partial":
      return "outline";
    case "Pending":
      return "destructive";
  }
}
