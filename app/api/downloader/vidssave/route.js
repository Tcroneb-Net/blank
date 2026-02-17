import { NextResponse } from 'next/server';
import vidssaveController from '../../../../lib/controllers/downloader/vidssave';

export const maxDuration = 60; 

export async function POST(req) {
    try {
        const body = await req.json();
        const origin = new URL(req.url).origin;
        
        const mockReq = { body, origin };
        
        const result = await vidssaveController(mockReq);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        }, { status: 500 });
    }
}