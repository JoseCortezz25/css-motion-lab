import { useState, useEffect } from "react";
import { ChevronRight, ChevronDown, Settings } from "lucide-react";
import { useAnimations } from "@/stores/use-animations";

interface PropertiesSidebarProps { };

const propertyGroups = {
  Transform: ["translateX", "translateY", "scale", "rotate", "skew"],
  Appearance: ["opacity", "color", "backgroundColor"],
  Size: ["width", "height"],
  Position: ["top", "left", "right", "bottom"]
};

export function PropertiesSidebar({ }: PropertiesSidebarProps) {
  const {
    selectedElement,
    selectedKeyframe,
    animations,
    updateAnimation
  } = useAnimations();
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(["Transform"]));
  const [properties, setProperties] = useState<Record<string, string>>({});

  useEffect(() => {
    if (selectedElement && selectedKeyframe) {
      setProperties(selectedKeyframe.properties);
    } else {
      setProperties({});
    }
  }, [selectedElement, selectedKeyframe]);

  const toggleGroup = (group: string) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (expandedGroups.has(group)) {
      newExpandedGroups.delete(group);
    } else {
      newExpandedGroups.add(group);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const handlePropertyChange = (property: string, value: string) => {
    const newProperties = { ...properties, [property]: value };
    setProperties(newProperties);

    if (selectedElement && selectedKeyframe) {
      const animation = animations.find((a) => a.element === selectedElement);
      if (animation) {
        const updatedKeyframes = animation.keyframes.map((k) =>
          k.time === selectedKeyframe.time ? { ...k, properties: newProperties } : k
        );
        updateAnimation({ ...animation, keyframes: updatedKeyframes });
      }
    }
  };

  if (!selectedElement || !selectedKeyframe) {
    return (
      <div className="w-[300px] overflow-y-auto border-l border-[#404040] bg-[#2D2D2D] p-4">
        <div className="text-sm text-gray-400">Select an element and keyframe to edit properties</div>
      </div>
    );
  }

  return (
    <div className="w-[300px] h-full overflow-y-auto border-l border-[#404040] bg-[#2D2D2D]">
      <div className="border-b border-[#404040] p-4">
        <div className="flex items-center">
          <Settings className="mr-2 min-h-4 min-w-4 text-white" />
          <h2 className="text-sm font-medium text-white">
            Properties for {selectedElement} at {selectedKeyframe.time.toFixed(2)}s
          </h2>
        </div>
      </div>

      <div className="p-4 h-[cacl(100%-40px)] ">
        {Object.entries(propertyGroups).map(([group, props]) => (
          <div key={group} className="mb-4">
            <button
              className="flex w-full items-center justify-between rounded px-2 py-1 text-sm hover:bg-[#404040]"
              onClick={() => toggleGroup(group)}
            >
              <span className="text-white">{group}</span>
              {expandedGroups.has(group) ? <ChevronDown className="text-white h-4 w-4" /> : <ChevronRight className="text-white h-4 w-4" />}
            </button>
            {expandedGroups.has(group) && (
              <div className="mt-2 space-y-2">
                {props.map((prop) => (
                  <div key={prop} className="px-2">
                    <label className="mb-1 block text-xs text-gray-400">{prop}</label>
                    <input
                      type="text"
                      value={properties[prop] || ""}
                      onChange={(e) => handlePropertyChange(prop, e.target.value)}
                      className="w-full rounded bg-[#404040] px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-[#00A8FF]"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

