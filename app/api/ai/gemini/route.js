import { NextResponse } from 'next/server';
import { askGemini } from '../../../../lib/gemini';

export const runtime = 'nodejs';
export const maxDuration = 60;

const FACTS = [
    "Gemini adalah model AI paling canggih dari Google.",
    "Banyak bintang di galaksi kita melebihi jumlah butiran pasir di bumi.",
    "Burung kolibri adalah satu-satunya burung yang bisa terbang mundur.",
    "Otak manusia menghasilkan daya listrik yang cukup untuk menyalakan bohlam kecil.",
    "Air membentuk sekitar 60% dari tubuh manusia dewasa.",
    "Satu hari di Venus lebih lama daripada satu tahun di Venus.",
    "Setiap detik, matahari mengubah 600 juta ton hidrogen menjadi helium.",
    "Ikan hiu sudah ada sejak sebelum dinosaurus."
];

export async function POST(req) {
    try {
        const body = await req.json();
        const { prompt } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Parameter 'prompt' wajib diisi." }, { status: 400 });
        }

        const encoder = new TextEncoder();
        const customStream = new TransformStream();
        const writer = customStream.writable.getWriter();

        const send = (text) => {
            return writer.write(encoder.encode(text)).catch(() => {});
        };

        (async () => {
            let keepAliveInterval;
            try {
                await send(`Menghubungkan ke Gemini untuk: "${prompt}"...\n`);

                keepAliveInterval = setInterval(() => {
                    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
                    send(`Sambil nunggu, tau gak sih? ${fact}\n`);
                }, 3000);

                const answer = await askGemini(prompt);
                
                clearInterval(keepAliveInterval);

                if (answer) {
                    await send(`\n[FINISH]\n${answer}`);
                } else {
                    await send(`[ERROR] Gagal mendapatkan respon dari AI.`);
                }
            } catch (err) {
                if (keepAliveInterval) clearInterval(keepAliveInterval);
                await send(`[ERROR] ${err.message}`);
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