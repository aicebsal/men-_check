import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'Menú Check - Organización Familiar con frescura y orden',
  description: 'Planificador de menús semanales de comida, listas de compra y asistente culinario interactivo local.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${plusJakartaSans.variable}`}>
      <body className="font-sans antialiased bg-[#f0f2f5] text-[#1c1e21]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
