import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, Users, Stethoscope, CreditCard } from "lucide-react"
import Link from "next/link"

export default function Dashboard() {
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Today:</span>
          <span className="font-medium">{new Date().toLocaleDateString()}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">+12 new today</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Today's Queue</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">3 emergency cases</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Consultations</CardTitle>
            <Stethoscope className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">6 pending</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Revenue Today</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$1,450</div>
            <p className="text-xs text-muted-foreground">$350 pending</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks for clinic staff</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button asChild className="h-20 flex flex-col items-center justify-center">
              <Link href="/patients/new">
                <Users className="h-6 w-6 mb-1" />
                <span>New Patient</span>
              </Link>
            </Button>
            <Button asChild className="h-20 flex flex-col items-center justify-center">
              <Link href="/queue/new">
                <Clock className="h-6 w-6 mb-1" />
                <span>Generate Token</span>
              </Link>
            </Button>
            <Button asChild className="h-20 flex flex-col items-center justify-center">
              <Link href="/queue/display">
                <Clock className="h-6 w-6 mb-1" />
                <span>Queue Display</span>
              </Link>
            </Button>
            <Button asChild className="h-20 flex flex-col items-center justify-center">
              <Link href="/doctor">
                <Stethoscope className="h-6 w-6 mb-1" />
                <span>Doctor's View</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Current Queue Status</CardTitle>
            <CardDescription>Now serving token #14</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div>
                <div className="font-medium">Token #14</div>
                <div className="text-sm text-muted-foreground">John Smith</div>
              </div>
              <div className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Current</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div>
                <div className="font-medium">Token #15</div>
                <div className="text-sm text-muted-foreground">Sarah Johnson</div>
              </div>
              <div className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Next</div>
            </div>

            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <div>
                <div className="font-medium">Token #16</div>
                <div className="text-sm text-muted-foreground">Michael Brown</div>
              </div>
              <div className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Waiting</div>
            </div>

            <div className="flex justify-center mt-2">
              <Button variant="outline" asChild>
                <Link href="/queue">View Full Queue</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
