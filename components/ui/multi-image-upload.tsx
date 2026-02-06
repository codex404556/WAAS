"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { X, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

interface MultiImageUploadProps {
  value: string[];
  onChange: (images: string[]) => void;
  disabled?: boolean;
  maxFiles?: number;
}

export function MultiImageUpload({
  value,
  onChange,
  disabled,
  maxFiles = 8,
}: MultiImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([]);

  useEffect(() => {
    setPreviews(value);
  }, [value]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".webp"],
    },
    maxSize: 4000000,
    maxFiles,
    disabled,
    onDrop: async (acceptedFiles) => {
      if (!acceptedFiles.length) return;
      try {
        const base64Images = await Promise.all(
          acceptedFiles.map((file) => convertToBase64(file))
        );
        const next = [...previews, ...base64Images].slice(0, maxFiles);
        setPreviews(next);
        onChange(next);
      } catch (error) {
        console.error("Error converting files to base64:", error);
      }
    },
  });

  const handleRemove = (index: number) => {
    const next = previews.filter((_, i) => i !== index);
    setPreviews(next);
    onChange(next);
  };

  return (
    <Card className="border-dashed overflow-hidden">
      <CardContent className="p-0">
        <div
          {...getRootProps({
            className:
              "flex flex-col items-center justify-center p-6 cursor-pointer",
          })}
        >
          <input {...getInputProps()} />
          {previews.length ? (
            <div className="grid grid-cols-3 gap-3 w-full">
              {previews.map((src, index) => (
                <div key={`${src}-${index}`} className="relative h-28 w-full">
                  <Image
                    src={src}
                    alt={`Preview ${index + 1}`}
                    fill
                    sizes="(min-width: 1024px) 200px, (min-width: 768px) 160px, 33vw"
                    className="object-contain rounded-md"
                    unoptimized
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(index);
                    }}
                    disabled={disabled}
                  >
                    <X size={12} />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[200px] w-full border border-dashed border-muted-foreground/50 rounded-md">
              <Upload className="h-10 w-10 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-1">
                Drag &amp; drop or click to upload
              </p>
              <p className="text-xs text-muted-foreground/70">
                Images (max 4MB each)
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
