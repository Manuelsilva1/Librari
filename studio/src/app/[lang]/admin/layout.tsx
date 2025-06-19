
import type { ReactNode } from 'react';

// This layout is for the /admin/* segment.
// It's intentionally simple to allow child layouts (like for /admin/panel)
// or child pages (like the /admin login page) to define their own specific structures.
interface AdminSegmentLayoutProps {
  children: ReactNode;
  params: any; // Temporalmente cambiado a 'any' para depuración
}

export default function AdminSegmentLayout({ children, params }: AdminSegmentLayoutProps) {
  // This layout does not apply its own visual structure like PublicLayout.
  // It passes children through, allowing the login page to use PublicLayout
  // and the /admin/panel routes to use their own specific AdminPanelLayout.
  return <>{children}</>;
}

