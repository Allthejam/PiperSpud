'use client';

import React from 'react';
import { Navbar } from '@/components/Navbar';
import { SocialHub } from '@/components/SocialHub';
import { Footer } from '@/components/Footer';
import { LiveChatWidget } from '@/components/LiveChatWidget';
import { VisualPencilOverlay } from '@/components/VisualPencilOverlay';
import { Users, Video, Camera } from 'lucide-react';

export default function SocialPage() {
  return (
    <div className="min-h-screen bg-tartan-dark flex flex-col relative">
      <VisualPencilOverlay />
      <Navbar />

      <SocialHub />

      <Footer />
      <LiveChatWidget />
    </div>
  );
}
