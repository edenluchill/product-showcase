import { toast } from "@/hooks/use-toast";
import { ProductAnalysis } from "@/lib/types";
import { useState } from "react";

export function useProductUpload() {
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productImageBack, setProductImageBack] = useState<File | null>(null);
  const [productPreview, setProductPreview] = useState<string>("");
  const [productPreviewBack, setProductPreviewBack] = useState<string>("");
  const [productAnalysis, setProductAnalysis] =
    useState<ProductAnalysis | null>(null);

  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      setProductPreview(URL.createObjectURL(file));
    }
  };

  const handleProductImageBackChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImageBack(file);
      setProductPreviewBack(URL.createObjectURL(file));
    }
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

      const data = await response.json();
      const analysis: ProductAnalysis = data.analysis;

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
