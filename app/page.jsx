import React, { Suspense } from 'react';
import { getDocsSpec } from '../lib/docsService';
import DocsClient from '../components/DocsClient';

export const metadata = {
    title: 'API Documentation | Hostify API',
    description: 'Explore Hostify API endpoints. Interactive documentation for AI features, Downloaders, Anime Streaming, and more tools.',
    keywords: ['API Documentation', 'API Docs', 'Hostify Endpoints', 'How to use Hostify API']
};

export const revalidate = 3600;

export default async function DocsPage() {
    let apiSpec = {};
    let error = null;

    try {
        apiSpec = await getDocsSpec();
    } catch (err) {
        console.error("SSG Error:", err);
        error = "Failed to load API specification at build time.";
    }

    if (error) {
        return (
            <div className="p-6 text-center text-red-400">
                <h1 className="text-xl font-bold mb-2">Error</h1>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-20 min-h-[60vh]">
                <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-muted text-sm animate-pulse">Loading documentation...</p>
            </div>
        }>
            <DocsClient apiSpec={apiSpec} />
        </Suspense>
    );
}
