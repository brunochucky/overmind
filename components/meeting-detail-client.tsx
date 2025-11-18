

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { 
  ArrowLeft, 
  Loader2, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Volume2,
  Play,
  Pause,
  Languages,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';

import { OvermindLogo } from './overmind-logo';

interface Meeting {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type?: string;
  language: string;
  duration?: number;
  status: string;
  createdAt: string;
  transcript?: string;
  recap?: string;
  highlights?: string;
  audioPath?: string;
  audioUrl?: string;
}

interface MeetingDetailClientProps {
  meetingId: string;
}

export function MeetingDetailClient({ meetingId }: MeetingDetailClientProps) {
  const router = useRouter();
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    fetchMeeting();
  }, [meetingId]);

  const fetchMeeting = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/meetings/${meetingId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch meeting');
      }

      const data = await response.json();
      setMeeting(data);
    } catch (error) {
      console.error('Error fetching meeting:', error);
      toast.error('Failed to load meeting details');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'PROCESSING':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'RECORDING':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'FAILED':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleDownloadAudio = () => {
    if (!meeting?.audioUrl) return;
    
    const a = document.createElement('a');
    a.href = meeting.audioUrl;
    a.download = `meeting-${meeting.name}-${meeting.id}.webm`;
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleDelete = async () => {
    if (!meeting) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete this meeting with ${meeting.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/meetings/${meetingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete meeting');
      }

      toast.success('Meeting deleted successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Error deleting meeting:', error);
      toast.error('Failed to delete meeting');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-white/70" />
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm max-w-md">
          <CardContent className="p-8 text-center">
            <FileText className="h-16 w-16 text-white/50 mx-auto mb-4" />
            <h3 className="text-white text-xl font-semibold mb-2">Meeting not found</h3>
            <p className="text-white/70 mb-6">The meeting you're looking for doesn't exist.</p>
            <Button
              onClick={() => router.push('/dashboard')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const parseHighlights = (highlightsString?: string) => {
    if (!highlightsString) return [];
    try {
      return JSON.parse(highlightsString);
    } catch {
      return [];
    }
  };

  const highlights = parseHighlights(meeting.highlights);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <OvermindLogo />
          <Button
            onClick={() => router.push('/dashboard')}
            variant="ghost"
            className="text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </motion.div>

        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                {meeting.name}
              </h1>
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                  {meeting.status}
                </span>
                <span className="text-white/70 text-sm">
                  {formatDate(meeting.createdAt)}
                </span>
              </div>
            </div>
            
            <Button
              onClick={handleDelete}
              disabled={isDeleting}
              variant="ghost"
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-5 w-5 mr-2" />
                  Delete Meeting
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Meeting Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-6">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Meeting Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 text-white/80">
                  <Mail className="h-5 w-5 text-white/60" />
                  <div>
                    <div className="text-xs text-white/60 mb-1">Email</div>
                    <div>{meeting.email}</div>
                  </div>
                </div>

                {meeting.phone && (
                  <div className="flex items-center gap-3 text-white/80">
                    <Phone className="h-5 w-5 text-white/60" />
                    <div>
                      <div className="text-xs text-white/60 mb-1">Phone</div>
                      <div>{meeting.phone}</div>
                    </div>
                  </div>
                )}

                {meeting.type && (
                  <div className="flex items-center gap-3 text-white/80">
                    <FileText className="h-5 w-5 text-white/60" />
                    <div>
                      <div className="text-xs text-white/60 mb-1">Type</div>
                      <div>{meeting.type}</div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 text-white/80">
                  <Clock className="h-5 w-5 text-white/60" />
                  <div>
                    <div className="text-xs text-white/60 mb-1">Duration</div>
                    <div>{formatDuration(meeting.duration)}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-white/80">
                  <Languages className="h-5 w-5 text-white/60" />
                  <div>
                    <div className="text-xs text-white/60 mb-1">Language</div>
                    <div>{meeting.language === 'pt-BR' ? '🇧🇷 Portuguese (Brazil)' : '🇺🇸 English'}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Audio Player */}
        {meeting.audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Volume2 className="h-5 w-5" />
                  Audio Recording
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Button
                    onClick={toggleAudio}
                    size="lg"
                    className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                  >
                    {isPlaying ? (
                      <>
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        Play Audio
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleDownloadAudio}
                    variant="ghost"
                    className="text-white/70 hover:text-white"
                  >
                    Download Audio
                  </Button>

                  <audio
                    ref={audioRef}
                    src={meeting.audioUrl}
                    onEnded={() => setIsPlaying(false)}
                    onPause={() => setIsPlaying(false)}
                    onPlay={() => setIsPlaying(true)}
                    className="hidden"
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Transcript */}
        {meeting.transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Transcript
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white/80 whitespace-pre-wrap leading-relaxed">
                  {meeting.transcript}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recap */}
        {meeting.recap && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm mb-6">
              <CardHeader>
                <CardTitle className="text-white">Meeting Recap</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-white/80 whitespace-pre-wrap leading-relaxed">
                  {meeting.recap}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Highlights */}
        {highlights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white">Key Highlights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {highlights.map((highlight: any, index: number) => (
                    <div
                      key={index}
                      className="p-4 bg-white/5 rounded-lg border border-white/10"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{highlight.emoji}</span>
                        <div className="flex-1">
                          <div className="text-white/90 font-medium mb-1">
                            {highlight.category}
                          </div>
                          <div className="text-white/70 text-sm">
                            {highlight.text}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}
