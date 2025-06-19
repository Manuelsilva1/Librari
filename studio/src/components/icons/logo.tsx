import type { SVGProps } from 'react';

export function CorreoLibroLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 100 100"
      fill="currentColor"
      aria-label="Librería 33 Logo"
      {...props}
    >
      <path d="M20 10 H80 V20 H20z" />
      <path d="M20 80 H80 V90 H20z" />
      <path d="M25 15 H35 V85 H25z" />
      <path d="M40 20 Q50 10 60 20 V80 Q50 90 40 80z" />
      <path d="M65 15 H75 V85 H65z" />
      <text x="50" y="55" fontFamily="Roboto, sans-serif" fontSize="12" textAnchor="middle" fill="hsl(var(--background))" className="font-headline">L33</text>
    </svg>
  );
}
