import Link from 'next/link';
import { ThemeToggleButton } from '@/components/theme-toggle-button';

// SVG for a simple skull icon
const SkullIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-7 w-7 text-primary"
  >
    <path d="M12 2c-5.523 0-10 4.477-10 10 0 4.134 2.512 7.676 6.001 9.16V23h7.998v-1.84c3.489-1.484 6.001-5.026 6.001-9.16 0-5.523-4.477-10-10-10zm0 3c1.819 0 3.384.769 4.568 2H7.432A5.468 5.468 0 0 1 12 5zm-3.5 5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm7 0a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm-3.5 5c-2.481 0-4.5 2.019-4.5 4.5h9c0-2.481-2.019-4.5-4.5-4.5z" />
  </svg>
);

export function AppHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <SkullIcon />
          <h1 className="text-xl font-semibold text-foreground">Guru</h1>
        </Link>
        <ThemeToggleButton />
      </div>
    </header>
  );
}
