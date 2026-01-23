import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getDocsSpec } from '../lib/docsService';

export const revalidate = 3600;

export const metadata = {
    title: 'PuruBoy API - Home',
    description: 'Beranda PuruBoy API. Temukan berbagai REST API gratis untuk kebutuhan proyek aplikasi Anda.',
};

const Hero = () => (
    <div className="text-center mb-10 animate-fade-in">
        <div className="inline-block mb-4">
             <div className="w-16 h-16 bg-gradient-to-br from-accent to-purple-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-accent/20">
                <i className="fas fa-bolt text-3xl text-white"></i>
             </div>
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2 tracking-tight">PuruBoy <span className="gradient-text">API</span></h1>
        <p className="text-secondary text-sm leading-relaxed max-w-xs mx-auto">
            Platform API modular terbaik dengan integrasi AI, Downloader, dan Anime Streaming.
        </p>
        
        <div className="mt-8 flex flex-col gap-3 max-w-xs mx-auto">
            <Link href="/docs" className="w-full bg-accent hover:bg-accent-hover text-white font-bold py-3 rounded-xl shadow-lg shadow-accent/25 transition-all active:scale-95 flex items-center justify-center gap-2">
                <span>Mulai Sekarang</span>
                <i className="fas fa-arrow-right text-sm"></i>
            </Link>
            <Link href="/blog" className="w-full bg-card border border-default hover:bg-border-color text-secondary font-semibold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center">
                Lihat Updates
            </Link>
        </div>
    </div>
);

const StatsCard = ({ icon, count, label }) => (
    <div className="native-card p-4 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <i className={`fas ${icon}`}></i>
        </div>
        <div>
            <div className="text-lg font-bold text-primary">{count}</div>
            <div className="text-xs text-muted uppercase tracking-wider">{label}</div>
        </div>
    </div>
);

const FeatureItem = ({ icon, title, desc }) => (
    <div className="flex gap-4 p-4 native-card">
        <div className="flex-shrink-0 mt-1">
             <i className={`fas ${icon} text-accent text-xl`}></i>
        </div>
        <div>
            <h3 className="font-semibold text-primary text-sm mb-1">{title}</h3>
            <p className="text-xs text-secondary leading-relaxed">{desc}</p>
        </div>
    </div>
);

async function getContributors() {
    try {
        // Fetch top 15 contributors
        const res = await fetch('https://api.github.com/repos/purujawa06-bot/Na-api/contributors?per_page=15', {
            next: { revalidate: 3600 }
        });
        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        console.error("Failed to fetch contributors", e);
        return [];
    }
}

export default async function HomePage() {
    let stats = { endpoints: 0, categories: 0 };
    
    try {
        const data = await getDocsSpec();
        const totalEndpoints = Object.values(data).reduce((sum, arr) => sum + arr.length, 0);
        const totalCategories = Object.keys(data).length;
        stats = { endpoints: totalEndpoints, categories: totalCategories };
    } catch (e) {
        console.error("Failed to fetch stats for SSG", e);
    }

    const contributors = await getContributors();

    return (
        <div className="pb-4">
            <Hero />
            
            <div className="grid grid-cols-2 gap-3 mb-8">
                <StatsCard icon="fa-code-branch" count={stats.endpoints} label="Endpoints" />
                <StatsCard icon="fa-folder" count={stats.categories} label="Categories" />
            </div>

            {/* Contributors Section - Horizontal Scroll */}
            {contributors && contributors.length > 0 && (
                <div className="mb-8 animate-fade-in">
                    <div className="flex justify-between items-center mb-4 px-1">
                        <h2 className="text-lg font-bold text-primary flex items-center gap-2">
                            <i className="fas fa-crown text-yellow-500"></i> Top Contributors
                        </h2>
                        <a 
                            href="https://github.com/purujawa06-bot/Na-api" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-xs text-accent hover:underline flex items-center gap-1 font-semibold"
                        >
                            Contribute <i className="fas fa-arrow-right"></i>
                        </a>
                    </div>
                    
                    <div className="relative -mx-4 px-4">
                        <div className="flex gap-3 overflow-x-auto pb-4 snap-x hide-scrollbar">
                            {contributors.map((contributor) => (
                                <a 
                                    key={contributor.id}
                                    href={contributor.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="native-card min-w-[110px] w-[110px] p-4 flex flex-col items-center gap-2 snap-start border border-gray-800 hover:border-accent transition-colors group bg-[#181820]"
                                >
                                    <div className="relative w-12 h-12 rounded-full p-0.5 bg-gradient-to-tr from-accent to-purple-600 shadow-lg shadow-purple-900/20 group-hover:scale-110 transition-transform duration-300">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-black">
                                            <Image
                                                src={contributor.avatar_url}
                                                alt={contributor.login}
                                                width={48}
                                                height={48}
                                                className="object-cover"
                                            />
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-secondary truncate w-full text-center group-hover:text-white transition-colors">
                                        {contributor.login}
                                    </span>
                                    <span className="text-[9px] bg-accent/10 text-accent px-2 py-0.5 rounded-full font-mono">
                                        {contributor.contributions} C
                                    </span>
                                </a>
                            ))}
                            
                            {/* Join Card */}
                            <a 
                                href="https://github.com/purujawa06-bot/Na-api"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="native-card min-w-[110px] w-[110px] p-4 flex flex-col items-center justify-center gap-2 snap-start border border-dashed border-gray-700 hover:border-accent hover:bg-accent/5 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-accent transition-colors">
                                    <i className="fas fa-plus text-xl"></i>
                                </div>
                                <span className="text-[10px] font-bold text-gray-500 group-hover:text-accent text-center">
                                    Join Us
                                </span>
                            </a>
                        </div>
                    </div>
                </div>
            )}

            <div className="native-card p-5 border-l-4 border-accent mb-8">
                <h3 className="font-bold text-primary text-sm mb-3">Official Domains</h3>
                <div className="space-y-2">
                    <a href="https://www.puruboy.kozow.com" target="_blank" rel="noopener noreferrer" className="block bg-input hover:bg-black/40 p-3 rounded-lg border border-default transition-all group">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-accent truncate">www.puruboy.kozow.com</span>
                            <span className="text-[10px] bg-green-900/30 text-green-400 px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ml-2">Stabil</span>
                        </div>
                    </a>
                    <a href="https://puruboy-api.vercel.app" target="_blank" rel="noopener noreferrer" className="block bg-input hover:bg-black/40 p-3 rounded-lg border border-default transition-all group">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-accent truncate">puruboy-api.vercel.app</span>
                            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-1.5 py-0.5 rounded uppercase font-bold shrink-0 ml-2">Dynamic DNS</span>
                        </div>
                    </a>
                </div>
            </div>

            <h2 className="text-lg font-bold text-primary mb-4 px-1">Fitur Utama</h2>
            <div className="space-y-3">
                <FeatureItem icon="fa-bolt" title="High Performance" desc="Infrastruktur server yang dioptimalkan untuk respons cepat dan stabil." />
                <FeatureItem icon="fa-mobile-alt" title="Mobile Friendly" desc="Dokumentasi yang didesain nyaman untuk layar kecil." />
                <FeatureItem icon="fa-flask" title="API Tester" desc="Coba endpoint langsung dari browser tanpa aplikasi tambahan." />
            </div>
        </div>
    );
}