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
  title: "EJA Homestay - Find Your Perfect Stay",
  description: "Discover amazing properties and book your next adventure with EJA Homestay. From cozy cabins to luxury villas, find the perfect accommodation for your trip.",
  manifest: "/manifest.json",
  themeColor: "#f59e0b",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "EJA Homestay",
  },
  formatDetection: {
    telephone: false,
  },
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
