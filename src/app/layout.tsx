import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Terroir — Wine to Recipe Pairing',
  description:
    'From bottle to table — AI-powered recipes shaped by your wine.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning className="antialiased">{children}</body>
    </html>
  );
}
