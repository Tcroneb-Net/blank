import { NextResponse } from 'next/server';
import fastdlController from '../../../../lib/controllers/downloader/fastdl';

export async function POST(req) {
    try {
        const body = await req.json();
        const mockReq = { body };
        
        const result = await fastdlController(mockReq);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        }, { status: 500 });
    }
}