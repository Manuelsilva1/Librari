"use client";

import { useState } from 'react';
import Image from 'next/image';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { X } from 'lucide-react';

interface LightboxClientProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  triggerClassName?: string;
}

export function LightboxClient({ src, alt, width, height, triggerClassName }: LightboxClientProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <div className={`cursor-zoom-in relative overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow ${triggerClassName}`}>
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            className="w-full h-auto object-contain"
            priority 
          />
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-3xl p-2 bg-transparent border-none shadow-none !rounded-none">
        <div className="relative">
           <Image
            src={src}
            alt={alt}
            width={1200} 
            height={1800}
            className="w-full h-auto max-h-[90vh] object-contain rounded-md"
          />
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-2 right-2 p-2 bg-black/50 text-white rounded-full hover:bg-black/75 transition-colors"
            aria-label="Close lightbox"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
