import Link from 'next/link';
import Image from 'next/image';
import { ThemeToggleButton } from '@/components/theme-toggle-button';

export function AppHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <Image
            src="/images/logo.svg"
            alt="Guru App Logo"
            width={28}
            height={28}
            className="text-primary" // currentColor in SVG can pick this up if designed for it
          />
          <h1 className="text-xl font-semibold text-foreground">Guru</h1>
        </Link>
        <ThemeToggleButton />
      </div>
    </header>
  );
}
