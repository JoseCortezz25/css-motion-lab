import React, { useRef, useState, useLayoutEffect, useEffect } from 'react';
import { Maximize2 } from 'lucide-react';
import { useAnimations } from '@/stores/use-animations';
import { FileContent } from '@/types/file';
import type { Animation } from "@/types/animations";

interface PreviewProps {
  files: FileContent[];
  animations: Animation[];
  duration: number;
  isPlaying: boolean;
  currentTime: number;
  maxWidth?: number;
  maxHeight?: number;
  contentWidth: number;
  contentHeight: number;
}

export function Preview({
  files,
  maxWidth = 500,
  maxHeight = 400
}: PreviewProps) {
  const { animations, duration, isPlaying, currentTime } = useAnimations();
  const containerRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  const adjustContentIntoContainer = () => {
    const container = containerRef.current;
    if (!container) return;
    const children = container.querySelector('*');

    const contentWidth = children?.clientWidth || 0;
    const contentHeight = children?.clientHeight || 0;

    const scale = Math.min(maxWidth / contentWidth, maxHeight / contentHeight);
    setScale(scale);
  };

  useLayoutEffect(() => {
    adjustContentIntoContainer();
  }, []);

  const setAnimationsIntoIframe = () => {
    const content = contentRef.current;
    if (!content) return;

    console.log("isPlaying", isPlaying);

    if (isPlaying) {
      content.style.setProperty('--play-state', 'running');
    }

    if (!isPlaying) {
      content.style.setProperty('--play-state', 'paused');
    }


    const animationsCSS = generateAnimationCSS(animations, duration);
    const styleElement = document.createElement('style');
    styleElement.textContent = animationsCSS;
    // styleElement.textContent = animationsCSS;

    content.appendChild(styleElement);
  };


  useEffect(() => {
    setAnimationsIntoIframe();
  }, [isPlaying]);

  return (
    <div className="relative flex-1 bg-[#1E1E1E]">
      <div className="relative h-full w-full overflow-scroll">
        <div
          ref={containerRef}
          className="relative overflow-hidden flex items-center justify-center"
          style={{
            transformOrigin: 'center',
            height: '100%'
          }}
        >
          <div
            ref={contentRef}
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transform: `scale(${scale})`
            }}
            dangerouslySetInnerHTML={{ __html: files.find((file) => file.type === "text/html")?.content || "" }}
          />
        </div>
      </div>
    </div>
  );
}

function generateAnimationCSS(animations: Animation[], duration: number): string {
  return animations.map(animation => {
    const keyframesName = `animation_${animation.element.replace(/[^a-zA-Z0-9]/g, '_')}`;

    const keyframes = animation.keyframes
      .map(keyframe => {
        const percentage = (keyframe.time / duration) * 100;
        const properties = Object.entries(keyframe.properties)
          .map(([prop, value]) => `${prop}: ${value};`)
          .join(' ');
        return `${percentage}% { ${properties} }`;
      })
      .join('\n');

    return `
      @keyframes ${keyframesName} {
        ${keyframes}
      }
      .${animation.element} {
        animation: ${keyframesName} ${duration}ms linear infinite;
        animation-play-state: var(--play-state);
      }
    `;
  }).join('\n');
}

