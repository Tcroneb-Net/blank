'use client';

import React, { useState, useEffect } from 'react';
import EndpointCard from './EndpointCard';

export default function DocsClient({ apiSpec }) {
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [baseUrl, setBaseUrl] = useState('');
    const [isTocOpen, setIsTocOpen] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setBaseUrl(window.location.origin);
        }
    }, []);

    const categories = apiSpec ? Object.keys(apiSpec).sort() : [];

    const filteredSpec = searchQuery ? Object.entries(apiSpec || {}).reduce((acc, [category, endpoints]) => {
        const filtered = endpoints.filter(ep => ep.path.toLowerCase().includes(searchQuery.toLowerCase()) || (ep.summary && ep.summary.toLowerCase().includes(searchQuery.toLowerCase())));
        if (filtered.length > 0) acc[category] = filtered;
        return acc;
    }, {}) : (activeCategory === 'all' ? apiSpec : { [activeCategory]: apiSpec[activeCategory] });

    return (
        <div className="animate-fade-in pb-20">
            {/* Sticky Header & Search */}
            <div className="sticky-header -mx-4 px-4 py-4 mb-6">
                <div className="flex items-center justify-between mb-4">
                     <h1 className="text-2xl font-bold text-primary">Documentation</h1>
                     <div className="bg-accent/10 text-accent text-xs font-bold px-2 py-1 rounded-lg">
                        v1.0
                     </div>
                </div>

                <div className="relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-muted"></i>
                    <input 
                        type="text" 
                        placeholder="Cari endpoint..." 
                        value={searchQuery} 
                        onChange={(e) => setSearchQuery(e.target.value)} 
                        className="w-full bg-input border border-default rounded-2xl py-3 pl-10 pr-4 text-sm text-primary placeholder-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-all shadow-inner"
                    />
                </div>
                
                {/* Category Pills */}
                <div className="flex gap-2 overflow-x-auto mt-4 pb-1 no-scrollbar mask-fade-right">
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

            <div className="space-y-10">
                {filteredSpec && Object.entries(filteredSpec).map(([category, endpoints]) => (
                    <div key={category} id={`cat-${category}`} className="animate-slide-up">
                        <div className="flex items-center gap-3 mb-4 px-1">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-800 to-black border border-default flex items-center justify-center shadow-lg">
                                <span className="text-lg font-bold text-accent">{category.charAt(0).toUpperCase()}</span>
                            </div>
                            <h3 className="text-xl font-bold text-primary tracking-tight">
                                {category.toUpperCase()}
                            </h3>
                            <span className="ml-auto text-xs font-mono text-muted bg-input px-2 py-1 rounded-lg border border-default">
                                {endpoints.length} endpoints
                            </span>
                        </div>
                        <div>
                            {endpoints.map((endpoint, index) => (
                                <EndpointCard key={index} endpoint={endpoint} baseUrl={baseUrl} />
                            ))}
                        </div>
                    </div>
                ))}
                
                {(!filteredSpec || Object.keys(filteredSpec).length === 0) && (
                    <div className="text-center py-20 text-muted bg-card rounded-3xl border border-dashed border-default mx-4">
                        <i className="fas fa-ghost text-4xl mb-3 opacity-30"></i>
                        <p>Tidak ditemukan endpoint.</p>
                    </div>
                )}
            </div>

            {/* Floating TOC Button (Mobile Only) */}
            <button 
                onClick={() => setIsTocOpen(!isTocOpen)}
                className="fixed bottom-24 right-5 w-14 h-14 bg-accent hover:bg-accent-hover text-white rounded-full shadow-2xl shadow-accent/20 flex items-center justify-center z-50 active:scale-90 transition-transform md:hidden border-2 border-white/10"
            >
                <i className={`fas ${isTocOpen ? 'fa-times' : 'fa-list-ul'} text-xl`}></i>
            </button>

            {/* Floating TOC Menu */}
            {isTocOpen && (
                <div className="fixed bottom-40 right-5 bg-card/95 backdrop-blur-xl border border-default rounded-2xl shadow-2xl p-2 z-50 flex flex-col gap-1 min-w-[180px] animate-slide-up origin-bottom-right">
                     <div className="text-[10px] font-bold text-muted px-3 py-2 uppercase tracking-wider">Jump to category</div>
                     {categories.map(cat => (
                         <button 
                            key={cat}
                            onClick={() => {
                                document.getElementById(`cat-${cat}`)?.scrollIntoView({ behavior: 'smooth' });
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