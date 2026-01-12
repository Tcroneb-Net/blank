'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export default function SponsorPopup() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Tampilkan popup setiap kali komponen di-mount (setiap refresh halaman)
        setIsVisible(true);
        // Kunci scroll body saat popup muncul
        document.body.style.overflow = 'hidden';
        
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, []);

    const handleClose = () => {
        setIsVisible(false);
        document.body.style.overflow = 'auto';
    };

    if (!isVisible) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fade-in">
            <div className="native-card w-full max-w-sm overflow-hidden relative animate-slide-up shadow-2xl border border-gray-700 bg-[#181820]">
                {/* Close Button */}
                <button 
                    onClick={handleClose}
                    className="absolute top-3 right-3 z-20 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors backdrop-blur-md"
                >
                    <i className="fas fa-times"></i>
                </button>

                {/* Hero Image */}
                <div className="relative h-48 w-full bg-gray-900 group">
                     <Image 
                        src="/jakysoft.jpg" 
                        alt="JakySoft Sponsor" 
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, 400px"
                        priority
                     />
                     <div className="absolute inset-0 bg-gradient-to-t from-[#181820] via-[#181820]/50 to-transparent"></div>
                     
                     <div className="absolute bottom-0 left-0 right-0 p-5">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider shadow-sm">
                                Partner
                            </span>
                        </div>
                        <h3 className="text-2xl font-bold text-white drop-shadow-md">JakySoft</h3>
                     </div>
                </div>

                {/* Content */}
                <div className="p-5 pt-2 text-center">
                    <p className="text-sm text-gray-300 mb-6 leading-relaxed">
                        Rekan seperjuangan teknologi. Kunjungi website kami atau gunakan Bot WhatsApp canggih sekarang!
                    </p>
                    
                    <div className="grid grid-cols-2 gap-3">
                        <a 
                            href="https://jakysoft.xyz" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-2 rounded-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-1 shadow-lg shadow-blue-900/20 group"
                        >
                            <i className="fas fa-globe text-lg group-hover:-translate-y-0.5 transition-transform"></i>
                            <span className="text-xs">Website</span>
                        </a>
                        <a 
                            href="https://wa.me/6283826724514" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-[#25D366] hover:bg-[#1da851] text-white font-bold py-3 px-2 rounded-xl transition-all active:scale-95 flex flex-col items-center justify-center gap-1 shadow-lg shadow-green-900/20 group"
                        >
                            <i className="fab fa-whatsapp text-lg group-hover:-translate-y-0.5 transition-transform"></i>
                            <span className="text-xs">Bot WA</span>
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}