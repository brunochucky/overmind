
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { OvermindLogo } from './overmind-logo';
import * as z from 'zod';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Mail, Phone, FileText, ArrowRight, ArrowLeft, Globe } from 'lucide-react';
import { MeetingData } from './landing-client';
import { toast } from 'sonner';

const meetingSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().optional(),
  type: z.string().optional(),
  language: z.string().default('en-US'),
});

type MeetingFormData = z.infer<typeof meetingSchema>;

interface MeetingFormProps {
  onSubmit: (data: MeetingData) => void;
  initialData: MeetingData;
}

export function MeetingForm({ onSubmit, initialData }: MeetingFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [language, setLanguage] = useState(initialData.language || 'en-US');

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<MeetingFormData>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      ...initialData,
      language: initialData.language || 'en-US',
    },
    mode: 'onChange',
  });

  const handleFormSubmit = async (data: MeetingFormData) => {
    setIsLoading(true);
    try {
      // Create meeting record in database
      const response = await fetch('/api/meetings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          status: 'PENDING',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create meeting');
      }

      const meeting = await response.json();
      
      toast.success('Meeting details saved successfully');
      onSubmit({ ...data, id: meeting.id });
    } catch (error) {
      console.error('Error creating meeting:', error);
      toast.error('Failed to save meeting details');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center min-h-screen"
    >
      <Card className="w-full max-w-md bg-white/10 border-white/20 backdrop-blur-sm">
        <CardHeader>
          <OvermindLogo className='mx-auto' />
          <CardTitle className="text-white/70 text-sm text-center">
            Meeting Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {/* Name field */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/90 flex items-center gap-2">
                Name *
              </Label>
              <div className="relative">
                <Input
                  id="name"
                  {...register('name')}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10"
                  placeholder="Enter your name or company"
                />
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
              </div>
              {errors.name && (
                <p className="text-red-400 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Email field */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/90 flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email *
              </Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  {...register('email')}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10"
                  placeholder="Enter your email address"
                />
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
              </div>
              {errors.email && (
                <p className="text-red-400 text-sm">{errors.email.message}</p>
              )}
            </div>

            {/* Phone field */}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-white/90 flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone
              </Label>
              <div className="relative">
                <Input
                  id="phone"
                  {...register('phone')}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10"
                  placeholder="Enter your phone number"
                />
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
              </div>
            </div>

            {/* Type field */}
            <div className="space-y-2">
              <Label htmlFor="type" className="text-white/90 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Meeting Type
              </Label>
              <div className="relative">
                <Input
                  id="type"
                  {...register('type')}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/50 pl-10"
                  placeholder="e.g., Sales call, Interview, Planning"
                />
                <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
              </div>
            </div>

            {/* Language field */}
            <div className="space-y-2">
              <Label htmlFor="language" className="text-white/90 flex items-center gap-2">
                <Globe className="h-4 w-4" />
                Transcription Language *
              </Label>
              <Select
                value={language}
                onValueChange={(value) => {
                  setLanguage(value);
                  setValue('language', value, { shouldValidate: true });
                }}
              >
                <SelectTrigger className="bg-white/10 border-white/20 text-white">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en-US">🇺🇸 English</SelectItem>
                  <SelectItem value="pt-BR">🇧🇷 Portuguese (Brazil)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1 text-white/90 bg-transparent border-white/30 hover:bg-white/10 hover:text-white"
                onClick={() => window.history.back()}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                disabled={!isValid || isLoading}
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                {isLoading ? (
                  'Saving...'
                ) : (
                  <>
                    Start Recording
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
}
