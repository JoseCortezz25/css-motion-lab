import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FileContent } from "@/types/file";
import type { Animation } from "@/types/animations";
import { Maximize2 } from "lucide-react";
import { useAnimations } from "@/stores/use-animations";

interface PreviewProps {
  files: FileContent[]
  animations: Animation[]
  duration: number
  isPlaying: boolean
  currentTime: number
  maxWidth?: number
  maxHeight?: number
  contentWidth: number
  contentHeight: number
}

export function Preview({
  files,
  maxWidth = 500,
  maxHeight = 400,
  contentWidth,
  contentHeight
}: PreviewProps) {
  const { animations, duration, isPlaying, currentTime } = useAnimations();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });

  // Existing layout effect for container dimensions
  useLayoutEffect(() => {
    const adjustContent = () => {
      const container = containerRef.current;
      if (!container) return;

      const padding = 20; // 10px padding in each side
      const maxWidthContainer = maxWidth - padding;
      const maxHeightContainer = maxHeight - padding;

      const scaleX = maxWidthContainer / contentWidth;
      const scaleY = maxHeightContainer / contentHeight;
      const scale = Math.min(scaleX, scaleY, 1);

      const scaledWidth = contentWidth * scale + padding;
      const scaledHeight = contentHeight * scale + padding;

      setContainerDimensions({
        width: scaledWidth,
        height: scaledHeight
      });

      console.log("scale", scale);
    };

    adjustContent();
    window.addEventListener("resize", adjustContent);

    return () => {
      window.removeEventListener("resize", adjustContent);
    };
  }, [contentWidth, contentHeight, maxHeight, maxWidth]);

  // Update iframe content and animations
  useEffect(() => {
    const htmlFile = files.find((file) => file.type === "text/html");
    if (!htmlFile || !iframeRef.current) return;

    const doc = iframeRef.current.contentDocument;
    if (!doc) return;

    // Keep existing content but add animations CSS
    const animationsCSS = generateAnimationCSS(animations, duration);
    const styleElement = doc.createElement('style');
    styleElement.textContent = animationsCSS;

    doc.head.appendChild(styleElement);

    // Update animation states
    animations.forEach(animation => {
      const element = doc.querySelector(animation.element);
      if (element instanceof HTMLElement) {
        element.style.animationPlayState = isPlaying ? 'running' : 'paused';
        element.style.animationDelay = `-${currentTime}ms`;
      }
    });

  }, [files, animations, duration, isPlaying, currentTime]);

  return (
    <div className="relative flex-1 bg-[#1E1E1E]">
      <div className="absolute right-4 top-4 z-10">
        <button className="rounded bg-[#404040] p-2 hover:bg-[#505050]">
          <Maximize2 className="text-white h-4 w-4" />
        </button>
      </div>
      <div ref={containerRef} className="relative flex items-center justify-center h-full">
        <iframe
          ref={iframeRef}
          className="w-full h-full border-none"
          style={{
            transform: `scale(${Math.min(
              containerDimensions.width / contentWidth,
              containerDimensions.height / contentHeight
            )})`,
            transformOrigin: 'center'
          }}
          srcDoc={files.find((file) => file.type === "text/html")?.content || ""}
        />
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
      ${animation.element} {
        animation: ${keyframesName} ${duration}ms linear infinite;
        animation-play-state: paused;
      }
    `;
  }).join('\n');
}

