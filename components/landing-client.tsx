
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { AmoebaAnimation } from './amoeba-animation';
import { MeetingForm } from './meeting-form';
import { RecordingInterface } from './recording-interface';
import { MeetingResults } from './meeting-results';
import { SettingsModal } from './settings-modal';
import { Settings, LogOut } from 'lucide-react';
import { Button } from './ui/button';
import { PWAInstall } from './pwa-install';
import { toast } from 'sonner';

export type AppState = 'landing' | 'form' | 'recording' | 'results';

export interface MeetingData {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  type?: string;
  language?: string;
  transcript?: string;
  duration?: number;
  recap?: string;
  highlights?: string;
  status?: string;
}

export function LandingClient() {
  const [currentState, setCurrentState] = useState<AppState>('form');
  const [meetingData, setMeetingData] = useState<MeetingData>({
    name: '',
    email: '',
    phone: '',
    type: '',
  });
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  const handleAmoebaClick = () => {
    setCurrentState('form');
  };

  const handleFormSubmit = (data: MeetingData) => {
    setMeetingData(data);
    setCurrentState('recording');
  };

  const handleRecordingComplete = (transcript: string, duration: number) => {
    setMeetingData(prev => ({ ...prev, transcript, duration }));
    setCurrentState('results');
  };

  const handleStartOver = () => {
    setCurrentState('landing');
    setMeetingData({
      name: '',
      email: '',
      phone: '',
      type: '',
    });
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (response.ok) {
        toast.success('Logged out successfully');
        router.push('/login');
        router.refresh();
      } else {
        throw new Error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <Button
          onClick={() => router.push('/dashboard')}
          variant="ghost"
          className="text-white/70 hover:text-white"
          title="View Dashboard"
        >
          Dashboard
        </Button>
        <Button
          onClick={() => setShowSettings(true)}
          variant="ghost"
          size="icon"
          className="text-white/70 hover:text-white"
          title="Settings"
        >
          <Settings className="h-5 w-5" />
        </Button>
        <Button
          onClick={handleLogout}
          variant="ghost"
          size="icon"
          className="text-white/70 hover:text-white"
          title="Logout"
        >
          <LogOut className="h-5 w-5" />
        </Button>
      </div>

      <div className="w-full max-w-4xl">
        {currentState === 'landing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center"
          >
            <motion.h1
              initial={{ y: -20 }}
              animate={{ y: 0 }}
              className="text-6xl font-bold text-white mb-4 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent"
            >
              Overmind
            </motion.h1>
            <motion.p
              initial={{ y: 20 }}
              animate={{ y: 0 }}
              className="text-xl text-white/80 mb-12"
            >
              AI-powered meeting recorder and analyzer
            </motion.p>
            <div className="flex justify-center">
              <AmoebaAnimation onClick={handleAmoebaClick} />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-white/60 mt-8"
            >
              Click the organism to begin
            </motion.p>
          </motion.div>
        )}

        {currentState === 'form' && (
          <MeetingForm onSubmit={handleFormSubmit} initialData={meetingData} />
        )}

        {currentState === 'recording' && (
          <RecordingInterface
            meetingData={meetingData}
            onComplete={handleRecordingComplete}
            onBack={() => setCurrentState('form')}
          />
        )}

        {currentState === 'results' && (
          <MeetingResults
            meetingData={meetingData}
            onStartOver={handleStartOver}
          />
        )}
      </div>

      <PWAInstall />
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
