import { FileContent } from '@/types/file';
import { create } from 'zustand';

type State = {
  files: FileContent[]
};

type Action = {
  setValues: (values: FileContent[]) => void
}

export const useFiles = create<State & Action>((set) => ({
  files: [],
  setValues: (values: FileContent[]) => set({ files: values })
}));

