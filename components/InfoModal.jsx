'use client';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

const InfoModal = ({ isOpen, onClose, title, children }) => {
    const [mounted, setMounted] = useState(false);
    const [animationState, setAnimationState] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            setAnimationState(true);
            document.body.style.overflow = 'hidden';
        } else {
            // UPDATED: Delay diperpanjang ke 500ms agar sinkron dengan durasi animasi baru
            const timer = setTimeout(() => setAnimationState(false), 500);
            document.body.style.overflow = 'auto';
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!mounted || (!isOpen && !animationState)) return null;

    return createPortal(
        <div 
            className={`fixed inset-0 z-50 flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
            onClick={onClose}
        >
            {/* Bottom Sheet Wrapper */}
            <div 
                className={`
                    w-full md:w-full md:max-w-lg bg-card border-t md:border border-default 
                    rounded-t-2xl md:rounded-2xl shadow-2xl max-h-[85vh] flex flex-col
                    transform transition-all duration-500 cubic-bezier(0.32, 0.72, 0, 1)
                    ${isOpen ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-full md:translate-y-10 opacity-0 md:scale-95'}
                `}
                onClick={e => e.stopPropagation()}
            >
                {/* Drag Handle for Mobile */}
                <div className="md:hidden w-full flex justify-center pt-3 pb-1" onClick={onClose}>
                    <div className="w-12 h-1.5 bg-gray-600 rounded-full"></div>
                </div>

                <header className="flex items-center justify-between px-6 py-4 border-b border-default">
                    <h2 className="text-lg font-bold text-primary">{title}</h2>
                    <button onClick={onClose} className="bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-full p-1 w-8 h-8 flex items-center justify-center transition-colors">
                        <i className="fas fa-times"></i>
                    </button>
                </header>
                
                <main className="p-6 overflow-y-auto overscroll-contain text-sm leading-relaxed">
                    {children}
                </main>
            </div>
        </div>,
        document.body
    );
};

export default InfoModal;