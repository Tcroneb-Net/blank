import { NextResponse } from 'next/server';
import { chatStream } from '../../../../lib/zzzcode';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req) {
    try {
        const body = await req.json();
        const { prompt, language } = body;

        if (!prompt) {
            return NextResponse.json({ error: "Parameter 'prompt' wajib diisi." }, { status: 400 });
        }

        const encoder = new TextEncoder();
        const customStream = new TransformStream();
        const writer = customStream.writable.getWriter();

        const send = (data) => {
            return writer.write(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
        };

        (async () => {
            try {
                const generator = chatStream(language || 'Javascript', prompt);
                
                for await (const chunk of generator) {
                    await send({ content: chunk });
                }
                await send({ type: 'finish' });
            } catch (err) {
                await send({ error: err.message });
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