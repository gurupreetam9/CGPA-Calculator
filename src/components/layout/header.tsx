import { GraduationCap } from 'lucide-react';
import Link from 'next/link';

export function AppHeader() {
  return (
    <header className="bg-card border-b border-border shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <GraduationCap className="h-7 w-7 text-primary" />
          <h1 className="text-xl font-semibold text-foreground">Guru</h1>
        </Link>
        {/* Future navigation items can go here */}
      </div>
    </header>
  );
}
