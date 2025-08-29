"use client"

import { useEffect, useRef, useState, ReactNode } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard,
  BookCopy,
  Users,
  Home,
  Store,
  Receipt,
  Building2,
  Tags,
  BarChart3,
  FileSpreadsheet,
  LogOut,
  Settings,
  Menu as MenuIcon,
  ChevronLeft,
  Search
} from "lucide-react"

import type { Dictionary } from "@/types"
import { ThemeToggle } from "@/components/theme-toggle"
import { LanguageSwitcher } from "@/components/language-switcher"
import { AuthUserMenu } from "@/components/auth-user-menu"

interface ClientLayoutProps {
  children: ReactNode
  lang: string
  dictionary: Dictionary
  footerText: string
}

interface NavItem {
  key: string
  label: string
  icon: any
  href: string
  badge?: number
}

export function AdminPanelClientLayout({ children, lang, dictionary, footerText }: ClientLayoutProps) {
  const sidebarTexts = dictionary.adminPanel?.sidebar || {
    dashboard: "Dashboard",
    manageBooks: "Manage Books",
    manageUsers: "Manage Users",
    pointOfSale: "Point of Sale",
    sales: "Sales",
    manageEditorials: "Manage Publishers",
    manageCategories: "Manage Categories",
    statistics: "Statistics",
    reports: "Reports",
    orders: "Orders"
  }

  const NAV: NavItem[] = [
    { key: "dashboard", label: sidebarTexts.dashboard, icon: LayoutDashboard, href: `/${lang}/admin/panel` },
    { key: "books", label: sidebarTexts.manageBooks, icon: BookCopy, href: `/${lang}/admin/panel/books` },
    { key: "categories", label: sidebarTexts.manageCategories, icon: Tags, href: `/${lang}/admin/panel/categories` },
    { key: "editorials", label: sidebarTexts.manageEditorials, icon: Building2, href: `/${lang}/admin/panel/editorials` },
    { key: "pos", label: sidebarTexts.pointOfSale, icon: Store, href: `/${lang}/admin/panel/pos` },
    { key: "orders", label: sidebarTexts.orders, icon: Receipt, href: `/${lang}/admin/panel/orders` },
    { key: "sales", label: sidebarTexts.sales, icon: Receipt, href: `/${lang}/admin/panel/sales` },
    { key: "stats", label: sidebarTexts.statistics, icon: BarChart3, href: `/${lang}/admin/panel/stats` },
    { key: "reports", label: sidebarTexts.reports, icon: FileSpreadsheet, href: `/${lang}/admin/panel/reports` },
    { key: "customers", label: sidebarTexts.manageUsers, icon: Users, href: `/${lang}/admin/panel/customers` },
  ]

  const pathname = usePathname()
  const [active, setActive] = useState<string>(NAV.find(n => n.href === pathname)?.key ?? "dashboard")
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const firstLinkRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false)
    }
    if (mobileOpen) {
      document.addEventListener("keydown", onKey)
      setTimeout(() => firstLinkRef.current?.focus(), 50)
    }
    return () => document.removeEventListener("keydown", onKey)
  }, [mobileOpen])

  return (
    <div className="flex h-screen bg-[radial-gradient(60%_80%_at_20%_20%,#f0f4ff_0%,#eef2ff_30%,#f8fafc_100%)]">
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 80 : 288 }}
        transition={{ type: "spring", stiffness: 200, damping: 24 }}
        className="hidden md:flex relative flex-col border-r bg-white/70 backdrop-blur-xl shadow-sm"
      >
        <div className="flex items-center justify-between h-16 px-3">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 shadow-sm" />
            {!collapsed && (
              <div className="leading-tight">
                <div className="font-semibold">{dictionary.siteName}</div>
                <div className="text-xs text-gray-500">Admin</div>
              </div>
            )}
          </div>
          <button
            aria-label="Colapsar menú"
            onClick={() => setCollapsed(s => !s)}
            className="grid place-items-center h-9 w-9 rounded-xl hover:bg-gray-100 text-gray-600"
          >
            <motion.span animate={{ rotate: collapsed ? 180 : 0 }}>
              <ChevronLeft className="h-5 w-5" />
            </motion.span>
          </button>
        </div>
        <div className="px-3 pb-2">
          <div className={`flex items-center gap-2 ${collapsed ? "px-0" : "px-2"} h-10 rounded-xl border bg-white/80 focus-within:ring-2 ring-indigo-500 transition`}>
            <Search className="h-4 w-4 ml-3 text-gray-400" />
            {!collapsed && (
              <input
                aria-label="Buscar"
                placeholder="Buscar…"
                className="flex-1 bg-transparent outline-none text-sm placeholder:text-gray-400"
              />
            )}
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto px-2 py-2">
          {NAV.map(({ key, label, icon: Icon, href }, idx) => {
            const isActive = active === key
            return (
              <Link
                key={key}
                ref={idx === 0 ? firstLinkRef : undefined}
                href={href}
                onClick={() => setActive(key)}
                className={`group relative w-full flex items-center ${collapsed ? "justify-center" : "justify-start"} gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 ring-indigo-500 ${isActive ? "text-indigo-600" : "text-gray-600 hover:text-indigo-600"}`}
              >
                <span className={`absolute left-0 top-1/2 -translate-y-1/2 h-8 rounded-r-full bg-gradient-to-b from-indigo-500 to-blue-500 transition-all ${isActive ? (collapsed ? "w-1" : "w-1.5") : "w-0"}`} />
                <span className={`grid place-items-center h-8 w-8 rounded-lg ${isActive ? "bg-indigo-50" : "group-hover:bg-indigo-50"}`}>
                  <Icon className="h-5 w-5" />
                </span>
                {!collapsed && <span className="truncate flex-1 text-left">{label}</span>}
              </Link>
            )
          })}
        </nav>
        <div className="mt-auto p-3 border-t bg-white/60">
          <button className={`w-full flex items-center ${collapsed ? "justify-center" : "justify-between"} gap-3 rounded-xl px-3 py-2 text-sm text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 transition`}>
            <div className="flex items-center gap-3">
              <span className="grid place-items-center h-8 w-8 rounded-lg bg-gray-100">
                <Settings className="h-5 w-5" />
              </span>
              {!collapsed && <span>Configuración</span>}
            </div>
            {!collapsed && <LogOut className="h-4 w-4 opacity-60" />}
          </button>
        </div>
      </motion.aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 px-4 flex items-center justify-between bg-white/80 backdrop-blur-xl border-b sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button
              className="md:hidden grid place-items-center h-10 w-10 rounded-xl border hover:bg-gray-50"
              onClick={() => setMobileOpen(true)}
              aria-label="Abrir menú"
            >
              <MenuIcon className="h-5 w-5" />
            </button>
            <div className="font-semibold tracking-wide">Admin</div>
          </div>
          <div className="hidden md:flex items-center gap-3">
            <Link href={`/${lang}/`} className="text-sm text-gray-600 hover:text-indigo-600">
              <Home className="h-4 w-4" />
            </Link>
            <ThemeToggle />
            <LanguageSwitcher dictionary={dictionary} />
            <AuthUserMenu lang={lang} dictionary={dictionary} />
          </div>
        </header>
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
        <footer className="border-t py-6 text-center text-sm text-muted-foreground bg-background">
          {footerText}
        </footer>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Menú"
              className="fixed top-0 left-0 h-full w-[85%] max-w-xs z-50"
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: "spring", stiffness: 280, damping: 30 }}
            >
              <div className="h-full w-full bg-white/80 backdrop-blur-xl border-r shadow-xl flex flex-col">
                <div className="h-16 px-4 flex items-center justify-between border-b">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500" />
                    <div className="font-semibold">{dictionary.siteName}</div>
                  </div>
                  <button
                    className="grid place-items-center h-10 w-10 rounded-xl hover:bg-gray-100"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Cerrar menú"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                </div>
                <nav className="p-2">
                  {NAV.map(({ key, label, icon: Icon, href }, idx) => {
                    const isActive = active === key
                    return (
                      <Link
                        key={key}
                        ref={idx === 0 ? firstLinkRef : undefined}
                        href={href}
                        onClick={() => {
                          setActive(key)
                          setMobileOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 ring-indigo-500 ${isActive ? "text-indigo-600 bg-indigo-50" : "text-gray-700 hover:bg-gray-50"}`}
                      >
                        <span className="grid place-items-center h-8 w-8 rounded-lg bg-gray-100">
                          <Icon className="h-5 w-5" />
                        </span>
                        <span className="flex-1 text-left">{label}</span>
                      </Link>
                    )
                  })}
                </nav>
                <div className="mt-auto p-3 border-t">
                  <button className="w-full flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center h-8 w-8 rounded-lg bg-gray-100">
                        <Settings className="h-5 w-5" />
                      </span>
                      <span>Configuración</span>
                    </div>
                    <LogOut className="h-4 w-4 opacity-60" />
                  </button>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminPanelClientLayout

