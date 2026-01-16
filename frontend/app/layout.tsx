/**
 * Root Layout - Wraps all pages
 * ==============================
 * 
 * NEXT.JS LAYOUT CONCEPT:
 * -----------------------
 * In React, you'd create a wrapper component and use it manually:
 *     function App() {
 *         return (
 *             <Layout>
 *                 <Routes>...</Routes>
 *             </Layout>
 *         );
 *     }
 * 
 * In Next.js App Router, layout.tsx automatically wraps all pages:
 * - app/layout.tsx wraps ALL pages
 * - app/dashboard/layout.tsx wraps only /dashboard/* pages
 * 
 * The {children} prop receives the page content automatically.
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Providers from "@/components/Providers";

// Using Inter font - more similar to Amazon's clean look
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

// SEO Metadata - automatically added to all pages
export const metadata: Metadata = {
  title: {
    default: "Vamazon - Shop Electronics, Computers & More",
    template: "%s | Vamazon"
  },
  description: "Shop millions of products with fast delivery. Electronics, computers, home & kitchen, and more.",
  keywords: ["amazon", "ecommerce", "shopping", "electronics", "computers"],
  icons: {
    icon: [
      { url: "/favicon_io/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon_io/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon_io/favicon.ico",
    apple: "/favicon_io/apple-touch-icon.png",
  },
  manifest: "/favicon_io/site.webmanifest",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="light" style={{ colorScheme: 'light' }}>
      <body className={`${inter.className} min-h-screen flex flex-col bg-[#eaeded]`}>
        <Providers>
          <Header />
          <main
            className="flex-grow"
            style={{
              backgroundColor: '#eaeded',
              color: '#0f1111',
            }}
          >
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
