"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"

type UserRole = "staff" | "doctor" | "admin"

interface User {
  id: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  login: (role: UserRole) => void
  logout: () => void
  isAuthorized: (allowedRoles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>({
    id: "1",
    name: "Demo User",
    role: "admin", // Default role for demo
  })

  const login = (role: UserRole) => {
    setUser({
      id: "1",
      name: "Demo User",
      role: role,
    })
    router.push("/")
  }

  const logout = () => {
    setUser(null)
    router.push("/login")
  }

  const isAuthorized = (allowedRoles: UserRole[]) => {
    return user ? allowedRoles.includes(user.role) : false
  }

  return <AuthContext.Provider value={{ user, login, logout, isAuthorized }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
