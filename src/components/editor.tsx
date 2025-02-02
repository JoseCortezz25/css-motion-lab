import { useState, useEffect, useCallback } from "react";
import { Timeline } from "./timeline";
import { PropertiesSidebar } from "./properties-sidebar";
import { Preview } from "./preview";
import type { FileContent } from "@/types/file";
import type { Animation, Keyframe } from "@/types/animations";
import { ChevronRight, ChevronDown } from "lucide-react";
import { useAnimations } from "@/stores/use-animations";

interface EditorProps {
  files: FileContent[]
  isPlaying: boolean
}

export function Editor({ files, isPlaying: parentIsPlaying }: EditorProps) {
  // const [selectedElement, setSelectedElement] = useState<string | null>(null);
  // const [selectedKeyframe, setSelectedKeyframe] = useState<Keyframe | null>(null);
  // const [animations, setAnimations] = useState<Animation[]>([]);
  // const [duration, setDuration] = useState(5000);
  const [showTimeline, setShowTimeline] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  // const [isPlaying, setIsPlaying] = useState(parentIsPlaying);
  const { animations, duration, isPlaying, setIsPlaying } = useAnimations();

  useEffect(() => {
    setIsPlaying(parentIsPlaying);
  }, [parentIsPlaying]);

  useEffect(() => {
    let animationFrame: number;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateTime = (timestamp: number) => {
      setCurrentTime((prevTime) => {
        const newTime = prevTime + 16.67; // Aproximadamente 60 FPS
        return newTime >= duration ? 0 : newTime;
      });
      animationFrame = requestAnimationFrame(updateTime);
    };

    if (isPlaying) {
      animationFrame = requestAnimationFrame(updateTime);
    }

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [isPlaying, duration]);

  // const handleAnimationChange = useCallback((newAnimation: Animation) => {
  //   setAnimations((prevAnimations) => {
  //     const index = prevAnimations.findIndex((a) => a.element === newAnimation.element);
  //     if (index !== -1) {
  //       return [...prevAnimations.slice(0, index), newAnimation, ...prevAnimations.slice(index + 1)];
  //     }
  //     return [...prevAnimations, newAnimation];
  //   });
  // }, []);


  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#2D2D2D]">
      <div className="flex h-full w-full overflow-hidden">
        <div className="flex w-[calc(100%-300px)] flex-col">
          {/* Preview */}
          <div className="flex flex-1 border-b border-[#404040]">
            <Preview
              files={files}
              animations={animations}
              duration={duration}
              isPlaying={isPlaying}
              currentTime={currentTime}
              contentWidth={files[0].width}
              contentHeight={files[0].height}
            />
          </div>

          {/* Collapse Timeline */}
          <div className="flex flex-col bg-[#2D2D2D]">
            <button
              className="flex text-white items-center px-2 py-1 hover:bg-[#404040]"
              onClick={() => setShowTimeline(!showTimeline)}
            >
              {showTimeline ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              <span className="ml-1 text-sm text-white">Timeline</span>
            </button>
            <div className="w-full">
              {showTimeline && (
                <Timeline files={files} />
              )}
            </div>
          </div>
        </div>
        <div className="w-[300px] ">
          <PropertiesSidebar />
        </div>
      </div>
    </div>
  );
}

