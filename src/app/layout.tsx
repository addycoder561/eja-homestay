import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { Toaster } from "react-hot-toast";
import { MobileBottomNavigation } from "@/components/MobileBottomNavigation";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EJA - Travel for Everyone",
  description: "Discover amazing properties and book your next adventure with EJA. From cozy cabins to luxury villas, find the perfect accommodation for your trip.",
  keywords: ["homestay", "vacation rental", "travel", "accommodation", "booking", "properties"],
  authors: [{ name: "EJA Team" }],
  creator: "EJA",
  publisher: "EJA",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://eja-homestay.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "EJA - Travel for Everyone",
    description: "Discover amazing properties and book your next adventure with EJA. From cozy cabins to luxury villas, find the perfect accommodation for your trip.",
    url: 'https://eja-homestay.vercel.app',
    siteName: 'EJA',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'EJA - Travel for Everyone',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "EJA - Travel for Everyone",
    description: "Discover amazing properties and book your next adventure with EJA. From cozy cabins to luxury villas, find the perfect accommodation for your trip.",
    images: ['/og-image.jpg'],
    creator: '@eja_travel',
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'EJA',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#f59e0b",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
          {children}
          <MobileBottomNavigation />
          <Toaster position="top-right" />
          <PerformanceMonitor />
          <ServiceWorkerRegistration />
        </AuthProvider>
      </body>
    </html>
  );
}
