'use client';

import React from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Footer() {
    const pathname = usePathname();

    // Sembunyikan footer di halaman Docs dan Chat
    if (pathname.startsWith('/docs') || pathname === '/chat') {
        return null;
    }

    return (
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
    );
}