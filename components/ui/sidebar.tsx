"use client"

import * as React from "react"
import { cva } from "class-variance-authority"
import { X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Slot } from "@radix-ui/react-slot"

const SidebarContext = React.createContext<{
  expanded: boolean
  setExpanded: React.Dispatch<React.SetStateAction<boolean>>
}>({
  expanded: true,
  setExpanded: () => undefined,
})

export function SidebarProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [expanded, setExpanded] = React.useState(true)

  return <SidebarContext.Provider value={{ expanded, setExpanded }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

const sidebarVariants = cva("relative h-screen border-r bg-background transition-all duration-300 ease-in-out", {
  variants: {
    expanded: {
      true: "w-64",
      false: "w-16",
    },
  },
  defaultVariants: {
    expanded: true,
  },
})

export function Sidebar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { expanded } = useSidebar()

  return (
    <div className={cn(sidebarVariants({ expanded }), className)} {...props}>
      {children}
    </div>
  )
}

export function SidebarHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("", className)} {...props} />
}

export function SidebarContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex-1 overflow-auto", className)} {...props} />
}

export function SidebarFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mt-auto", className)} {...props} />
}

export function SidebarTrigger() {
  const { expanded, setExpanded } = useSidebar()

  return (
    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setExpanded(!expanded)}>
      <X className={cn("h-4 w-4 transition-transform", expanded ? "" : "rotate-45")} />
      <span className="sr-only">Toggle sidebar</span>
    </Button>
  )
}

export function SidebarMenu({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("px-3 py-2", className)} {...props} />
}

export function SidebarMenuItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("mb-1", className)} {...props} />
}

interface SidebarMenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isActive?: boolean
  tooltip?: string
  asChild?: boolean
}
export function SidebarMenuButton({
  className,
  children,
  isActive = false,
  tooltip,
  asChild = false,
  ...props
}: SidebarMenuButtonProps) {
  const { expanded } = useSidebar(); // Get expanded state from context

  // Determine the component to render. Use Slot if asChild is true, otherwise 'button'.
  // Slot handles merging props onto the child element automatically.
  const Comp = asChild ? Slot : "button";

  const buttonClasses = cn(
    "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
    isActive
      ? "bg-accent text-accent-foreground" // Active styles
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground", // Inactive + hover styles
    !expanded && "justify-center px-0", // Collapsed styles
    className // Allow external classes
  );

  // Define the core button/slot content
  const innerContent = (
    <Comp className={buttonClasses} {...props}>
      {children}
    </Comp>
  );

  // If collapsed and a tooltip is provided, wrap with Tooltip components
  if (!expanded && tooltip) {
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          {/* TooltipTrigger needs asChild so it doesn't render its own button */}
          <TooltipTrigger asChild>{innerContent}</TooltipTrigger>
          <TooltipContent side="right" className="flex items-center gap-4">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Otherwise, return the button/slot content directly
  return innerContent;
}
