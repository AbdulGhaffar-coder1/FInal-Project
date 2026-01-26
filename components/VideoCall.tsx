'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import DailyIframe from '@daily-co/daily-js';

interface VideoCallProps {
  roomUrl: string;
  onLeave: () => void;
}

export default function VideoCall({ roomUrl, onLeave }: VideoCallProps) {
  const [callFrame, setCallFrame] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [participants, setParticipants] = useState<any[]>([]);
  const callContainerRef = useRef<HTMLDivElement>(null);

  const initializeCall = useCallback(() => {
    if (!callContainerRef.current) return;

    const frame = DailyIframe.createFrame(callContainerRef.current, {
      showLeaveButton: true,
      showFullscreenButton: true,
      iframeStyle: {
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '8px',
      },
    });

    frame.on('loading', () => setIsLoading(true));
    frame.on('loaded', () => setIsLoading(false));
    frame.on('joined-meeting', (event) => {
      console.log('Joined meeting:', event);
      updateParticipants(frame);
    });
    frame.on('participant-joined', () => updateParticipants(frame));
    frame.on('participant-updated', () => updateParticipants(frame));
    frame.on('participant-left', () => updateParticipants(frame));
    frame.on('left-meeting', () => {
      onLeave();
    });

    frame.join({ url: roomUrl });

    setCallFrame(frame);
  }, [roomUrl, onLeave]);

  const updateParticipants = async (frame: any) => {
    const meetingState = await frame.meetingState();
    if (meetingState === 'joined-meeting') {
      const participantsObj = frame.participants();
      const participantsArray = Object.values(participantsObj);
      setParticipants(participantsArray);
    }
  };

  const toggleCamera = async () => {
    if (!callFrame) return;
    const newState = !isCameraOn;
    await callFrame.setLocalVideo(newState);
    setIsCameraOn(newState);
  };

  const toggleMic = async () => {
    if (!callFrame) return;
    const newState = !isMicOn;
    await callFrame.setLocalAudio(newState);
    setIsMicOn(newState);
  };

  const handleLeave = () => {
    if (callFrame) {
      callFrame.leave();
    }
    onLeave();
  };

  useEffect(() => {
    initializeCall();

    return () => {
      if (callFrame) {
        callFrame.destroy();
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow relative" ref={callContainerRef}>
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center">
              <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-white">Joining meeting...</p>
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-800 p-4 rounded-b-lg">
        <div className="flex justify-between items-center">
          <div className="text-white">
            <p className="text-sm">
              Participants: {participants.length}
            </p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={toggleCamera}
              className={`p-3 rounded-full ${
                isCameraOn
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
              } text-white transition-colors`}
              aria-label={isCameraOn ? 'Turn camera off' : 'Turn camera on'}
            >
              {isCameraOn ? '📹 On' : '📹 Off'}
            </button>

            <button
              onClick={toggleMic}
              className={`p-3 rounded-full ${
                isMicOn
                  ? 'bg-blue-600 hover:bg-blue-700'
                  : 'bg-red-600 hover:bg-red-700'
              } text-white transition-colors`}
              aria-label={isMicOn ? 'Mute microphone' : 'Unmute microphone'}
            >
              {isMicOn ? '🎤 On' : '🎤 Off'}
            </button>

            <button
              onClick={handleLeave}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Leave Meeting
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}