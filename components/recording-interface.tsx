
'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { AmoebaAnimation } from './amoeba-animation';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Mic, Square, ArrowLeft, Volume2, Loader2 } from 'lucide-react';
import { MeetingData } from './landing-client';
import { toast } from 'sonner';
import { OvermindLogo } from './overmind-logo';

interface RecordingInterfaceProps {
  meetingData: MeetingData;
  onComplete: (transcript: string, duration: number) => void;
  onBack: () => void;
}

export function RecordingInterface({ meetingData, onComplete, onBack }: RecordingInterfaceProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [duration, setDuration] = useState(0);
  const [isSupported, setIsSupported] = useState(true);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startTimeRef = useRef<number>(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Check if MediaRecorder API is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setIsSupported(false);
      toast.error('Audio recording is not supported in your browser');
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      if (!isSupported) return;

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          channelCount: 1,
          sampleRate: 16000,
        } 
      });
      
      streamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') 
        ? 'audio/webm' 
        : 'audio/mp4';
      
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        await transcribeAudio();
      };

      // Update meeting status to recording
      await fetch(`/api/meetings/${meetingData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'RECORDING' }),
      });

      setIsRecording(true);
      setTranscript('');
      setDuration(0);
      startTimeRef.current = Date.now();

      // Start recording
      mediaRecorder.start(1000); // Collect data every second

      // Start duration timer
      intervalRef.current = setInterval(() => {
        setDuration(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 1000);

      toast.success('Recording started - please speak clearly');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    try {
      if (!mediaRecorderRef.current) return;

      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      setIsProcessing(true);
      toast.info('Processing audio...');
    } catch (error) {
      console.error('Error stopping recording:', error);
      toast.error('Failed to stop recording');
    }
  };

  const transcribeAudio = async () => {
    try {
      const finalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      
      if (audioChunksRef.current.length === 0) {
        toast.error('No audio recorded');
        setIsProcessing(false);
        return;
      }

      // Create audio blob
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Send to transcription API with language parameter and meetingId
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', meetingData.language || 'en-US');
      formData.append('meetingId', meetingData.id || '');

      toast.info('Transcribing audio...');

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const { transcript: transcribedText, audioPath } = await response.json();
      
      if (!transcribedText || transcribedText.trim() === '') {
        toast.warning('No speech detected in recording. Please try again and speak clearly.');
        setIsProcessing(false);
        return;
      }

      setTranscript(transcribedText);
      
      // Update meeting with transcript, duration, and audioPath
      await fetch(`/api/meetings/${meetingData.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transcript: transcribedText.trim(),
          duration: finalDuration,
          audioPath: audioPath,
          status: 'PROCESSING',
        }),
      });

      toast.success('Transcription completed!');
      setIsProcessing(false);
      onComplete(transcribedText.trim(), finalDuration);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      toast.error('Failed to transcribe audio. Please try again.');
      setIsProcessing(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isSupported) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-screen text-center"
      >
        <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-sm">
          <CardContent className="p-6">
            <Volume2 className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-white text-lg font-semibold mb-2">
              Audio Recording Not Supported
            </h3>
            <p className="text-white/70 mb-4">
              Your browser doesn't support audio recording. Please try using a modern browser like Chrome, Firefox, or Edge.
            </p>
            <Button onClick={onBack} variant="ghost" className="text-white/70 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-screen text-center space-y-8 p-4"
    >
      <OvermindLogo className="mx-auto" />
      {/* Meeting info header */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-white"
      >
        
        <h2 className="text-2xl font-semibold mb-2">
          Recording Meeting with {meetingData.name}
        </h2>
        {meetingData.type && (
          <p className="text-white/70">Type: {meetingData.type}</p>
        )}
      </motion.div>

      {/* Amoeba animation - clickable to start/stop recording */}
      <div onClick={isRecording ? stopRecording : (isProcessing ? undefined : startRecording)} className={!isProcessing ? 'cursor-pointer' : 'cursor-not-allowed'}>
        <AmoebaAnimation 
          isRecording={isRecording} 
          isProcessing={isProcessing}
          statusText={isProcessing ? 'Processing...' : isRecording ? 'Stop' : 'Record'}
          size="large" 
        />
      </div>

      {/* Instructions - REMOVED as text is now inside the amoeba */}
      {/* {!isRecording && !isProcessing && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-white/70 text-lg"
        >
          Click the organism to {isRecording ? 'stop' : 'start'} recording
        </motion.p>
      )} */}

      {/* Recording status */}
      <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-sm">
        <CardContent className="p-6">
          <div className="space-y-4">
            {/* Duration */}
            <div className="text-center">
              <div className="text-3xl font-mono text-white mb-2">
                {formatDuration(duration)}
              </div>
              <div className="flex items-center justify-center gap-2">
                {isRecording && (
                  <>
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                    <span className="text-white/70">Recording Audio</span>
                  </>
                )}
                {isProcessing && (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
                    <span className="text-white/70">Processing & Transcribing...</span>
                  </>
                )}
              </div>
            </div>

            {/* Back button */}
            <Button
              onClick={onBack}
              variant="ghost"
              className="w-full text-white/70 hover:text-white"
              disabled={isRecording || isProcessing}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Transcript preview */}
      {transcript && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardContent className="p-4">
              <h3 className="text-white font-semibold mb-2 flex items-center gap-2">
                <Volume2 className="h-4 w-4" />
                Transcript
              </h3>
              <div className="text-white/80 text-sm max-h-40 overflow-y-auto whitespace-pre-wrap">
                {transcript}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
}
