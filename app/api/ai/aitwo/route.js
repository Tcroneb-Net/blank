import { NextResponse } from 'next/server';
import aitwoController from '../../../../lib/controllers/ai/aitwo';

export async function POST(req) {
    try {
        const body = await req.json();
        const origin = new URL(req.url).origin;
        
        // Mock request object for controller
        const mockReq = { body, origin };
        
        const result = await aitwoController(mockReq);
        return NextResponse.json(result);
    } catch (error) {
        return NextResponse.json({ 
            success: false, 
            message: error.message 
        }, { status: 500 });
    }
}