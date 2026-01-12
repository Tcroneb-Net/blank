import { NextResponse } from 'next/server';
import { decrypt } from '../../../../lib/crypto';
import axios from 'axios';

export const dynamic = 'force-dynamic';

export async function GET(req, { params }) {
    const { data } = params;
    
    if (!data) {
        return new NextResponse('Missing data parameter', { status: 400 });
    }

    try {
        // 1. Decrypt URL Target
        const targetUrl = decrypt(data);
        
        if (!targetUrl || !targetUrl.startsWith('http')) {
             return new NextResponse('Invalid or Corrupted Token', { status: 400 });
        }

        // 2. Security Check: Pastikan domain adalah domain internal yang diizinkan
        const urlObj = new URL(targetUrl);
        const allowedDomains = ['puruh2o-backend.hf.space', 'puruh2o-gabutcok.hf.space'];
        
        if (!allowedDomains.includes(urlObj.hostname)) {
             return new NextResponse('Forbidden: Access to this domain is restricted.', { status: 403 });
        }

        // 3. Proxy Request: Fetch konten dari backend
        const response = await axios.get(targetUrl, {
            responseType: 'stream',
            timeout: 30000
        });

        // 4. Return Stream ke Client
        const headers = new Headers();
        if (response.headers['content-type']) {
            headers.set('Content-Type', response.headers['content-type']);
        }
        if (response.headers['content-length']) {
            headers.set('Content-Length', response.headers['content-length']);
        }
        headers.set('Cache-Control', 'public, max-age=31536000, immutable');
        headers.set('X-Proxy-By', 'PuruBoy-Secure-Media');

        return new NextResponse(response.data, { headers });

    } catch (error) {
        console.error("Proxy Media Error:", error.message);
        return new NextResponse('Media not found or backend unavailable.', { status: 404 });
    }
}