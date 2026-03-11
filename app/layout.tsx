import type {Metadata} from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Agentic Panic | Live Agent Intelligence',
  description: 'Real-time trust events across the Virtuals ACP ecosystem on Base.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body suppressHydrationWarning className="bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#D4A373] selection:text-white">
        {children}
      </body>
    </html>
  );
}
