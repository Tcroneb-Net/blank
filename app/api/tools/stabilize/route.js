import { NextResponse } from 'next/server';
import stabilizeController from '../../../../lib/controllers/tools/stabilize';

export const maxDuration = 120; // Stabilisasi membutuhkan waktu yang cukup lama

export async function POST(req) {
    try {
        const body = await req.json();
        const mockReq = { body };
        
        const result = await stabilizeController(mockReq);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        }, { status: 500 });
    }
}