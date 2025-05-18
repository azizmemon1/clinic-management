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
import { Loader2 } from "lucide-react";

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
}

const fetchCaseById = async (id: number): Promise<Case | null> => {
  const all = await fetchCases();
  return all.find((item) => item.id === id) || null;
};


const Detail = ({
  label,
  value,
  badge,
}: {
  label: string;
  value: string;
  badge?: "default" | "destructive" | "outline" | "secondary";
}) => {
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

const getPaymentVariant = (
  status: "Paid" | "Pending" | "Partial"
): | "destructive" | "outline" | "default" => {
  switch (status) {
    case "Paid":
      return "default";
    case "Partial":
      return "outline";
    case "Pending":
      return "destructive";
  }
}

export default function CaseDetailsPage() {
  const { id: caseIdParam } = useParams();
  const caseId = Number(caseIdParam);
  const router = useRouter();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    let isMounted = true;  // Flag to track if component is mounted

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
          setIsLoading(false);  // Set loading to false whether successful or not
        }
      }
    };

    loadCase();

    return () => {
      isMounted = false;  // Set flag to false when unmounting
    };
  }, [caseId, router]);

  const handleEdit = () => router.push(`/cases/${caseId}/edit`);
  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await new Promise((resolve) => setTimeout(resolve, 500));
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
          <Button onClick={handleEdit} disabled={isDeleting}>Edit</Button>
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