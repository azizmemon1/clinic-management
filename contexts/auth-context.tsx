"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"

// Mock users for authentication
const MOCK_USERS = [
  { username: "doctor", password: "doctor123", role: "doctor", id: "1", name: "Doctor Demo" },
  { username: "staff", password: "staff123", role: "staff", id: "2", name: "Staff Demo" }
] as const;

type UserRole = "staff" | "doctor"

interface User {
  id: string
  name: string
  role: UserRole
  username: string
}

interface AuthContextType {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  logout: () => void
  isAuthorized: (allowedRoles: UserRole[]) => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    // Check localStorage for existing session
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    } else if (pathname !== "/login") {
      router.push("/login")
    }
  }, [pathname, router])

  const login = async (username: string, password: string) => {
    // Mock authentication
    const matchedUser = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    )

    if (!matchedUser) {
      throw new Error("Invalid credentials")
    }

    const userData: User = {
      id: matchedUser.id,
      name: matchedUser.name,
      role: matchedUser.role,
      username: matchedUser.username
    }

    setUser(userData)
    localStorage.setItem("user", JSON.stringify(userData))
    router.push("/")
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem("user")
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
