
import type { Dictionary } from '@/types'; // Updated import

interface FooterProps {
  dictionary: Dictionary;
}
export function Footer({ dictionary }: FooterProps) {
  const currentYear = new Date().getFullYear();
  return (
    <footer className="border-t border-border/40 py-6 md:py-0">
      <div className="container flex flex-col items-center justify-center gap-4 md:h-20 md:flex-row">
        <p className="text-balance text-center text-sm leading-loose text-muted-foreground md:text-left">
          {dictionary.footer.copyright.replace('{year}', currentYear.toString())}
        </p>
      </div>
    </footer>
  );
}
