"use client";

import { useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';
import { PhoneOff, Phone, Mic, Speaker, Video, MicOff, VolumeX } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';

export function FakeCall({ onEndCall }: { onEndCall: () => void }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [callState, setCallState] = useState<'incoming' | 'active'>('incoming');
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const [callDuration, setCallDuration] = useState(0);
  const ringtoneIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Start ringtone immediately when fake call component mounts
    console.log('FakeCall component mounted - starting ringtone immediately');
    startRingtone();
    
    // Cleanup function to stop audio when component unmounts
    return () => {
      console.log('FakeCall component unmounting - stopping ringtone');
      stopRingtone();
    };
  }, []); // Empty dependency array - runs only on mount

  const startRingtone = () => {
    // Since the audio file is empty, we'll use the generated ringtone directly
    console.log('Starting generated ringtone immediately');
    startGeneratedRingtone();
    
    // Keep the audio file fallback for future use
    if (audioRef.current) {
      audioRef.current.loop = true;
      audioRef.current.volume = 0.7;
      audioRef.current.play().catch(error => {
        console.log("Audio file not available, using generated ringtone");
      });
    }
  };

  const stopRingtone = () => {
    // Stop audio file
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    
    // Stop generated ringtone
    if (ringtoneIntervalRef.current) {
      clearInterval(ringtoneIntervalRef.current);
      ringtoneIntervalRef.current = null;
    }
    
    // Close audio context if it exists
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  const startGeneratedRingtone = () => {
    console.log('Starting generated ringtone');
    
    // Create audio context if it doesn't exist
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    // Play first tone immediately
    playTone();
    
    // Set up repeating tones every 3 seconds (iPhone timing)
    ringtoneIntervalRef.current = setInterval(() => {
      playTone();
    }, 3000);
  };

  const playTone = () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      // Resume audio context if suspended (required for autoplay policies)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }
      
      // iPhone ringtone frequencies (Marimba-style)
      const frequencies = [659.25, 783.99, 880.00, 1046.50]; // E5, G5, A5, C6
      const duration = 0.15; // Short notes
      
      frequencies.forEach((freq, index) => {
        const oscillator = audioContextRef.current!.createOscillator();
        const gainNode = audioContextRef.current!.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContextRef.current!.destination);
        
        oscillator.type = 'sine'; // Smooth iPhone-like tone
        oscillator.frequency.setValueAtTime(freq, audioContextRef.current!.currentTime + index * duration);
        
        // iPhone-style envelope
        gainNode.gain.setValueAtTime(0, audioContextRef.current!.currentTime + index * duration);
        gainNode.gain.linearRampToValueAtTime(0.15, audioContextRef.current!.currentTime + index * duration + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContextRef.current!.currentTime + index * duration + duration);
        
        oscillator.start(audioContextRef.current!.currentTime + index * duration);
        oscillator.stop(audioContextRef.current!.currentTime + index * duration + duration);
      });
    } catch (error) {
      console.error("Could not generate tone:", error);
    }
  };

  // Call duration timer for active calls
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callState === 'active') {
      interval = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [callState]);

  const handleAnswerCall = () => {
    // Stop ringtone immediately when answer is clicked
    console.log('Answering call - stopping ringtone immediately');
    stopRingtone();
    setCallState('active');
  };

  const handleRejectCall = () => {
    // Stop ringtone immediately when reject is clicked
    console.log('Rejecting call - stopping ringtone immediately');
    stopRingtone();
    onEndCall();
  };

  const handleEndCall = () => {
    // The onEndCall prop will unmount this component, triggering the cleanup in useEffect.
    onEndCall();
  };

  const formatCallDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-gray-900 to-gray-800 z-50 flex flex-col items-center justify-between text-white p-8">
      {/* Enhanced ringtone with fallback */}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/ringing.mp3" type="audio/mpeg" />
        <source src="/sounds/ringing.wav" type="audio/wav" />
      </audio>

      {/* Status indicator */}
      <div className="text-center mt-16">
        {callState === 'incoming' ? (
          <p className="text-lg text-gray-300 animate-pulse">Incoming Call...</p>
        ) : (
          <p className="text-lg text-green-400">{formatCallDuration(callDuration)}</p>
        )}
      </div>

      {/* Caller info */}
      <div className="text-center">
        <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-gray-600">
            <AvatarImage src="https://placehold.co/200x200.png" alt="Caller" data-ai-hint="woman portrait" />
            <AvatarFallback>M</AvatarFallback>
        </Avatar>
        <h1 className="text-4xl font-bold">Mom</h1>
        <p className="text-lg text-gray-300 mt-2">Mobile</p>
      </div>

      {/* Call controls */}
      <div className="flex flex-col items-center gap-8 w-full">
        {callState === 'active' && (
          <div className="flex justify-around w-full max-w-sm">
            <div className="flex flex-col items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className={`rounded-full w-16 h-16 ${isMuted ? 'bg-red-500/80 hover:bg-red-500' : 'bg-white/20 hover:bg-white/30'}`}
                  onClick={() => setIsMuted(!isMuted)}
                >
                    {isMuted ? <MicOff className="h-8 w-8" /> : <Mic className="h-8 w-8" />}
                </Button>
                <span className="text-sm">{isMuted ? 'Unmute' : 'Mute'}</span>
            </div>
             <div className="flex flex-col items-center gap-2">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  className={`rounded-full w-16 h-16 ${isSpeakerOn ? 'bg-blue-500/80 hover:bg-blue-500' : 'bg-white/20 hover:bg-white/30'}`}
                  onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                >
                    {isSpeakerOn ? <VolumeX className="h-8 w-8" /> : <Speaker className="h-8 w-8" />}
                </Button>
                <span className="text-sm">Speaker</span>
            </div>
             <div className="flex flex-col items-center gap-2">
                <Button variant="secondary" size="icon" className="rounded-full w-16 h-16 bg-white/20 hover:bg-white/30">
                    <Video className="h-8 w-8" />
                </Button>
                <span className="text-sm">Video</span>
            </div>
          </div>
        )}
        
        {callState === 'incoming' ? (
          <div className="flex justify-center gap-16 w-full">
            {/* Reject call */}
            <Button
                onClick={handleRejectCall}
                variant="destructive"
                size="lg"
                className="rounded-full w-20 h-20 bg-red-500 hover:bg-red-600"
            >
              <PhoneOff className="h-10 w-10" />
              <span className="sr-only">Reject call</span>
            </Button>
            
            {/* Answer call */}
            <Button
                onClick={handleAnswerCall}
                size="lg"
                className="rounded-full w-20 h-20 bg-green-500 hover:bg-green-600"
            >
              <Phone className="h-10 w-10" />
              <span className="sr-only">Answer call</span>
            </Button>
          </div>
        ) : (
          <Button
              onClick={handleEndCall}
              variant="destructive"
              size="lg"
              className="rounded-full w-20 h-20 bg-red-500 hover:bg-red-600"
          >
            <PhoneOff className="h-10 w-10" />
            <span className="sr-only">End call</span>
          </Button>
        )}
      </div>
    </div>
  );
}
