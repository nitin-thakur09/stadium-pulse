import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'StadiumPulse — FIFA World Cup 2026 AI Assistant',
  description:
    'Your intelligent, multilingual wayfinding and accessibility guide for the FIFA World Cup 2026. Navigate gates, sections, restrooms, food stalls, and more — in real time.',
  keywords: ['FIFA World Cup 2026', 'stadium navigation', 'accessibility', 'AI assistant', 'wayfinding'],
  openGraph: {
    title: 'StadiumPulse — FIFA World Cup 2026 AI Assistant',
    description: 'Navigate your World Cup experience with AI-powered multilingual wayfinding.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
