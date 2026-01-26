'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(false);
  const [meetingUrl, setMeetingUrl] = useState('');
  const [copied, setCopied] = useState(false);
  const router = useRouter();

  const createMeeting = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/meeting/create', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const data = await response.json();
      const fullUrl = `${window.location.origin}/meeting/${data.roomId}`;
      setMeetingUrl(fullUrl);
    } catch (error) {
      console.error('Error creating meeting:', error);
      alert('Failed to create meeting. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(meetingUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const joinMeeting = () => {
    if (meetingUrl) {
      router.push(meetingUrl.replace(window.location.origin, ''));
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🎥</span>
                <span className="text-xl font-bold text-gray-900">VideoCall Pro</span>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition"
                >
                  <span className="mr-2">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Start a Video Call
            </h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Create instant meetings, invite participants, and collaborate in real-time
              with crystal-clear video and audio.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <span className="text-2xl">🎥</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 ml-4">
                  Create New Meeting
                </h2>
              </div>

              <p className="text-gray-600 mb-8">
                Start a new video call instantly. Share the link with participants to invite them.
              </p>

              <button
                onClick={createMeeting}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Creating Meeting...
                  </>
                ) : (
                  <>
                    <span className="mr-3">🎥</span>
                    Create Instant Meeting
                  </>
                )}
              </button>

              {meetingUrl && (
                <div className="mt-8 p-6 bg-gray-50 rounded-xl border border-gray-200">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Meeting Created Successfully!
                  </p>
                  <div className="flex items-center">
                    <input
                      type="text"
                      readOnly
                      value={meetingUrl}
                      className="flex-grow px-4 py-3 bg-white border border-gray-300 rounded-l-lg text-sm"
                    />
                    <button
                      onClick={copyToClipboard}
                      className="px-6 py-3 bg-gray-800 text-white rounded-r-lg hover:bg-gray-900 transition flex items-center"
                    >
                      <span className="mr-2">📋</span>
                      {copied ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                  <button
                    onClick={joinMeeting}
                    className="w-full mt-4 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition flex items-center justify-center"
                  >
                    <span className="mr-3">👥</span>
                    Join Meeting Now
                  </button>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <span className="text-2xl">👥</span>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 ml-4">
                  Features
                </h2>
              </div>

              <div className="space-y-6">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    🔒 Secure & Private
                  </h3>
                  <p className="text-sm text-blue-700">
                    End-to-end encrypted calls with secure authentication
                  </p>
                </div>

                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">
                    🎥 High Quality Video
                  </h3>
                  <p className="text-sm text-green-700">
                    Crystal clear 720p video with adaptive bitrate
                  </p>
                </div>

                <div className="p-4 bg-purple-50 rounded-lg">
                  <h3 className="font-semibold text-purple-900 mb-2">
                    👥 Multiple Participants
                  </h3>
                  <p className="text-sm text-purple-700">
                    Support for 1:1 calls and group meetings
                  </p>
                </div>

                <div className="p-4 bg-orange-50 rounded-lg">
                  <h3 className="font-semibold text-orange-900 mb-2">
                    🌐 Browser-Based
                  </h3>
                  <p className="text-sm text-orange-700">
                    No downloads required. Works on all modern browsers
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
}