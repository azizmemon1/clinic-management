"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, ArrowLeft, Users2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { RouteGuard } from "@/components/route-guard"

const mockFamilies = [
  {
    id: "1",
    name: "Smith Family",
    memberCount: 4,
    members: ["John Smith", "Emily Davis", "Sarah Smith", "Michael Smith"]
  },
  {
    id: "2",
    name: "Johnson Family",
    memberCount: 2,
    members: ["David Johnson", "Lisa Johnson"]
  },
  {
    id: "3",
    name: "Williams Family",
    memberCount: 3,
    members: ["Robert Williams", "Jennifer Williams", "Thomas Williams"]
  },
]

export default function FamiliesPage() {
  const router = useRouter()

  return (
    <RouteGuard allowedRoles={["doctor", "staff"]}>
      <div className="p-6 mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users2 className="h-6 w-6 text-primary" />
              Family Groups
            </h1>
          </div>
          <Button asChild>
            <Link href="/families/new" className="flex items-center">
              <Plus className="mr-2 h-4 w-4" />
              New Family
            </Link>
          </Button>
        </div>

        <div className="space-y-4">
          {mockFamilies.map((family) => (
            <div key={family.id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">{family.name}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                >
                  <Link href={`/families/${family.id}`}>
                    View
                  </Link>
                </Button>
              </div>

              <div className="text-sm text-muted-foreground mb-2">
                {family.memberCount} members
              </div>

              <div className="text-sm flex flex-wrap items-center gap-1">
                {family.members.slice(0, 3).map((member, index) => (
                  <Badge key={index} variant="secondary">
                    {member}
                  </Badge>
                ))}
                {family.memberCount > 3 && (
                  <span className="text-muted-foreground">
                    +{family.memberCount - 3} more...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </RouteGuard>
  )
}