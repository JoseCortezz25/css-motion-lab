"use client";

import { useState } from "react";
import { FileUploader } from "@/components/file-uploader";
import { Editor } from "@/components/editor";
import { useFiles } from "@/stores/use-files";
import { Navbar } from "@/components/navbar";
import { generateCSS } from "@/lib/export-animation";
import { useAnimations } from "@/stores/use-animations";

export default function BuilderPage() {
  const [showExportModal, setShowExportModal] = useState(false);
  const { animations, duration } = useAnimations();
  const { files } = useFiles();

  return (
    <div className="flex h-screen flex-col bg-[#2D2D2D] ">
      {files.length !== 0 && <Navbar onOpenModal={() => setShowExportModal(prev => !prev)} />}

      <main className="flex flex-1 overflow-hidden">
        {files.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <FileUploader />
          </div>
        ) : (
          // <div className="flex flex-col items-start w-full h-full">
          <Editor files={files} isPlaying={false} />
          // </div>
        )}
      </main>

      {/* TODO: Add functionality code to export*/}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="w-3/4 max-w-2xl rounded-lg bg-[#2D2D2D] p-6">
            <h2 className="mb-4 text-xl font-semibold text-white">Exported CSS Animation</h2>
            <pre className="max-h-96 overflow-auto rounded bg-[#1E1E1E] p-4 text-sm">
              {/* <code>{generateCSS(animations, duration)}</code> */}
              <code className="text-white">
                {generateCSS(animations, duration)}
              </code>
            </pre>
            <div className="mt-4 flex justify-end">
              <button
                className="rounded bg-[#00A8FF] px-4 py-2 text-white hover:bg-[#0088CC]"
                onClick={() => setShowExportModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

