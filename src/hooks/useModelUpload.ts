import { useState } from "react";

export function useModelUpload() {
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [modelPreview, setModelPreview] = useState<string>("");

  const handleModelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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
