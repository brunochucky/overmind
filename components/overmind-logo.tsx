'use client';

import React from 'react';

interface OvermindLogoProps {
  // Optional: Add props for different sizes or additional classes if needed
  // For now, it will render with a fixed max-width and default styling.
  className?: string;
  textClassName?: string;
  imageClassName?: string;
}

export function OvermindLogo({ className, textClassName, imageClassName }: OvermindLogoProps) {
  return (
    <div className={`flex items-center ${className || ''}`}>
      <img
        src="/overmind-logo.webp"
        alt="Overmind Logo"
        style={{ maxWidth: '100px', height: 'auto' }}
        className={`mr-2 ${imageClassName || ''}`}
      />
      <h1 className={`text-4xl font-bold text-white uppercase ${textClassName || ''}`}>
        Overmind
      </h1>
    </div>
  );
}
