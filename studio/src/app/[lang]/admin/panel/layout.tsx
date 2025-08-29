import type { ReactNode } from "react"
import { getDictionary } from "@/lib/dictionaries"
import type { Dictionary } from "@/types"
import AdminPanelClientLayout from "./client-layout"

interface AdminPanelLayoutProps {
  children: ReactNode
  params: { lang: string }
}

export default async function AdminPanelLayout({ children, params: { lang } }: AdminPanelLayoutProps) {
  const dictionary: Dictionary = await getDictionary(lang)
  const currentYear = new Date().getFullYear()
  const footerText = `${dictionary.adminPanel?.footer?.text || "Admin Panel"} – ${dictionary.footer?.copyright.replace('{year}', currentYear.toString())}`

  return (
    <AdminPanelClientLayout lang={lang} dictionary={dictionary} footerText={footerText}>
      {children}
    </AdminPanelClientLayout>
  )
}
