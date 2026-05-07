import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PantawidAral',
  description: 'Foresight for the families who can\'t afford to be invisible.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
