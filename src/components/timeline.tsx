import { useState, useEffect, useRef } from "react";
import type { FileContent } from "@/types/file";
import type { Keyframe } from "@/types/animations";
import { ChevronRight, ChevronDown, ZoomIn, ZoomOut } from "lucide-react";
import { useAnimations } from "@/stores/use-animations";

interface TimelineProps {
  files: FileContent[]
  // duration: number
  // setDuration: (duration: number) => void
  // selectedElement: string | null
  // setSelectedElement: (element: string | null) => void
  // animations: Animation[]
  // onAnimationChange: (animation: Animation) => void
  // isPlaying: boolean
  // currentTime: number
  // setCurrentTime: (time: number) => void
  // setSelectedKeyframe: (keyframe: Keyframe | null) => void
}

export function Timeline({ files }: TimelineProps) {
  const {
    duration,
    setDuration,
    selectedElement,
    setSelectedElement,
    animations,
    currentTime,
    addKeyframe,
    updateKeyframe,
    setSelectedKeyframe,
    setCurrentTime
  } = useAnimations();
  const [elements, setElements] = useState<string[]>([]);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState(1);
  const timelineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const htmlFile = files.find((file) => file.type === "text/html");
    if (htmlFile) {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlFile.content, "text/html");
      const allElements = Array.from(doc.body.getElementsByTagName("*"));
      setElements(allElements.map((el) => el.id || el.className || el.tagName.toLowerCase()));
    }
  }, [files]);

  const toggleGroup = (group: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (expandedGroups.has(group)) {
      newExpandedGroups.delete(group);
    } else {
      newExpandedGroups.add(group);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const handleTimelineClick = (element: string, time: number) => {
    addKeyframe(element, time);
  };

  const handleKeyframeDrag = (element: string, keyframe: Keyframe, newTime: number) => {
    const updatedKeyframe = { ...keyframe, time: newTime };
    updateKeyframe(element, updatedKeyframe);
  };

  return (
    <div className="flex h-[200px] overflow-hidden bg-[#2D2D2D]">
      {/* Panel izquierdo con elementos */}
      <div className="w-64 overflow-y-auto border-r border-[#404040]">
        <div className="h-[58px] px-3 flex items-center text-white border-b border-[#404040]">
          <span>Elements</span>
        </div>
        {elements.map((element) => (
          <div
            key={element}
            className={`text-white group flex items-center border-b border-[#404040] px-2 py-1 ${selectedElement === element ? "bg-[#404040]" : "hover:bg-[#333333]"
              }`}
            onClick={() => setSelectedElement(element)}
          >
            <button
              className="mr-2"
              onClick={(e) => {
                e.stopPropagation();
                toggleGroup(element);
              }}
            >
              {expandedGroups.has(element) ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
            <span className="flex-1 truncate">{element}</span>
          </div>
        ))}
      </div>

      {/* Área de la línea de tiempo */}
      <div className="flex-1 overflow-hidden">
        <div className="flex items-center justify-between border-b border-[#404040] px-2 py-1">
          <div>
            <input
              type="number"
              value={duration / 1000}
              onChange={(e) => setDuration(Number.parseFloat(e.target.value) * 1000)}
              className="w-16 bg-[#404040] px-1 py-0.5 text-sm text-white"
            />
            <span className="ml-1 text-sm text-white">seconds</span>
          </div>
          <div>
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="mr-2">
              <ZoomOut className="h-4 w-4 text-white" />
            </button>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))}>
              <ZoomIn className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
        <div className="relative h-full overflow-x-auto overflow-y-hidden" ref={timelineRef}>
          <div style={{ width: `${duration * zoom}px`, height: "100%" }} className="overflow-scroll">
            {/* Regla de tiempo */}
            <div className="timeline-ruler h-6 border-b border-[#404040]">
              {Array.from({ length: Math.ceil(duration / 1000) }).map((_, i) => (
                <div key={i} className="absolute top-0 text-xs text-gray-400" style={{ left: `${i * 1000 * zoom}px` }}>
                  {i}s
                </div>
              ))}
            </div>

            {/* Pistas de animación */}
            <div className="relative">
              {elements.map((element) => (
                <div
                  key={element}
                  className="timeline-track group relative h-8 border-b border-[#404040]"
                  onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = e.clientX - rect.left + timelineRef.current!.scrollLeft;
                    const time = Math.max(0, Math.min(duration, x / zoom));
                    handleTimelineClick(element, time);
                    console.log("TIME", element, time);
                  }}
                >
                  {animations
                    .find((a) => a.element === element)
                    ?.keyframes.map((keyframe, index) => (
                      <div
                        key={index}
                        className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 cursor-move rounded-full bg-[#00A8FF] hover:bg-[#33B7FF]"
                        style={{
                          left: `${keyframe.time * zoom}px`
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedElement(element);
                          setSelectedKeyframe(keyframe);
                          setCurrentTime(keyframe.time);
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          const startX = e.clientX;
                          const startTime = keyframe.time;

                          const handleMouseMove = (moveEvent: MouseEvent) => {
                            const deltaX = moveEvent.clientX - startX;
                            const newTime = Math.max(0, Math.min(duration, startTime + deltaX / zoom));
                            handleKeyframeDrag(element, keyframe, newTime);
                          };

                          const handleMouseUp = () => {
                            document.removeEventListener("mousemove", handleMouseMove);
                            document.removeEventListener("mouseup", handleMouseUp);
                          };

                          document.addEventListener("mousemove", handleMouseMove);
                          document.addEventListener("mouseup", handleMouseUp);
                        }}
                      />
                    ))}
                </div>
              ))}
              {/*  Current time indicator */}
              <div className="absolute top-0 h-full w-0.5 bg-yellow-400" style={{ left: `${currentTime * zoom}px` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

