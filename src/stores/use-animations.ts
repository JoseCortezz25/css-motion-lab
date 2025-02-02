import { create } from 'zustand';
import type { Animation, Keyframe } from "@/types/animations";

interface AnimationsState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  animations: Animation[];
  selectedElement: string | null;
  selectedKeyframe: Keyframe | null;
  animationFrame: number | null;

  // Actions
  setIsPlaying: (isPlaying: boolean) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  setSelectedElement: (element: string | null) => void;
  setSelectedKeyframe: (keyframe: Keyframe | null) => void;
  updateAnimation: (newAnimation: Animation) => void;
  addKeyframe: (element: string, time: number) => void;
  updateKeyframe: (element: string, keyframe: Keyframe) => void;
  stop: () => void;
}

export const useAnimations = create<AnimationsState>((set, get) => ({
  isPlaying: false,
  currentTime: 0,
  duration: 5000,
  animations: [],
  selectedElement: null,
  selectedKeyframe: null,
  animationFrame: null,

  setIsPlaying: (isPlaying) => {
    set({ isPlaying });
    
    if (isPlaying) {
      const updateTime = () => {
        const { duration } = get();
        set((state) => ({
          currentTime: state.currentTime + 16.67 >= duration 
            ? 0 
            : state.currentTime + 16.67,
          animationFrame: requestAnimationFrame(updateTime)
        }));
      };
      
      requestAnimationFrame(updateTime);
    } else {
      const { animationFrame } = get();
      if (animationFrame) cancelAnimationFrame(animationFrame);
    }
  },

  setCurrentTime: (currentTime) => set({ currentTime }),
  setDuration: (duration) => set({ duration }),
  setSelectedElement: (selectedElement) => set({ selectedElement }),
  setSelectedKeyframe: (selectedKeyframe) => set({ selectedKeyframe }),

  updateAnimation: (newAnimation) => set((state) => ({
    animations: state.animations.map(a => 
      a.element === newAnimation.element ? newAnimation : a
    )
  })),

  addKeyframe: (element, time) => set((state) => {
    const animation = state.animations.find(a => a.element === element);
    const newKeyframe = { time, properties: {} };
    
    const updatedAnimation = animation 
      ? {
          ...animation,
          keyframes: [...animation.keyframes, newKeyframe].sort((a, b) => a.time - b.time)
        }
      : {
          element,
          keyframes: [newKeyframe]
        };

    return {
      animations: [
        ...state.animations.filter(a => a.element !== element),
        updatedAnimation
      ],
      selectedKeyframe: newKeyframe,
      selectedElement: element,
      currentTime: time
    };
  }),

  updateKeyframe: (element, keyframe) => set((state) => {
    const animation = state.animations.find(a => a.element === element);
    if (!animation) return state;

    const updatedKeyframes = [...animation.keyframes];
    const index = updatedKeyframes.findIndex(kf => kf.time === keyframe.time);
    if (index !== -1) {
      updatedKeyframes[index] = keyframe;
    }
    const sortedKeyframes = updatedKeyframes.sort((a, b) => a.time - b.time);

    return {
      animations: [
        ...state.animations.filter(a => a.element !== element),
        { ...animation, keyframes: sortedKeyframes }
      ],
      selectedKeyframe: updatedKeyframes[index],
      currentTime: keyframe.time
    };
  }),

  stop: () => {
    const { animationFrame } = get();
    if (animationFrame) cancelAnimationFrame(animationFrame);
    set({ 
      isPlaying: false, 
      currentTime: 0,
      animationFrame: null 
    });
  }
}));

