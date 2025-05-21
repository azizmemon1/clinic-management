import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/contexts/auth-context"
import "./globals.css"
import { ClientLayout } from "./client-layout"
const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Wet Baes Clinic",
  description: "Clinic Management System",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider>
            
              <ClientLayout>{children}</ClientLayout>
              <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
