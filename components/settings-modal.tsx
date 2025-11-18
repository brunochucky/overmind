
'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { Settings, Save, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsModalProps {
  open: boolean;
  onClose: () => void;
}

export function SettingsModal({ open, onClose }: SettingsModalProps) {
  const [highlightContext, setHighlightContext] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open) {
      loadSettings();
    }
  }, [open]);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const settings = await response.json();
        setHighlightContext(settings?.highlightContext || 'interview with company about needs and opportunities');
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          highlightContext,
        }),
      });

      if (response.ok) {
        toast.success('Settings saved successfully');
        onClose();
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-white/10 border-white/20 backdrop-blur-sm text-white max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Application Settings
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 text-purple-300">
                <Sparkles className="h-4 w-4" />
                <h3 className="font-semibold">AI Highlights Configuration</h3>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="highlight-context" className="text-white/90">
                  Highlight Context
                </Label>
                <Input
                  id="highlight-context"
                  value={highlightContext}
                  onChange={(e) => setHighlightContext(e.target.value)}
                  placeholder="e.g., interview with company about needs and opportunities"
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/70"
                  disabled={isLoading}
                />
                <p className="text-xs text-white/80">
                  This context helps the AI identify relevant highlights during meetings
                </p>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 text-white/90 bg-transparent border-white/30 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={saveSettings}
              disabled={isSaving || isLoading}
              className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
            >
              {isSaving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
