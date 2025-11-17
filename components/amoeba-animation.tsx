
'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface AmoebaAnimationProps {
  onClick?: () => void;
  isRecording?: boolean;
  size?: 'small' | 'medium' | 'large';
}

export function AmoebaAnimation({ onClick, isRecording = false, size = 'large' }: AmoebaAnimationProps) {
  const [isHovered, setIsHovered] = useState(false);
  
  const sizeClasses = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  };

  return (
    <div className="flex items-center justify-center">
      <motion.div
        className={`${sizeClasses[size]} cursor-pointer relative`}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Main amoeba shape */}
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 opacity-90"
          animate={{
            scale: isRecording ? [1, 1.1, 1] : isHovered ? 1.05 : 1,
            rotate: isRecording ? 360 : 0,
            borderRadius: isRecording 
              ? ["50%", "40% 60% 50% 70%", "60% 40% 70% 50%", "50%"]
              : ["50%", "60% 40% 70% 50%", "40% 60% 50% 70%", "50%"],
          }}
          transition={{
            duration: isRecording ? 2 : 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Inner pulse */}
        <motion.div
          className="absolute inset-4 rounded-full bg-gradient-to-br from-purple-300 via-blue-300 to-indigo-300 opacity-60"
          animate={{
            scale: isRecording ? [0.8, 1.2, 0.8] : [0.9, 1.1, 0.9],
            opacity: isRecording ? [0.6, 0.3, 0.6] : [0.4, 0.6, 0.4],
          }}
          transition={{
            duration: isRecording ? 1.5 : 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Core */}
        <motion.div
          className="absolute inset-8 rounded-full bg-gradient-to-br from-white via-purple-200 to-blue-200 opacity-80"
          animate={{
            scale: isRecording ? [1, 0.8, 1] : [0.95, 1.05, 0.95],
          }}
          transition={{
            duration: isRecording ? 1 : 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />

        {/* Glowing effect when recording */}
        {isRecording && (
          <motion.div
            className="absolute -inset-2 rounded-full bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-500 opacity-30 blur-lg"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        )}
      </motion.div>
    </div>
  );
}
