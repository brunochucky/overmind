
'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  User, 
  Mail, 
  Phone, 
  FileText, 
  Clock, 
  MessageSquare, 
  Sparkles, 
  RotateCcw,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { MeetingData } from './landing-client';
import { toast } from 'sonner';

interface MeetingResultsProps {
  meetingData: MeetingData;
  onStartOver: () => void;
}

export function MeetingResults({ meetingData, onStartOver }: MeetingResultsProps) {
  const [fullMeetingData, setFullMeetingData] = useState<MeetingData>(meetingData);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState('');

  useEffect(() => {
    if (meetingData.id && meetingData.transcript) {
      processWithLLM();
    }
  }, [meetingData]);

  const processWithLLM = async () => {
    if (!meetingData.id) return;

    setIsProcessing(true);
    
    try {
      // First, generate recap
      setProcessingStep('Generating meeting recap...');
      const recapResponse = await fetch('/api/meetings/generate-recap', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId: meetingData.id,
          transcript: meetingData.transcript,
        }),
      });

      if (!recapResponse.ok) {
        throw new Error('Failed to generate recap');
      }

      // Process recap stream
      const recapReader = recapResponse.body?.getReader();
      const recapDecoder = new TextDecoder();
      let recapBuffer = '';

      if (recapReader) {
        while (true) {
          const { done, value } = await recapReader.read();
          if (done) break;
          
          const chunk = recapDecoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.status === 'completed' && parsed.result) {
                  recapBuffer = parsed.result;
                  break;
                }
              } catch (e) {
                // Continue processing
              }
            }
          }
        }
      }

      // Then, generate highlights
      setProcessingStep('Extracting key highlights...');
      const highlightsResponse = await fetch('/api/meetings/generate-highlights', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId: meetingData.id,
          transcript: meetingData.transcript,
        }),
      });

      if (!highlightsResponse.ok) {
        throw new Error('Failed to generate highlights');
      }

      // Process highlights stream
      const highlightsReader = highlightsResponse.body?.getReader();
      const highlightsDecoder = new TextDecoder();
      let highlightsBuffer = '';

      if (highlightsReader) {
        while (true) {
          const { done, value } = await highlightsReader.read();
          if (done) break;
          
          const chunk = highlightsDecoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              
              try {
                const parsed = JSON.parse(data);
                if (parsed.status === 'completed' && parsed.result) {
                  highlightsBuffer = parsed.result;
                  break;
                }
              } catch (e) {
                // Continue processing
              }
            }
          }
        }
      }

      // Update state with results
      setFullMeetingData(prev => ({
        ...prev,
        recap: recapBuffer,
        highlights: highlightsBuffer,
        status: 'COMPLETED'
      }));

      toast.success('Meeting analysis completed');
    } catch (error) {
      console.error('Error processing with LLM:', error);
      toast.error('Failed to analyze meeting');
      setFullMeetingData(prev => ({ ...prev, status: 'FAILED' }));
    } finally {
      setIsProcessing(false);
      setProcessingStep('');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="w-full max-w-4xl mx-auto p-4 space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ y: -20 }}
        animate={{ y: 0 }}
        className="text-center space-y-2"
      >
        <h1 className="text-3xl font-bold text-white">Meeting Complete</h1>
        <div className="flex items-center justify-center gap-2">
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-blue-400" />
              <span className="text-white/70">{processingStep}</span>
            </>
          ) : fullMeetingData.status === 'COMPLETED' ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-green-400" />
              <span className="text-white/70">Analysis complete</span>
            </>
          ) : fullMeetingData.status === 'FAILED' ? (
            <>
              <AlertCircle className="h-4 w-4 text-red-400" />
              <span className="text-white/70">Analysis failed</span>
            </>
          ) : (
            <Badge variant="secondary">Processing</Badge>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Meeting Info */}
        <motion.div initial={{ x: -20 }} animate={{ x: 0 }}>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <User className="h-5 w-5" />
                Meeting Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 text-white/80">
                <User className="h-4 w-4" />
                <span>{fullMeetingData.name}</span>
              </div>
              <div className="flex items-center gap-3 text-white/80">
                <Mail className="h-4 w-4" />
                <span>{fullMeetingData.email}</span>
              </div>
              {fullMeetingData.phone && (
                <div className="flex items-center gap-3 text-white/80">
                  <Phone className="h-4 w-4" />
                  <span>{fullMeetingData.phone}</span>
                </div>
              )}
              {fullMeetingData.type && (
                <div className="flex items-center gap-3 text-white/80">
                  <FileText className="h-4 w-4" />
                  <span>{fullMeetingData.type}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-white/80">
                <Clock className="h-4 w-4" />
                <span>Duration: {formatDuration(fullMeetingData.duration)}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Analysis Summary */}
        <motion.div initial={{ x: 20 }} animate={{ x: 0 }}>
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isProcessing ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-2" />
                    <p className="text-white/70">{processingStep}</p>
                  </div>
                </div>
              ) : fullMeetingData.recap ? (
                <div className="space-y-2">
                  <div className="text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Recap generated
                  </div>
                  <div className="text-green-400 text-sm flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Highlights extracted
                  </div>
                  <p className="text-white/70 text-sm">
                    Your meeting has been fully analyzed with AI-generated insights.
                  </p>
                </div>
              ) : (
                <div className="text-white/70 text-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                    Analysis incomplete
                  </div>
                  <p>There was an issue processing your meeting. The transcript is still available below.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Transcript */}
      <motion.div initial={{ y: 20 }} animate={{ y: 0 }}>
        <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Transcript
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-white/5 rounded-lg p-4 max-h-64 overflow-y-auto">
              <pre className="text-white/80 text-sm whitespace-pre-wrap">
                {fullMeetingData.transcript || 'No transcript available'}
              </pre>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recap */}
      {fullMeetingData.recap && (
        <motion.div 
          initial={{ y: 20 }} 
          animate={{ y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                AI-Generated Recap
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white/5 rounded-lg p-4">
                <pre className="text-white/80 text-sm whitespace-pre-wrap">
                  {fullMeetingData.recap}
                </pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Highlights */}
      {fullMeetingData.highlights && (
        <motion.div 
          initial={{ y: 20 }} 
          animate={{ y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Key Highlights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-white/5 rounded-lg p-4">
                <pre className="text-white/80 text-sm whitespace-pre-wrap">
                  {fullMeetingData.highlights}
                </pre>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Actions */}
      <motion.div 
        initial={{ y: 20 }} 
        animate={{ y: 0 }}
        transition={{ delay: 0.6 }}
        className="flex justify-center"
      >
        <Button
          onClick={onStartOver}
          className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Start New Meeting
        </Button>
      </motion.div>
    </motion.div>
  );
}
