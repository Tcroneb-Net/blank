'use client';

import React, { useState, useEffect, useMemo, useDeferredValue, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Virtuoso } from 'react-virtuoso';
import EndpointCard from './EndpointCard';

// Helper: Buat slug unik untuk setiap endpoint
const getSlug = (ep) => `${ep.method.toLowerCase()}-${ep.path.replace(/^\//, '').replace(/\//g, '-')}`;

export default function DocsClient({ apiSpec }) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const targetSlug = searchParams.get('endpoint'); 

    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const deferredQuery = useDeferredValue(searchQuery); 
    const [baseUrl, setBaseUrl] = useState('');
    const [isTocOpen, setIsTocOpen] = useState(false);
    const [isHeaderExpanded, setIsHeaderExpanded] = useState(true);

    const virtuosoRef = useRef(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin);
        }
    }, []);

    // --- LOGIC CALCULATIONS (Must be before any conditional returns to satisfy Rule of Hooks) ---

    // Cari data endpoint spesifik jika ada targetSlug
    const targetEndpoint = useMemo(() => {
        if (!targetSlug || !apiSpec) return null;
        
        for (const category in apiSpec) {
            const found = apiSpec[category].find(ep => getSlug(ep) === targetSlug);
            if (found) return { ...found, category }; // Return endpoint + category info
        }
        return null;
    }, [targetSlug, apiSpec]);

    const categories = useMemo(() => apiSpec ? Object.keys(apiSpec).sort() : [], [apiSpec]);

    const flatList = useMemo(() => {
        if (!apiSpec) return [];

        const list = [];
        const queryLower = deferredQuery.toLowerCase();

        const entries = activeCategory === 'all' 
            ? Object.entries(apiSpec) 
            : [[activeCategory, apiSpec[activeCategory]]];

        entries.forEach(([category, endpoints]) => {
            const filteredEndpoints = endpoints.filter(ep => 
                !deferredQuery || 
                ep.path.toLowerCase().includes(queryLower) || 
                (ep.summary && ep.summary.toLowerCase().includes(queryLower)) ||
                getSlug(ep).includes(queryLower)
            );

            if (filteredEndpoints.length > 0) {
                list.push({
                    type: 'header',
                    category: category,
                    count: filteredEndpoints.length
                });

                filteredEndpoints.forEach(ep => {
                    list.push({
                        type: 'card',
                        endpoint: ep,
                        slug: getSlug(ep)
                    });
                });
            }
        });

        return list;
    }, [apiSpec, activeCategory, deferredQuery]);

    const renderItem = (index, item) => {
        if (item.type === 'header') {
            return (
                <div className="pt-8 pb-4 bg-main" id={`cat-${item.category}`}>
                    <div className="flex items-center gap-3 px-1">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-default flex items-center justify-center shadow-lg">
                            <span className="text-lg font-bold text-accent">{item.category.charAt(0).toUpperCase()}</span>
                        </div>
                        <h3 className="text-xl font-bold text-primary tracking-tight">
                            {item.category.toUpperCase()}
                        </h3>
                        <span className="ml-auto text-xs font-mono text-muted bg-input px-2 py-1 rounded-lg border border-default">
                            {item.count} endpoints
                        </span>
                    </div>
                </div>
            );
        }
        
        if (item.type === 'card') {
            return (
                <div className="pb-1">
                    <EndpointCard 
                        endpoint={item.endpoint} 
                        baseUrl={baseUrl} 
                        slug={item.slug}
                        isInitialOpen={false} 
                    />
                </div>
            );
        }

        return null;
    };

    // --- CONDITIONAL RENDERING ---

    // Jika masuk mode Detail (Full Screen)
    if (targetEndpoint) {
        return (
            <div className="fixed inset-0 z-[100] bg-main flex flex-col h-dvh supports-[height:100dvh]:h-[100dvh] overflow-y-auto animate-slide-in-right">
                {/* Full Screen Header */}
                <div className="sticky top-0 z-50 bg-card/90 backdrop-blur-xl border-b border-default px-4 h-16 flex items-center gap-4 shadow-sm shrink-0">
                    <button 
                        onClick={() => router.push('/docs')}
                        className="w-10 h-10 rounded-full flex items-center justify-center bg-input text-muted hover:text-white hover:bg-gray-800 transition-colors"
                    >
                        <i className="fas fa-arrow-left"></i>
                    </button>
                    <div className="flex flex-col overflow-hidden">
                        <h2 className="text-sm font-bold text-primary truncate">
                            {targetEndpoint.title || targetEndpoint.summary}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-accent truncate">{targetEndpoint.path}</span>
                            <span className="text-[9px] bg-gray-800 text-gray-400 px-1.5 rounded uppercase">
                                {targetEndpoint.category}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 p-4 pb-20">
                    <div className="max-w-2xl mx-auto">
                        <EndpointCard 
                            endpoint={targetEndpoint} 
                            baseUrl={baseUrl} 
                            slug={targetSlug}
                            isInitialOpen={true} // Selalu buka di mode full screen
                        />
                    </div>
                </div>
            </div>
        );
    }

    // --- LIST MODE RENDER (STANDARD) ---

    return (
        <div className="min-h-screen flex flex-col pb-20"> 
            
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-main/95 backdrop-blur-xl border-b border-default/50 -mx-4 px-4 pt-4 shadow-sm transition-all duration-300">
                <div className="flex items-center justify-between mb-3">
                     <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold text-primary">Documentation</h1>
                        <div className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-lg">
                            v1.0
                        </div>
                     </div>
                     
                     <button 
                        onClick={() => setIsHeaderExpanded(!isHeaderExpanded)}
                        className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${isHeaderExpanded ? 'bg-gray-800 text-white' : 'bg-accent text-white shadow-lg shadow-accent/20'}`}
                        aria-label="Toggle Header"
                     >
                        <i className={`fas ${isHeaderExpanded ? 'fa-chevron-up' : 'fa-search'} transition-transform duration-300`}></i>
                     </button>
                </div>

                <div className={`overflow-hidden transition-[max-height,opacity] duration-300 ease-in-out ${isHeaderExpanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="relative mb-3">
                        <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted"></i>
                        <input 
                            type="text" 
                            placeholder="Cari endpoint..." 
                            value={searchQuery} 
                            onChange={(e) => setSearchQuery(e.target.value)} 
                            className="w-full bg-input border border-default rounded-2xl py-3 pl-10 pr-4 text-sm text-primary placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
                        />
                    </div>
                    
                    <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar mask-fade-right">
                        <button 
                            onClick={() => setActiveCategory('all')}
                            className={`whitespace-nowrap px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${activeCategory === 'all' ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-card border border-default text-secondary'}`}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat} 
                                onClick={() => setActiveCategory(cat)}
                                className={`whitespace-nowrap px-5 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${activeCategory === cat ? 'bg-accent text-white shadow-lg shadow-accent/20' : 'bg-card border border-default text-secondary'}`}
                            >
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Virtualized List */}
            <div className="mt-2">
                {flatList.length > 0 ? (
                    <Virtuoso
                        ref={virtuosoRef}
                        useWindowScroll={true} 
                        data={flatList}
                        itemContent={renderItem}
                        className="custom-scrollbar"
                    />
                ) : (
                    <div className="text-center py-20 text-muted bg-card rounded-3xl border border-dashed border-default mx-4 mt-4">
                        <i className="fas fa-ghost text-4xl mb-3 opacity-30"></i>
                        <p>Tidak ditemukan endpoint.</p>
                    </div>
                )}
            </div>

            {/* Floating TOC Button */}
            <button 
                onClick={() => setIsTocOpen(!isTocOpen)}
                className="fixed bottom-24 right-5 w-14 h-14 bg-accent hover:bg-accent-hover text-white rounded-full shadow-2xl shadow-accent/20 flex items-center justify-center z-50 active:scale-90 transition-transform md:hidden border-2 border-white/10"
            >
                <i className={`fas ${isTocOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
            </button>

            {/* Floating TOC Menu */}
            {isTocOpen && (
                <div className="fixed bottom-40 right-5 bg-card/95 backdrop-blur-xl border border-default rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 min-w-[180px] animate-slide-up origin-bottom-right max-h-[50vh] overflow-y-auto">
                     <div className="text-[10px] font-bold text-muted px-3 py-2 uppercase tracking-wider">Jump to category</div>
                     {categories.map(cat => (
                         <button 
                            key={cat}
                            onClick={() => {
                                const index = flatList.findIndex(item => item.type === 'header' && item.category === cat);
                                if (index >= 0 && virtuosoRef.current) {
                                    virtuosoRef.current.scrollToIndex({ 
                                        index, 
                                        align: 'start', 
                                        behavior: 'smooth',
                                        offset: isHeaderExpanded ? 180 : 80
                                    });
                                }
                                setIsTocOpen(false);
                            }}
                            className="text-left px-4 py-3 hover:bg-white/10 rounded-xl text-sm font-medium text-primary transition-colors flex justify-between items-center group"
                         >
                            {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            <i className="fas fa-arrow-right text-[10px] opacity-0 group-hover:opacity-100 transition-opacity text-accent"></i>
                         </button>
                     ))}
                </div>
            )}
        </div>
    );
}