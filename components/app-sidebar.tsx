"use client"

import { Home, Users, Clock, Stethoscope, Pill, CreditCard, LogOut, Users2 } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar
} from "@/components/ui/sidebar"

export function AppSidebar() {
  const pathname = usePathname()
  const { expanded, setExpanded } = useSidebar()

  const menuItems = [
    {
      title: "Dashboard",
      icon: Home,
      href: "/",
      role: ["staff", "doctor"],
    },
    {
      title: "Patients",
      icon: Users,
      href: "/patients",
      role: ["staff", "doctor"],
    },
    {
      title: "Families",
      icon: Users2,
      href: "/families",
      role: ["staff", "doctor"],
    },
    {
      title: "Queue",
      icon: Clock,
      href: "/queue",
      role: ["staff", "doctor"],
    },
    {
      title: "Doctor",
      icon: Stethoscope,
      href: "/doctor",
      role: ["doctor"],
    },
    // {
    //   title: "Medicine",
    //   icon: Pill,
    //   href: "/medicine",
    //   role: ["staff", "doctor"],
    // },
    {
      title: "Payments",
      icon: CreditCard,
      href: "/payments",
      role: ["doctor"],
    },
  ]

  // For demo purposes, we'll use a hardcoded role
  // In a real app, this would come from authentication
  const userRole = "doctor" // Change to "staff" or "doctor" to test different roles

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter((item) => item.role.includes(userRole));

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-4">
        {expanded && (
          <div className="flex items-center gap-2 overflow-hidden">
            <Stethoscope className="h-6 w-6 text-primary flex-shrink-0" />
            <span className="font-bold text-lg whitespace-nowrap">Wet Baes Clinic</span>
          </div>
        )}
        <div className={!expanded ? "ml-1" : ""}>
          <SidebarTrigger/>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {filteredMenuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild isActive={item.href === '/'
      ? pathname === '/'
      : pathname === item.href || pathname.startsWith(`${item.href}/`)} tooltip={item.title}>
                <Link href={item.href}>
                  <item.icon className="h-6 w-6" />
                  {expanded && <span>{item.title}</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Logout">
              <Link href="/logout">
                <LogOut className="h-5 w-5" />
                {expanded && <span>Logout</span>}
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}