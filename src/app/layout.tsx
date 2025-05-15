import type { Metadata } from 'next';
import { Inter as FontSans } from 'next/font/google'; // Using Inter as a fallback, Geist is primary
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans', // Fallback variable
});

export const metadata: Metadata = {
  title: 'Guru - GPA Calculator',
  description: 'Easily calculate and track your SGPA and CGPA with Guru.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased", // font-sans will use Geist if available
          GeistSans.variable,
          GeistMono.variable,
          fontSans.variable // Keep Inter as a fallback if Geist fails or for specific needs
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
