import { toast } from "@/hooks/use-toast";
import imageCompression from "browser-image-compression";
import { useState } from "react";

export function useModelUpload() {
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [modelPreview, setModelPreview] = useState<string>("");

  const handleModelImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const options = {
      maxSizeMB: 2,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);
      setModelImage(compressedFile);
      setModelPreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error("Image compression error:", error);
      toast({
        title: "图片压缩失败",
        description: "无法压缩图片，已使用原图上传。",
        variant: "destructive",
      });
      // Fallback to original file
      setModelImage(file);
      setModelPreview(URL.createObjectURL(file));
    }
  };

  const reset = () => {
    setModelImage(null);
    setModelPreview("");
  };

  return {
    modelImage,
    modelPreview,
    handleModelImageChange,
    setModelImage,
    setModelPreview,
    reset,
  };
}
