'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavItem = ({ to, icon, label }) => {
    const pathname = usePathname();
    const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to);

    return (
        <Link 
            href={to} 
            className={`flex flex-col items-center justify-center w-full pt-2 pb-1 text-muted transition-all duration-300 hover:text-accent ${isActive ? 'bottom-nav-active' : ''}`}
        >
            <div className="nav-icon-wrapper w-14 h-14 flex items-center justify-center rounded-full transition-all duration-300 mb-1">
                <i className={`fas ${icon} text-2xl`}></i>
            </div>
            <span className="text-xs font-medium tracking-wide uppercase">{label}</span>
        </Link>
    );
};

const BottomNav = () => {
    const pathname = usePathname();

    // Sembunyikan navigasi bawah pada halaman chat agar tampilan lebih luas/mirip aplikasi native
    if (pathname === '/chat') return null;

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-20 bg-card/80 backdrop-blur-lg border-t border-default z-50 md:hidden flex items-center justify-around shadow-2xl shadow-black">
            <NavItem to="/" icon="fa-home" label="Home" />
            <NavItem to="/docs" icon="fa-book-open" label="Docs" />
            <NavItem to="/chat" icon="fa-comments" label="Chat" />
            <NavItem to="/blog" icon="fa-newspaper" label="Blog" />
        </nav>
    );
};

export default BottomNav;