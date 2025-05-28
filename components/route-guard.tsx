"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

type UserRole = "staff" | "doctor"

interface RouteGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function RouteGuard({ children, allowedRoles }: RouteGuardProps) {
  const { user, isAuthorized } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // If no user is logged in, redirect to login
    if (!user) {
      router.push("/login")
      return
    }

    // Check if user has permission to access this route
    if (!isAuthorized(allowedRoles)) {
      router.push("/unauthorized")
    }
  }, [user, isAuthorized, router, pathname, allowedRoles])

  // If authorized, render children
  return isAuthorized(allowedRoles) ? <>{children}</> : null
}
