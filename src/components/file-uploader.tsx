"use client";

import { useState, type ChangeEvent } from "react";
import type { FileContent } from "@/types/file";
import { Upload } from "lucide-react";
import { useFiles } from "@/stores/use-files";

interface FileUploaderProps {
}

export function FileUploader({ }: FileUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const setFiles = useFiles((state) => state.setValues);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleFiles = (files: FileList) => {
    const uploadedFiles: FileContent[] = [];
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target && typeof e.target.result === "string") {
          const parser = new DOMParser();
          const doc = parser.parseFromString(e.target.result, "text/html");
          const width = doc.documentElement.scrollWidth;
          const height = doc.documentElement.scrollHeight;

          uploadedFiles.push({
            name: file.name,
            content: e.target.result,
            type: file.type,
            width: width,
            height: height
          });

          if (uploadedFiles.length === files.length) {
            // onFilesUploaded(uploadedFiles);
            setFiles(uploadedFiles);
          }
        }
      };
      reader.readAsText(file);
    });
  };

  return (
    <div
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${dragActive ? "border-[#00A8FF] bg-[#00A8FF]/10" : "border-[#404040] hover:border-[#666666]"
        }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <Upload className="mb-4 h-12 w-12 text-[#666666]" />
      <input type="file" id="file-upload" multiple onChange={handleChange} accept=".html,.css" className="hidden" />
      <label htmlFor="file-upload" className="mb-2 cursor-pointer text-[#00A8FF] hover:text-[#33B7FF]">
        Click to upload
      </label>
      <p className="text-sm text-gray-400">or drag and drop your HTML and CSS files here</p>
    </div>
  );
}

