import { NextResponse } from 'next/server';
import { getVideoInfo } from '../../../../lib/dailymotion';
import { uploadToTmp } from '../../../../lib/uploader';
import { exec } from 'child_process';
import path from 'path';
import fs from 'fs-extra';

export const runtime = 'nodejs';
export const maxDuration = 300; 

const FACTS = [
    "Dailymotion adalah platform video terbesar kedua di dunia setelah YouTube.",
    "Perusahaan ini berasal dari Prancis dan didirikan pada tahun 2005.",
    "Dailymotion tersedia dalam 25 bahasa berbeda.",
    "Video pertama di Dailymotion diunggah pada Maret 2005.",
    "Platform ini dimiliki oleh Vivendi sejak tahun 2015."
];

export async function POST(req) {
    try {
        const body = await req.json();
        const { url } = body;
        
        if (!url) {
            return NextResponse.json({ error: "Parameter 'url' wajib diisi." }, { status: 400 });
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
            let tempFilePath = '';

            try {
                await send("Mendapatkan informasi video Dailymotion...\n");

                keepAliveInterval = setInterval(() => {
                    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
                    send(`Info: ${fact}\n`);
                }, 3000);

                const info = await getVideoInfo(url);
                
                if (!info.streamUrl) {
                    throw new Error("Gagal mendapatkan URL stream video.");
                }

                await send(`Judul: ${info.title}\n`);
                await send(`Mendownload video dari server Dailymotion...\n`);

                const videoId = info.xid || Date.now();
                tempFilePath = path.join('/tmp', `${videoId}.mp4`);

                // Proses download via FFmpeg
                await new Promise((resolve, reject) => {
                    const ffmpegCmd = `ffmpeg -i "${info.streamUrl}" -c copy -bsf:a aac_adtstoasc "${tempFilePath}" -y`;
                    exec(ffmpegCmd, (error) => {
                        if (error) return reject(new Error(`FFmpeg Error: ${error.message}`));
                        resolve();
                    });
                });

                await send(`Download selesai. Mengupload ke penyimpanan PuruBoy...\n`);

                const fileBuffer = await fs.readFile(tempFilePath);
                const publicUrl = await uploadToTmp(fileBuffer, `${videoId}.mp4`);

                clearInterval(keepAliveInterval);

                const finalData = {
                    title: info.title,
                    thumbnail: info.thumbnail?.url,
                    channel: info.channel?.displayName,
                    url: origin + publicUrl
                };

                // Format SSE Sukses
                const tempRes = await fetch(`${origin}/api/temp/save`, {
                   method: 'POST',
                   body: JSON.stringify(finalData)
                }).then(r => r.ok ? r.json() : {id: null});

                // Jika endpoint internal temp/save belum ada, kita gunakan uploader langsung saja di response
                await send(`[true] ${origin}${publicUrl}`);

            } catch (err) {
                if (keepAliveInterval) clearInterval(keepAliveInterval);
                await send(`[false] ${err.message}`);
            } finally {
                if (tempFilePath && await fs.pathExists(tempFilePath)) {
                    await fs.remove(tempFilePath);
                }
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