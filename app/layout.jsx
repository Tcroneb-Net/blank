import React from 'react';
import Script from 'next/script';
import Image from 'next/image';
import './globals.css';
import BottomNav from '../components/BottomNav';
import NextNProgress from '../components/NextNProgress';
import SponsorPopup from '../components/SponsorPopup';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  interactiveWidget: 'resizes-content', // Membantu mencegah layout shift saat keyboard muncul
};

export const metadata = {
  metadataBase: new URL('https://puruboy-api.vercel.app'),
  title: {
    default: 'PuruBoy API - Platform API Modular & Tools AI Gratis',
    template: '%s | PuruBoy API'
  },
  description: 'PuruBoy API menyediakan layanan REST API gratis untuk developer. Fitur mencakup AI Chat, Text to Image, Downloader (TikTok, YouTube, IG), Anime Streaming, dan Tools bermanfaat lainnya. Cepat, stabil, dan mudah diintegrasikan.',
  keywords: ['PuruBoy API', 'REST API Gratis', 'API AI Indonesia', 'TikTok Downloader API', 'YouTube API', 'Anime API', 'Web Tools', 'Developer Resources'],
  authors: [{ name: 'PuruBoy' }],
  creator: 'PuruBoy',
  openGraph: {
    title: 'PuruBoy API - Solusi API Modular & Cepat',
    description: 'Akses ratusan endpoint API gratis untuk AI, Downloader, dan Anime. Dokumentasi lengkap dan respons cepat.',
    url: 'https://puruboy-api.vercel.app',
    siteName: 'PuruBoy API',
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PuruBoy API - Platform API & Tools AI',
    description: 'Platform API gratis dengan fitur AI, Downloader, dan Anime.',
    creator: '@puruboy',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.jpg',
    apple: '/favicon.jpg',
  },
  verification: {
    google: 'google41f3f05fef8cd977',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body className="antialiased pb-24">
        <Script 
          src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js" 
          strategy="afterInteractive" 
        />
        
        <NextNProgress />
        <SponsorPopup />
        
        <div className="background-animation"></div>
        
        {/* Menggunakan min-h-dvh untuk stabilitas viewport pada mobile */}
        <div className="container mx-auto px-4 max-w-md md:max-w-3xl min-h-dvh relative z-10 pt-6">
            <main className="relative z-20">{children}</main>
            
            {/* Added padding bottom (pb-28) to ensure footer is not covered by bottom nav */}
            <footer className="mt-12 border-t border-default pt-8 pb-28">
                {/* Banner Iklan JakySoft */}
                <div className="native-card p-6 mb-8 relative overflow-hidden group border border-blue-900/50">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/30 to-purple-900/30 opacity-60 transition-opacity"></div>
                    
                    <div className="relative z-10 flex flex-col sm:flex-row items-center gap-5 text-center sm:text-left">
                        
                        <div className="w-16 h-16 rounded-2xl relative overflow-hidden bg-gray-800 shrink-0 shadow-lg shadow-blue-500/20 rotate-3 group-hover:rotate-0 transition-transform duration-300">
                             <Image 
                                src="/jakysoft.jpg" 
                                alt="JakySoft Logo" 
                                fill
                                className="object-cover"
                                sizes="64px"
                             />
                        </div>
                        
                        <div className="flex-1">
                            <h3 className="text-lg font-bold text-white mb-1 flex items-center justify-center sm:justify-start gap-2">
                                Supported by JakySoft
                                <i className="fas fa-check-circle text-blue-400 text-xs"></i>
                            </h3>
                            <p className="text-sm text-gray-400 mb-4 leading-relaxed">
                                Solusi digital terpercaya & Bot WhatsApp canggih untuk kebutuhan Anda.
                            </p>
                            
                            <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                                <a 
                                    href="https://jakysoft.xyz" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-900/20"
                                >
                                    <i className="fas fa-globe"></i> Kunjungi Website
                                </a>
                                <a 
                                    href="https://wa.me/6283826724514" 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="bg-[#25D366] hover:bg-[#1da851] text-white text-xs font-bold px-4 py-2.5 rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-green-900/20"
                                >
                                    <i className="fab fa-whatsapp"></i> Chat Bot WA
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="text-center">
                    <p className="text-muted text-xs">PuruBoy API &copy; {new Date().getFullYear()} - Developed with ❤️</p>
                </div>
            </footer>
        </div>
        <BottomNav />
      </body>
    </html>
  );
}