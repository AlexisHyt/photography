import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Background } from "@/app/_components/Background";
import { ServiceWorkerRegister } from "@/app/_components/service-worker-register";
import { SubscribeButton } from "@/app/_components/subscribe-button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Alexis Hayat Photography",
    template: "%s — Alexis Hayat Photography",
  },
  description:
    "A photography portfolio with elegant category pages, full-screen lightbox viewing, and curated collections.",
  applicationName: "Alexis Hayat Photography",
  // The icon files live in public/, not under the app/ metadata convention, so
  // the link tags are declared here instead of being generated from filenames.
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48", type: "image/x-icon" },
      { url: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "A. Hayat",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Background />
        <div className="relative z-10">{children}</div>
        <SubscribeButton />
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}
