import { NextResponse } from 'next/server';
import { generate } from '../../../../lib/vheer';
import tempService from '../../../../lib/tempService';

export const runtime = 'nodejs';
export const maxDuration = 60; // Izinkan durasi eksekusi lebih lama (Vercel Pro/Self-hosted)

// Daftar Fakta Unik untuk Keep Alive agar koneksi tidak putus
const FACTS = [
    "AI Vheer menggunakan model difusi canggih untuk menghasilkan gambar.",
    "Proses ini berjalan di cloud browser secara remote.",
    "Semut bisa mengangkat beban 50 kali berat badannya.",
    "Madu tidak pernah basi jika disimpan dengan benar.",
    "Otak manusia memiliki kapasitas memori sekitar 2.5 petabyte.",
    "Cahaya matahari butuh 8 menit untuk sampai ke bumi.",
    "Kucing tidur sekitar 70% dari hidup mereka.",
    "Gurita memiliki tiga jantung.",
    "Air panas bisa membeku lebih cepat dari air dingin.",
    "Pisang secara teknis adalah buah beri."
];

export async function POST(req) {
    try {
        const body = await req.json();
        const { prompt } = body;
        
        if (!prompt) {
            return NextResponse.json({ error: "Parameter 'prompt' wajib diisi." }, { status: 400 });
        }

        const origin = new URL(req.url).origin;
        const encoder = new TextEncoder();
        
        // Setup Stream
        const customStream = new TransformStream();
        const writer = customStream.writable.getWriter();

        const send = (text) => {
            return writer.write(encoder.encode(text)).catch(() => {});
        };

        (async () => {
            let keepAliveInterval;
            try {
                await send(`Memulai Vheer AI untuk: "${prompt}"...\n`);
                await send(`Harap tunggu, proses ini memakan waktu 30-60 detik...\n`);

                // Timer untuk mengirim fakta setiap 3 detik (Keep-Alive)
                keepAliveInterval = setInterval(() => {
                    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
                    send(`Info: ${fact}\n`);
                }, 3000);

                // Proses Generate Gambar (Berat)
                const result = await generate(prompt);
                
                clearInterval(keepAliveInterval);

                if (result && result.image) {
                    // Simpan hasil ke tempService agar format konsisten dengan endpoint lain
                    // Result format: { url: "https://files.catbox.moe/..." }
                    // result.image is relative path like /api/media/...
                    const outputData = {
                        url: origin + result.image,
                        prompt: prompt,
                        source: 'vheer'
                    };

                    const dbId = await tempService.save(outputData, 30); // Simpan 30 menit
                    
                    // Format Sukses: [true] link_pengambilan_data
                    await send(`[true] ${origin}/api/temp/${dbId}`);
                } else {
                    await send(`[false] Gagal mendapatkan URL gambar dari Vheer.`);
                }
            } catch (err) {
                if (keepAliveInterval) clearInterval(keepAliveInterval);
                console.error("Vheer Error:", err);
                // Format Gagal: [false] pesan_error
                await send(`[false] ${err.message || 'Terjadi kesalahan internal.'}`);
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