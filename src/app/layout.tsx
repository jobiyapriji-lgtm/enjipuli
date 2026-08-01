import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/components/Providers';

/*
 * Page <title> and meta use the exact Malayalam strings as required.
 * The `<html lang="en">` stays because most UI is English;
 * individual elements with Malayalam text carry lang="ml" locally.
 */
export const metadata: Metadata = {
  title: {
    template: '%s | ഇഞ്ചിപ്പുളി',
    default:  'ഇഞ്ചിപ്പുളി — ക്യാമ്പ്സ്ന്റെ ഹോട്ട്സ്പോട്ട്',
  },
  description:
    'Order food online from your campus food truck — Enjipuli. Skip the queue, pay online, pick up fast.',
  openGraph: {
    title: 'ഇഞ്ചിപ്പുളി — Campus Food Truck',
    description: 'ക്യാമ്പ്സ്ന്റെ ഹോട്ട്സ്പോട്ട് | Online campus food ordering',
    locale: 'en_IN',
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
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
