import React from "react";
import "./globals.css";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export const metadata = {
  metadataBase: new URL("https://hostify.indevs.in"),
  title: {
    default: "Hostify",
    template: "%s | Hostify",
  },
  description: "Hostify - Official platform for API, AI tools, and developer services.",
  keywords: ["Hostify", "API", "AI", "Developer Tools", "Hostify Platform"],
  authors: [{ name: "Hostify" }],
  creator: "Hostify",
  openGraph: {
    title: "Hostify",
    description: "Official Hostify platform",
    url: "https://hostify.indevs.in",
    siteName: "Hostify",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Hostify",
    description: "Official Hostify platform",
  },
  robots: {
    index: false,
    follow: false,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-white text-black antialiased">
        <main className="min-h-screen flex items-center justify-center">
          {children}
        </main>
      </body>
    </html>
  );
}
