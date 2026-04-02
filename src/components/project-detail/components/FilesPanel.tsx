"use client";

import { RefObject } from "react";
import { Download, Trash2 } from "lucide-react";
import { type ProjectFile } from "@/constants/project-detail";
import { Button } from "@/components/ui/button";

export function FilesPanel({
  files,
  fileInputRef,
  onFilesSelected,
  onDeleteFile,
}: {
  files: ProjectFile[];
  fileInputRef: RefObject<HTMLInputElement | null>;
  onFilesSelected: (fileList: FileList | null) => void;
  onDeleteFile: (id: string) => void;
}) {
  return (
    <section className="space-y-4">
      <input
        ref={fileInputRef as React.RefObject<HTMLInputElement>}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => onFilesSelected(e.target.files)}
      />

      <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center shadow-sm">
        <p className="font-medium text-foreground">Drag and drop files here</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Upload project assets, briefs, and deliverables
        </p>
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <Button variant="outline" className="h-9">
            Add via Link
          </Button>
          <Button
            variant="outline"
            className="h-9"
            onClick={() => fileInputRef.current?.click()}
          >
            Upload Files
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        {files.length === 0 ? (
          <p className="px-4 py-8 text-center text-sm text-muted-foreground">
            No files uploaded yet.
          </p>
        ) : (
          files.map((file, i) => (
            <div
              key={file.id}
              className={`grid min-w-[680px] items-center gap-3 px-4 py-3 text-sm md:grid-cols-[1.4fr_0.6fr_0.9fr_0.9fr_auto] ${
                i !== files.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <p className="font-medium text-foreground truncate">
                {file.fileName}
              </p>
              <p className="text-muted-foreground">{file.fileType}</p>
              <p className="text-muted-foreground">{file.uploadedDate}</p>
              <p className="text-muted-foreground">{file.uploadedBy}</p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground"
                  aria-label={`Download ${file.fileName}`}
                >
                  <Download className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteFile(file.id)}
                  className="rounded-md p-1.5 text-muted-foreground transition hover:bg-muted hover:text-destructive"
                  aria-label={`Delete ${file.fileName}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
