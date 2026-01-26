import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { verifyToken } from '@/lib/jwt';
import { cookies } from 'next/headers';

const DAILY_API_KEY = process.env.DAILY_API_KEY;
const DAILY_API_URL = 'https://api.daily.co/v1';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const token = cookies().get('token')?.value;
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    verifyToken(token);
    await connectDB();

    // Generate a unique room name
    const roomName = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create room in Daily.co
    const roomResponse = await fetch(`${DAILY_API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${DAILY_API_KEY}`,
      },
      body: JSON.stringify({
        name: roomName,
        privacy: 'public',
        properties: {
          exp: Math.floor(Date.now() / 1000) + 60 * 60 * 2, // 2 hours expiration
          enable_chat: false,
          enable_screenshare: false,
          start_video_off: false,
          start_audio_off: false,
        },
      }),
    });

    if (!roomResponse.ok) {
      throw new Error('Failed to create room');
    }

    const roomData = await roomResponse.json();

    // Return room URL
    return NextResponse.json({
      roomId: roomData.name,
      roomUrl: roomData.url,
      message: 'Meeting created successfully',
    });
  } catch (error: any) {
    console.error('Create meeting error:', error);
    return NextResponse.json(
      { message: 'Failed to create meeting' },
      { status: 500 }
    );
  }
}