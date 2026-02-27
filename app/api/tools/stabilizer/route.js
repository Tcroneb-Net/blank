import { NextResponse } from 'next/server';
import { stabilizeVideo } from '../../../../lib/stabilizer';
import { uploadToTmp } from '../../../../lib/uploader';
import tempService from '../../../../lib/tempService';

export const runtime = 'nodejs';
export const maxDuration = 300; // 5 Minutes (Max for hobby/pro plans)

const FACTS = [
    "Stabilisasi video menggunakan algoritma estimasi gerakan antarfram.",
    "AI Stabilizer dapat membedakan antara guncangan tidak sengaja dan gerakan kamera yang halus.",
    "Proses ini biasanya melibatkan teknik 'cropping' sedikit untuk menutupi tepian yang bergerak.",
    "Video 4K membutuhkan daya komputasi 4x lebih besar daripada 1080p.",
    "Stabilisasi digital modern sering kali menggabungkan data dari sensor gyro ponsel.",
    "Rendering video di cloud sering kali lebih cepat daripada di perangkat mobile lama."
];

export async function POST(req) {
    try {
        const body = await req.json();
        const { url } = body;
        
        if (!url) {
            return NextResponse.json({ error: "Parameter 'url' video wajib diisi." }, { status: 400 });
        }

        const origin = new URL(req.url).origin;
        const encoder = new TextEncoder();
        const customStream = new TransformStream();
        const writer = customStream.writable.getWriter();

        const send = (text) => {
            return writer.write(encoder.encode(text)).catch(() => {});
        };

        (async () => {
            let keepAliveInterval;
            try {
                await send("Menganalisis video dan memulai proses stabilisasi AI...\n");

                keepAliveInterval = setInterval(() => {
                    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
                    send(`Sambil menunggu... ${fact}\n`);
                }, 4000);

                const resultBuffer = await stabilizeVideo(url);
                
                clearInterval(keepAliveInterval);
                await send("Stabilisasi selesai! Mengunggah hasil...\n");

                const proxyPath = await uploadToTmp(resultBuffer, `stabilized-${Date.now()}.mp4`);
                
                const dbId = await tempService.save({
                    output: origin + proxyPath,
                    original: url,
                    type: 'video/mp4',
                    author: 'PuruBoy'
                }, 30);

                await send(`[true] ${origin}/api/temp/${dbId}`);
            } catch (err) {
                if (keepAliveInterval) clearInterval(keepAliveInterval);
                await send(`[false] ${err.message}`);
            } finally {
                try { await writer.close(); } catch (e) {}
            }
        })();

        return new Response(customStream.readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}