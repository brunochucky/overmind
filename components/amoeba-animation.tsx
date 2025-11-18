
'use client';

import { motion } from 'framer-motion';

interface AmoebaAnimationProps {
  onClick?: () => void;
  isRecording?: boolean;
  isProcessing?: boolean;
  statusText?: string;
  size?: 'small' | 'medium' | 'large';
}

export function AmoebaAnimation({ 
  onClick, 
  isRecording = false, 
  isProcessing = false,
  statusText,
  size = 'large' 
}: AmoebaAnimationProps) {
  
  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  };

  const idleAnimation = {
    rotate: [0, 45, 0],
    borderRadius: ["50%", "45% 55% 60% 40%", "55% 45% 40% 60%", "50%"],
  };

  const recordingAnimation = {
    scale: [1, 1.05, 1],
    rotate: 360,
    borderRadius: ["50%", "60% 40% 70% 30%", "40% 60% 30% 70%", "50%"],
  };
  
  const processingAnimation = {
    scale: [1, 0.9, 1],
    rotate: [0, 90, 180, 270, 360],
    borderRadius: ["50%", "30% 70% 30% 70%", "70% 30% 70% 30%", "50%"],
  };

  const getAnimation = () => {
    if (isProcessing) return processingAnimation;
    if (isRecording) return recordingAnimation;
    return idleAnimation;
  };

  const getTransition = () => {
    if (isProcessing) return { duration: 1.5, repeat: Infinity, ease: "linear" };
    if (isRecording) return { duration: 3, repeat: Infinity, ease: "easeInOut" };
    return { duration: 8, repeat: Infinity, ease: "easeInOut" };
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} cursor-pointer relative flex items-center justify-center`}
        onClick={onClick}
        whileHover={!isRecording && !isProcessing ? { scale: 1.05 } : {}}
        whileTap={!isRecording && !isProcessing ? { scale: 0.95 } : {}}
      >
        {/* Text Overlay */}
        {statusText && (
          <span className="relative z-10 text-white font-semibold text-lg pointer-events-none">
            {statusText}
          </span>
        )}

        {/* Main amoeba shape */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-cyan-500 to-indigo-600"
          animate={getAnimation()}
          transition={getTransition()}
        />

        {/* Inner pulse */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-400 via-cyan-300 to-indigo-400 opacity-70"
          animate={{
            scale: isRecording ? [0.9, 1.1, 0.9] : isProcessing ? [1.1, 0.9, 1.1] : [1, 1.05, 1],
            opacity: isRecording ? [0.7, 0.5, 0.7] : isProcessing ? [0.8, 0.6, 0.8] : [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: isRecording ? 2 : isProcessing ? 1 : 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Core */}
        <motion.div
          className="absolute inset-8 rounded-full bg-gradient-to-br from-white/80 via-cyan-200/80 to-purple-200/80"
          animate={{
            scale: isRecording ? [1, 0.9, 1] : isProcessing ? [0.9, 1, 0.9] : [1.05, 0.95, 1.05],
          }}
          transition={{
            duration: isRecording ? 1.5 : isProcessing ? 0.5 : 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Glowing effect */}
        <motion.div
          className="absolute -inset-2 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 opacity-40 blur-xl"
          animate={{
            scale: isRecording ? [1.1, 1.2, 1.1] : isProcessing ? [1.2, 1.1, 1.2] : [1, 1.1, 1],
            opacity: isRecording ? [0.4, 0.7, 0.4] : isProcessing ? [0.7, 0.4, 0.7] : [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: isRecording ? 2 : isProcessing ? 1 : 5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.div>
    </div>
  );
}
