import { useAnimations } from "@/stores/use-animations";
import { useFiles } from "@/stores/use-files";
import { Code2, Pause, Play, Square } from "lucide-react";

interface NavbarProps {
  onOpenModal: () => void;
}

export const Navbar = ({ onOpenModal }: NavbarProps) => {
  const { files } = useFiles();
  const { isPlaying, setIsPlaying, stop } = useAnimations();

  return (
    <header className="flex justify-between h-10 items-center border-b border-[#404040] bg-[#2D2D2D] px-4">
      <nav className="flex gap-4">
        <h1 className="text-lg font-semibold text-white">CSS Motion Lab</h1>

        {files.length !== 0 && (
          <div className="flex space-x-2">
            <button
              className="text-white rounded p-1 hover:bg-[#404040]"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
            <button
              className="text-white rounded p-1 hover:bg-[#404040]"
              onClick={stop}
            >
              <Square className="h-4 w-4" />
            </button>
          </div>
        )}
      </nav>

      {files.length !== 0 && (
        <nav>
          <button
            className="flex items-center rounded bg-[#00A8FF] px-3 py-1 text-sm text-white hover:bg-[#0088CC]"
            // onClick={handleExport}
            onClick={onOpenModal}
          >
            <Code2 className="mr-2 h-4 w-4" />
            Export CSS
          </button>
        </nav>
      )}
    </header>
  );
};