import { toast } from "@/hooks/use-toast";
import { ProductAnalysis } from "@/lib/types";
import imageCompression from "browser-image-compression";
import { useState } from "react";

export function useProductUpload() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageBack, setProductImageBack] = useState<File | null>(null);
  const [productPreview, setProductPreview] = useState<string>("");
  const [productPreviewBack, setProductPreviewBack] = useState<string>("");
  const [productAnalysis, setProductAnalysis] =
    useState<ProductAnalysis | null>(null);

  const handleImageChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
    setImage: (file: File | null) => void,
    setPreview: (url: string) => void
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
      setImage(compressedFile);
      setPreview(URL.createObjectURL(compressedFile));
    } catch (error) {
      console.error("Image compression error:", error);
      toast({
        title: "图片压缩失败",
        description: "无法压缩图片，已使用原图上传。",
        variant: "destructive",
      });
      // Fallback to original file
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(e, setProductImage, setProductPreview);
  };

  const handleProductImageBackChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    handleImageChange(e, setProductImageBack, setProductPreviewBack);
  };

  const analyzeProduct = async (): Promise<ProductAnalysis | null> => {
    if (!productImage) return null;

    try {
      const formData = new FormData();
      formData.append("productImage", productImage);

      const response = await fetch("/api/analyze-product", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("产品分析失败");
      }
      const data = (await response.json()) as { analysis: ProductAnalysis };
      const analysis = data.analysis;

      setProductAnalysis(analysis);
      return analysis;
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "分析失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
      return null;
    }
  };

  const reset = () => {
    setProductImage(null);
    setProductImageBack(null);
    setProductPreview("");
    setProductPreviewBack("");
    setProductAnalysis(null);
  };

  return {
    productImage,
    productImageBack,
    productPreview,
    productPreviewBack,
    productAnalysis,
    handleProductImageChange,
    handleProductImageBackChange,
    analyzeProduct,
    reset,
    setProductImage,
    setProductImageBack,
    setProductPreview,
    setProductPreviewBack,
  };
}
