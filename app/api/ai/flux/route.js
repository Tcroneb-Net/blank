import { NextResponse } from 'next/server';
import { generateFlux } from '../../../../lib/flux';
import tempService from '../../../../lib/tempService';

export const runtime = 'nodejs';

// List of Unique Facts for Keep Alive
const FACTS = [
    "Flux is a highly efficient image generation model.",
    "Ants never sleep.",
    "Honey is the only food that never spoils.",
    "AI can process images thousands of times faster than humans.",
    "Elephants are the only mammals that cannot jump.",
    "A giraffe's tongue is blue-black.",
    "The human brain is more active during sleep than while watching TV.",
    "Hot water freezes faster than cold water."
];

export async function POST(req) {
    try {
        const body = await req.json();
        const { prompt } = body;
        
        if (!prompt) {
            return NextResponse.json(
                { error: "The 'prompt' parameter is required." }, 
                { status: 400 }
            );
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
                await send(
                    `Connecting to GraduallyAI Engine...\nGenerating: "${prompt}"\n`
                );

                // Timer to send facts every 2 seconds to keep connection alive
                keepAliveInterval = setInterval(() => {
                    const fact = FACTS[Math.floor(Math.random() * FACTS.length)];
                    send(`Info: ${fact}\n`);
                }, 2000);

                const result = await generateFlux(prompt);
                
                clearInterval(keepAliveInterval);

                if (result.success) {
                    // Ensure the URL in result has full origin before saving
                    if (result.result && result.result.url.startsWith('/')) {
                        result.result.url = origin + result.result.url;
                    }
                    
                    const dbId = await tempService.save(result, 30);

                    // SSE format: [true] data_fetch_link
                    await send(`[true] ${origin}/api/temp/${dbId}`);
                } else {
                    await send(`[false] Failed to generate image.`);
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
        return NextResponse.json(
            { error: error.message }, 
            { status: 500 }
        );
    }
}
