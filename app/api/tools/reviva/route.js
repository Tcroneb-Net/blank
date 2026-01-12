import { NextResponse } from 'next/server';
import { kolorize } from '../../../../lib/kolorize';
import tempService from '../../../../lib/tempService';

// Daftar Fakta Unik untuk Keep Alive
const FACTS = [
    "YA NDAK TAU TANYA KOK TANYA SAYA HMMM",
    "Semut tidak pernah tidur.",
    "Sapi tidak memiliki gigi atas.",
    "Madu adalah satu-satunya makanan yang tidak basi.",
    "Siput bisa tidur selama 3 tahun.",
    "Gajah adalah satu-satunya mamalia yang tidak bisa melompat.",
    "Lidah jerapah berwarna biru hitam.",
    "Kupu-kupu merasakan rasa dengan kaki mereka.",
    "Jantung udang terletak di kepala.",
    "Babi tidak bisa melihat ke langit.",
    "Cokelat bisa membunuh anjing karena mengandung theobromine.",
    "Otak manusia bekerja lebih aktif saat tidur daripada saat menonton TV.",
    "Air panas membeku lebih cepat daripada air dingin (Efek Mpemba)."
];

export const runtime = 'nodejs';

export async function POST(req) {
    try {
        const body = await req.json();
        const { url } = body;
        
        if (!url) {
            return NextResponse.json({ error: "Parameter 'url' wajib diisi." }, { status: 400 });
        }

        const origin = new URL(req.url).origin;
        const encoder = new TextEncoder();
        
        // Menggunakan TransformStream untuk mekanisme streaming yang lebih lancar
        const customStream = new TransformStream();
        const writer = customStream.writable.getWriter();

        const send = (text) => {
            return writer.write(encoder.encode(text)).catch(() => {});
        };

        // Jalankan logika secara asinkron (tidak memblokir pengiriman response awal)
        (async () => {
            let keepAliveInterval;
            try {
                await send("Memulai proses pewarnaan (Kolorize)...\n");

                // Timer untuk mengirim fakta setiap 2 detik
                keepAliveInterval = setInterval(() => {
                    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
                    send(`Tau gak sih....${fact}\n`);
                }, 2000);

                const result = await kolorize.process(url);
                
                clearInterval(keepAliveInterval);

                if (result.success) {
                    // Simpan hasil ke temp storage
                    // result.image is relative /api/media/...
                    const dbId = await tempService.save({
                        output: origin + result.image,
                        original: url
                    }, 30);
                    // Format baru: [true] link
                    await send(`[true] ${origin}/api/temp/${dbId}`);
                } else {
                    const errMsg = result.error || 'Unknown Error';
                    // Format baru: [false] message
                    await send(`[false] ${errMsg}`);
                }
            } catch (err) {
                if (keepAliveInterval) clearInterval(keepAliveInterval);
                await send(`[false] ${err.message}`);
            } finally {
                try {
                    await writer.close();
                } catch (e) {
                    // Ignore close errors
                }
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