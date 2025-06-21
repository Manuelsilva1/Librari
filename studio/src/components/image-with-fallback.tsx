"use client";

import Image, { ImageProps } from 'next/image';
import { useState, useEffect } from 'react';

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: ImageProps['src'];
}

export function ImageWithFallback({
  src,
  fallbackSrc = 'https://placehold.co/600x900?text=Sin+imagen',
  ...props
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState<ImageProps['src']>(src);

  useEffect(() => {
    setImgSrc(src);
  }, [src]);

  return (
    <Image
      {...props}
      src={imgSrc}
      onError={() => setImgSrc(fallbackSrc)}
    />
  );
}

