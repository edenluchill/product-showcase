import { toast } from "@/hooks/use-toast";
import { Bestseller, GeneratedImage, ImageStyle } from "@/lib/types";
import { useState } from "react";

export type PromptVariant = "精准还原" | "风格优化" | "创意混合";

export function useImageGeneration() {
  const [imageStyles, setImageStyles] = useState<ImageStyle[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(0);
  const [currentGeneratingGroup, setCurrentGeneratingGroup] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);

  /**
   * 批量生成图片 - 基于参考图版本（3组不同prompt，滑动窗口并发）
   */
  const generateBatchImagesWithReference = async (
    selectedBestseller: Bestseller,
    modelImage: File,
    productImage: File,
    productImageBack: File | null,
    onGroupCompleted?: (group: number) => void
  ) => {
    const CONCURRENT_LIMIT = 4;
    const promptVariants: PromptVariant[] = [
      "精准还原",
      "风格优化",
      "创意混合",
    ];

    // 预先初始化所有3组图片为pending状态
    const allResults: GeneratedImage[] = [];

    for (let group = 1; group <= 3; group++) {
      for (let i = 0; i < selectedBestseller.images.length; i++) {
        allResults.push({
          index: i + 1,
          group: group,
          promptVariant: promptVariants[group - 1],
          url: "",
          status: "pending" as const,
          referenceUrl: selectedBestseller.images[i].url,
        });
      }
    }

    setGeneratedImages([...allResults]);
    setCurrentGeneratingIndex(0);
    setCurrentGeneratingGroup(1);

    // 单张图片的生成函数
    const generateSingleImage = async (
      referenceImage: { url: string; viewAngle?: string },
      imageIndex: number,
      group: number,
      promptVariant: PromptVariant
    ) => {
      const resultIndex =
        (group - 1) * selectedBestseller.images.length + imageIndex;

      // 标记为生成中
      allResults[resultIndex] = {
        ...allResults[resultIndex],
        status: "generating",
      };
      setGeneratedImages([...allResults]);
      setCurrentGeneratingIndex(imageIndex + 1);
      setCurrentGeneratingGroup(group);

      try {
        const formData = new FormData();
        formData.append("referenceImageUrl", referenceImage.url);

        const viewAngle = referenceImage.viewAngle || "front";
        formData.append("referenceViewAngle", viewAngle);
        formData.append("promptVariant", promptVariant);

        formData.append("modelImage", modelImage);
        formData.append("productImage", productImage);

        if (productImageBack) {
          formData.append("productImageBack", productImageBack);
        }

        const response = await fetch("/api/generate-from-style", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `生成失败`);
        }

        const data = await response.json();

        allResults[resultIndex] = {
          index: imageIndex + 1,
          group: group,
          promptVariant: promptVariant,
          url: data.imageUrl,
          status: "success",
          referenceUrl: referenceImage.url,
        };
      } catch (error) {
        console.error(`生成第 ${group} 组第 ${imageIndex + 1} 张失败:`, error);

        allResults[resultIndex] = {
          index: imageIndex + 1,
          group: group,
          promptVariant: promptVariant,
          url: "",
          status: "failed",
          referenceUrl: referenceImage.url,
          error: error instanceof Error ? error.message : "生成失败",
        };
      }

      setGeneratedImages([...allResults]);

      return resultIndex;
    };

    // 生成3组图片
    for (let group = 1; group <= 3; group++) {
      const promptVariant = promptVariants[group - 1];

      console.log(`开始生成第 ${group} 组 (${promptVariant})...`);

      // 滑动窗口并发控制
      let nextIndex = 0;

      const runTask = async (imageIndex: number): Promise<void> => {
        await generateSingleImage(
          selectedBestseller.images[imageIndex],
          imageIndex,
          group,
          promptVariant
        );

        if (nextIndex < selectedBestseller.images.length) {
          const nextIdx = nextIndex++;
          await runTask(nextIdx);
        }
      };

      const initialCount = Math.min(
        CONCURRENT_LIMIT,
        selectedBestseller.images.length
      );
      const initialPromises: Promise<void>[] = [];
      for (let i = 0; i < initialCount; i++) {
        initialPromises.push(runTask(nextIndex++));
      }

      await Promise.all(initialPromises);

      // 当前组完成
      const groupResults = allResults.filter((r) => r.group === group);
      const successCount = groupResults.filter(
        (r) => r.status === "success"
      ).length;

      toast({
        title: `第 ${group} 组完成！`,
        description: `${promptVariant}: 成功生成 ${successCount}/${selectedBestseller.images.length} 张图片`,
      });

      // 回调通知组完成（用于在第一组完成后切换到完成页）
      if (onGroupCompleted) {
        onGroupCompleted(group);
      }
    }

    const totalSuccess = allResults.filter(
      (r) => r.status === "success"
    ).length;
    toast({
      title: "全部生成完成！",
      description: `共成功生成 ${totalSuccess}/${allResults.length} 张图片`,
    });

    return allResults;
  };

  /**
   * 批量生成图片 - 基于风格分析版本
   */
  const generateBatchImages = async (
    styles: ImageStyle[],
    modelImage: File,
    productImage: File
  ) => {
    const results: GeneratedImage[] = [];

    setGeneratedImages([]);
    setCurrentGeneratingIndex(0);

    for (let i = 0; i < styles.length; i++) {
      const style = styles[i];
      setCurrentGeneratingIndex(i + 1);

      const pendingImage: GeneratedImage = {
        index: i + 1,
        group: 1, // 旧方法只生成一组
        promptVariant: "风格分析",
        url: "",
        status: "pending",
        style: style,
      };
      results.push(pendingImage);
      setGeneratedImages([...results]);

      try {
        const formData = new FormData();
        formData.append("modelImage", modelImage);
        formData.append("productImage", productImage);
        formData.append("style", JSON.stringify(style));
        formData.append("index", (i + 1).toString());

        const response = await fetch("/api/generate-single", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`生成失败`);
        }

        const data = await response.json();

        results[i] = {
          index: i + 1,
          group: 1,
          promptVariant: "风格分析",
          url: data.imageUrl,
          status: "success",
          style: style,
        };
      } catch (error) {
        console.error(`生成第 ${i + 1} 张失败:`, error);

        results[i] = {
          index: i + 1,
          group: 1,
          promptVariant: "风格分析",
          url: "",
          status: "failed",
          style: style,
          error: error instanceof Error ? error.message : "生成失败",
        };
      }

      setGeneratedImages([...results]);
    }

    const successCount = results.filter((r) => r.status === "success").length;
    toast({
      title: "生成完成！",
      description: `成功生成 ${successCount}/${styles.length} 张图片`,
    });

    return results;
  };

  /**
   * 分析爆款图片风格
   */
  const analyzeStyles = async (selectedBestseller: Bestseller) => {
    const styles: ImageStyle[] = [];

    for (let i = 0; i < selectedBestseller.images.length; i++) {
      const img = selectedBestseller.images[i];

      try {
        const response = await fetch("/api/analyze-style", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: img.url }),
        });

        if (!response.ok) {
          throw new Error(`分析图片 ${i + 1} 失败`);
        }

        const data = await response.json();
        styles.push(data.style);
      } catch (error) {
        console.error(`分析图片 ${i + 1} 失败:`, error);
        // 使用默认风格
        styles.push({
          angle: "front",
          shot: "full-body",
          pose: "Natural standing pose",
          background: "White background",
          lighting: "Studio lighting",
        });
      }
    }

    setImageStyles(styles);
    return styles;
  };

  const reset = () => {
    setImageStyles([]);
    setGeneratedImages([]);
    setCurrentGeneratingIndex(0);
    setCurrentGeneratingGroup(1);
    setIsGenerating(false);
  };

  return {
    imageStyles,
    generatedImages,
    currentGeneratingIndex,
    currentGeneratingGroup,
    isGenerating,
    setIsGenerating,
    generateBatchImagesWithReference,
    generateBatchImages,
    analyzeStyles,
    reset,
  };
}
