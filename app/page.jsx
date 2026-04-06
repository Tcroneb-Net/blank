import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDocsSpec } from '../lib/docsService';

export const revalidate = 3600;

export const metadata = {
    title: 'Hostify - Home',
    description: 'Hostify_Tech.',
};

const Hero = () => (
    <div className="text-center mb-12 animate-fade-in pt-6">
        <div className="inline-block mb-5 relative">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 via-purple-600 to-blue-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-pink-500/30 border border-white/10">
                <i className="fas fa-bolt text-4xl text-white drop-shadow-lg"></i>
            </div>
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-400 rounded-full border-2 border-[#09090b] animate-pulse"></span>
        </div>
        <div className="mb-1">
            <span className="text-[11px] bg-accent/10 text-accent border border-accent/20 px-3 py-1 rounded-full font-bold uppercase tracking-widest">
                🚀 Free & Open REST API
            </span>
        </div>
        <h1 className="text-5xl font-extrabold text-primary mb-3 tracking-tight mt-4">
            PuruBoy <span className="gradient-text">API</span>
        </h1>
        <p className="text-secondary text-sm leading-relaxed max-w-sm mx-auto font-medium">
            Platform API modular terbaik dengan integrasi AI, Downloader, dan Anime Streaming. Gratis, cepat, dan mudah digunakan.
        </p>
        
        <div className="mt-8 flex flex-col gap-3 max-w-xs mx-auto">
            <Link href="/docs" className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-accent/30 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                <i className="fas fa-book-open text-sm"></i>
                <span>Jelajahi Dokumentasi</span>
                <i className="fas fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
            </Link>
            <Link href="/blog" className="w-full bg-card border border-default hover:bg-white/5 text-secondary font-semibold py-3.5 rounded-2xl transition-all active:scale-95 flex items-center justify-center gap-2">
                <i className="fas fa-newspaper text-sm"></i>
                <span>Lihat Updates</span>
            </Link>
        </div>
    </div>
);

const StatsCard = ({ icon, count, label, color = 'text-accent' }) => (
    <div className="native-card p-4 flex items-center gap-4 hover:border-accent/50 transition-all group cursor-default">
        <div className={`w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center ${color} group-hover:scale-110 transition-transform`}>
            <i className={`fas ${icon} text-xl`}></i>
        </div>
        <div>
            <div className="text-2xl font-extrabold text-primary">{count}</div>
            <div className="text-[10px] text-muted uppercase tracking-widest font-bold">{label}</div>
        </div>
    </div>
); 

            </div>
        </div>
    );
}
