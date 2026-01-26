'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import VideoCall from '@/components/VideoCall';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function MeetingPage() {
  const params = useParams();
  const router = useRouter();
  const [roomUrl, setRoomUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeMeeting = async () => {
      try {
        const roomId = params.roomId as string;
        if (!roomId) {
          throw new Error('Invalid meeting ID');
        }

        // Construct Daily.co room URL
        const domain = process.env.NEXT_PUBLIC_DAILY_DOMAIN;
        if (!domain) {
          throw new Error('Daily.co domain not configured');
        }

        const url = `https://${domain}.daily.co/${roomId}`;
        setRoomUrl(url);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initializeMeeting();
  }, [params.roomId]);

  const handleLeave = () => {
    router.push('/dashboard');
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white">Loading meeting...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (error || !roomUrl) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center bg-gray-900">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Meeting Error</h2>
            <p className="text-gray-300 mb-8">{error || 'Failed to load meeting'}</p>
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
            >
              Return to Dashboard
            </button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-900">
        <header className="bg-gray-800 border-b border-gray-700 p-4">
          <div className="max-w-7xl mx-auto flex justify-between items-center">
            <h1 className="text-xl font-bold text-white">Video Meeting</h1>
            <p className="text-sm text-gray-400">Room: {params.roomId}</p>
          </div>
        </header>
        
        <main className="h-[calc(100vh-4rem)]">
          <VideoCall roomUrl={roomUrl} onLeave={handleLeave} />
        </main>
      </div>
    </ProtectedRoute>
  );
}