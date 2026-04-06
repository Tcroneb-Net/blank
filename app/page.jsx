import React from 'react';
import Image from 'next/image';

export const revalidate = 3600;

export const metadata = {
    title: 'Hostify - Access Denied',
    description: 'You are not allowed to access this page. Hostify restricted area.',
};

const Hero = () => (
    <div className="text-center mb-12 animate-fade-in pt-12">
        <div className="inline-block mb-5 relative">
            <div className="w-24 h-24 bg-gradient-to-br from-red-500 via-pink-600 to-purple-600 rounded-3xl mx-auto flex items-center justify-center shadow-2xl shadow-red-500/30 border border-white/10">
                <i className="fas fa-ban text-4xl text-white drop-shadow-lg"></i>
            </div>
        </div>
        <h1 className="text-5xl font-extrabold text-red-600 mb-3 tracking-tight mt-4">
            Hostify
        </h1>
        <p className="text-secondary text-sm leading-relaxed max-w-sm mx-auto font-medium text-red-400">
            🚫 You are not allowed to be here. This section is restricted.
        </p>
    </div>
);

const FakeStatsCard = ({ icon, label }) => (
    <div className="native-card p-4 flex items-center gap-4 opacity-50 cursor-not-allowed">
        <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center">
            <i className={`fas ${icon} text-xl text-red-500`}></i>
        </div>
        <div>
            <div className="text-2xl font-extrabold text-red-500">??</div>
            <div className="text-[10px] text-red-400 uppercase tracking-widest font-bold">{label}</div>
        </div>
    </div>
);

const FeatureItem = ({ icon, title }) => (
    <div className="flex gap-4 p-4 native-card hover:bg-red-50/10 transition-colors group cursor-not-allowed opacity-50">
        <div className="flex-shrink-0 mt-0.5">
            <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                <i className={`fas ${icon} text-red-500 text-sm`}></i>
            </div>
        </div>
        <div className="flex-1">
            <h3 className="font-bold text-red-500 text-sm">{title}</h3>
            <p className="text-xs text-red-400 leading-relaxed opacity-80">Access denied</p>
        </div>
    </div>
);

export default function HostifyPage() {
    return (
        <div className="pb-4 bg-gray-900 min-h-screen text-white">
            <Hero />

            {/* Fake Stats */}
            <div className="grid grid-cols-2 gap-3 mb-8 max-w-md mx-auto">
                <FakeStatsCard icon="fa-code-branch" label="Endpoints" />
                <FakeStatsCard icon="fa-folder-open" label="Categories" />
            </div>

            {/* Fake Features */}
            <h2 className="text-sm font-bold text-red-500 mb-3 px-1 flex items-center gap-2 uppercase tracking-wider">
                <i className="fas fa-lock text-red-400 text-xs"></i> Restricted Features
            </h2>
            <div className="space-y-3 mb-8 max-w-md mx-auto">
                <FeatureItem icon="fa-bolt" title="High Performance" />
                <FeatureItem icon="fa-mobile-alt" title="Mobile Friendly" />
                <FeatureItem icon="fa-flask" title="API Tester" />
                <FeatureItem icon="fa-robot" title="AI Powered" />
            </div>

            {/* Fake Footer */}
            <div className="mt-8 p-5 native-card text-center border-dashed border-red-500/30 bg-gradient-to-b from-red-600/5 to-transparent max-w-md mx-auto">
                <i className="fas fa-exclamation-triangle text-red-500 text-2xl mb-3 block"></i>
                <p className="text-xs text-red-400 mb-4 leading-relaxed">
                    You cannot integrate Hostify API into your project. Access is forbidden.
                </p>
                <div className="inline-flex items-center gap-2 bg-red-500 text-white text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-red-900/20 opacity-50 cursor-not-allowed">
                    <i className="fas fa-ban text-sm"></i>
                    Access Denied
                </div>
            </div>
        </div>
    );
}
