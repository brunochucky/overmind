

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Settings, LogOut, Plus, Loader2, Calendar, Clock, User, Mail, FileText, ChevronLeft, ChevronRight } from 'lucide-react';
import { SettingsModal } from './settings-modal';
import { toast } from 'sonner';
import Link from 'next/link';

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
}

interface PaginationInfo {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

export function DashboardClient() {
  const router = useRouter();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 10,
    totalCount: 0,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    fetchMeetings(1);
  }, []);

  const fetchMeetings = async (page: number) => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/meetings?page=${page}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch meetings');
      }

      const data = await response.json();
      setMeetings(data.meetings);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to load meetings');
    } finally {
      setIsLoading(false);
    }
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

  const formatDuration = (seconds?: number) => {
    if (!seconds) return 'N/A';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-4 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Overmind
            </h1>
            <p className="text-white/70">Your Meeting Dashboard</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex gap-2"
          >
            <Button
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              New Meeting
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
          </motion.div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-white/70" />
          </div>
        ) : meetings.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <Card className="bg-white/10 border-white/20 backdrop-blur-sm">
              <CardContent className="p-12">
                <FileText className="h-16 w-16 text-white/50 mx-auto mb-4" />
                <h3 className="text-white text-xl font-semibold mb-2">No meetings yet</h3>
                <p className="text-white/70 mb-6">Start recording your first meeting!</p>
                <Button
                  onClick={() => router.push('/')}
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Meeting
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            <div className="grid gap-4 mb-6">
              {meetings.map((meeting, index) => (
                <motion.div
                  key={meeting.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={`/dashboard/meetings/${meeting.id}`}>
                    <Card className="bg-white/10 border-white/20 backdrop-blur-sm hover:bg-white/15 transition-all cursor-pointer">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="text-white text-xl font-semibold truncate">
                                {meeting.name}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(meeting.status)}`}>
                                {meeting.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                              <div className="flex items-center gap-2 text-white/70">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{meeting.email}</span>
                              </div>

                              {meeting.type && (
                                <div className="flex items-center gap-2 text-white/70">
                                  <FileText className="h-4 w-4" />
                                  <span className="truncate">{meeting.type}</span>
                                </div>
                              )}

                              <div className="flex items-center gap-2 text-white/70">
                                <Clock className="h-4 w-4" />
                                <span>{formatDuration(meeting.duration)}</span>
                              </div>

                              <div className="flex items-center gap-2 text-white/70">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(meeting.createdAt)}</span>
                              </div>
                            </div>

                            {meeting.transcript && (
                              <div className="mt-3 text-white/60 text-sm line-clamp-2">
                                {meeting.transcript}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center justify-center gap-2"
              >
                <Button
                  onClick={() => fetchMeetings(pagination.page - 1)}
                  disabled={pagination.page === 1 || isLoading}
                  variant="ghost"
                  className="text-white/70 hover:text-white disabled:opacity-50"
                >
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => fetchMeetings(page)}
                      disabled={isLoading}
                      className={`${
                        page === pagination.page
                          ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'
                      }`}
                      size="sm"
                    >
                      {page}
                    </Button>
                  ))}
                </div>

                <Button
                  onClick={() => fetchMeetings(pagination.page + 1)}
                  disabled={pagination.page === pagination.totalPages || isLoading}
                  variant="ghost"
                  className="text-white/70 hover:text-white disabled:opacity-50"
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal open={showSettings} onClose={() => setShowSettings(false)} />
    </div>
  );
}
