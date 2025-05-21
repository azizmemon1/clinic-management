"use client"

import { usePathname } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <div className="min-h-screen">
      {!isLoginPage ? (
        <div className="flex">
          <AppSidebar />
          <main className="flex-1">{children}</main>
        </div>
      ) : (
        children
      )}
    </div>
  )
}