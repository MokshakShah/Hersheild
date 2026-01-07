
"use client"

import { useEffect, useState } from "react"
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
  SidebarFooter,
} from "../components/ui/sidebar"
import { Shield, BookOpen, LayoutDashboard, Users, LogIn, LogOut, Archive, User, Zap } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import SidebarNews from "./SidebarNews"

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't show sidebar for auth pages
  if (pathname === '/login' || pathname === '/signup') {
    return <main>{children}</main>
  }

  // Show loading spinner until mounted and auth is checked
  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  // If user is not authenticated, show loading (middleware will handle redirect)
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  const handleLogout = async () => {
    await logout()
  }

  return (
    <SidebarProvider>
      <Sidebar  className="bg-sidebar">
        <SidebarHeader className="p-4">
          <div className="flex items-center gap-3">
            <img src="sounds/logo.png" alt="Logo" className="h-7 w-7 object-contain" />
            <div className="flex flex-col">
              <h2 className="text-lg font-semibold">Hersheild</h2>
              <p className="text-xs text-muted-foreground">Your safety companion</p>
            </div>
          </div>
          
          {/* User Info Section */}
          {user && (
            <div className="mt-4 p-3  rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-foreground">
                  Welcome, {user.name}! 👋
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Mobile No. {user.phoneNumber}
              </div>
            </div>
          )}
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/"}>
                <Link href="/">
                  <LayoutDashboard />
                  Dashboard
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/evidence"}>
                <Link href="/evidence">
                  <Archive />
                  Evidence
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/safety-tips"}>
                <Link href="/safety-tips">
                  <BookOpen />
                  Safety Tips
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
                        {/* News Sidebar Link */}
                        <SidebarMenuItem>
                          <SidebarNews />
                        </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/self-defense"}>
                <Link href="/self-defense">
                  <Zap />
                  Self-Defense Tutorials
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/nearby-help"}>
                <Link href="/nearby-help">
                  <Shield />
                  Nearby Help
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>

            <SidebarMenuItem>
              <SidebarMenuButton asChild isActive={pathname === "/profile"}>
                <Link href="/profile">
                  <User />
                  Profile
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
          
        </SidebarContent>
        <SidebarFooter>
            <SidebarMenu>
                <SidebarMenuItem>
                    <SidebarMenuButton onClick={handleLogout}>
                        <LogOut />
                        Sign Out
                    </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6 sm:py-4">
          <SidebarTrigger className="md:hidden"/>
          <div className="flex items-center justify-between w-full">
            <h1 className="text-xl font-semibold capitalize">
              {pathname === '/' ? 'Dashboard' : pathname.substring(1).replace('-', ' ')}
            </h1>
            <img src="sounds/logo.png" alt="Logo" className="h-8 w-8 object-contain ml-2" />
          </div>
          {/* <div className="text-sm text-muted-foreground">
            Welcome, {user.name}
          </div> */}
        </header>
        <main className="flex-1 p-4 sm:px-6 sm:py-0">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
