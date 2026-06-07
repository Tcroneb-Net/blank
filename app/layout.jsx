import './globals.css';

export const metadata = {
    title: 'PuruBoy API - Free REST API Platform',
    description: 'Free and open REST API platform with AI tools, downloaders, anime streaming, and more.',
    openGraph: {
        title: 'PuruBoy API',
        description: 'Free and open REST API platform',
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta name="theme-color" content="#000000" />
                <link rel="manifest" href="/manifest.json" />
                <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
            </head>
            <body className="bg-background text-foreground">
                <main className="max-w-5xl mx-auto px-4 py-6">
                    {children}
                </main>
            </body>
        </html>
    );
}
