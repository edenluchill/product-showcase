import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { BatchProgress } from "@/components/BatchProgress";
import { ImageGallery } from "@/components/ImageGallery";
import { StepIndicator } from "@/components/StepIndicator";
import { UploadProductStep } from "@/components/steps/UploadProductStep";
import { AnalyzingProductStep } from "@/components/steps/AnalyzingProductStep";
import { SelectBestsellerStep } from "@/components/steps/SelectBestsellerStep";
import { UploadModelStep } from "@/components/steps/UploadModelStep";
import { AnalyzingStylesStep } from "@/components/steps/AnalyzingStylesStep";
import { CompleteStep } from "@/components/steps/CompleteStep";
import { Bestseller } from "@/lib/types";
import { MOCK_BESTSELLERS_DATA } from "./bestsellers-mock";
import { useProductUpload } from "@/hooks/useProductUpload";
import { useBestsellerSelection } from "@/hooks/useBestsellerSelection";
import { useModelUpload } from "@/hooks/useModelUpload";
import { useImageGeneration } from "@/hooks/useImageGeneration";

type Step =
  | "upload-product"
  | "analyzing-product"
  | "select-bestseller"
  | "upload-model"
  | "analyzing-styles"
  | "generating"
  | "complete";

function App() {
  const [step, setStep] = useState<Step>("upload-product");

  // Custom hooks
  const productUpload = useProductUpload();
  const bestsellerSelection = useBestsellerSelection();
  const modelUpload = useModelUpload();
  const imageGeneration = useImageGeneration();

  // Gallery state
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryInitialIndex, setGalleryInitialIndex] = useState(0);
  const [galleryGroup, setGalleryGroup] = useState<number | null>(null); // null表示显示所有，数字表示显示特定组
  const [viewingOriginals, setViewingOriginals] = useState(false); // 是否正在查看原图

  // ====== Handler Functions ======

  // Analyze product
  const handleAnalyzeProduct = async () => {
    if (!productUpload.productImage) return;

    setStep("analyzing-product");

    const analysis = await productUpload.analyzeProduct();
    if (!analysis) {
      setStep("upload-product");
      return;
    }

    // Use mock data
    const foundBestsellers: Bestseller[] = MOCK_BESTSELLERS_DATA;

    if (foundBestsellers.length === 0) {
      toast({
        title: "未找到匹配的爆款",
        description: `分析结果：${analysis.category}。暂无此类产品的爆款数据。`,
        variant: "destructive",
      });
      setStep("upload-product");
      return;
    }

    bestsellerSelection.setBestsellers(foundBestsellers);
    setStep("select-bestseller");

    toast({
      title: "分析完成！",
      description: `识别为：${analysis.category}，找到 ${foundBestsellers.length} 个爆款`,
    });
  };

  // Confirm bestseller selection
  const handleConfirmBestseller = () => {
    if (!bestsellerSelection.selectedBestseller) {
      toast({
        title: "请选择爆款",
        description: "请先选择一个爆款产品",
        variant: "destructive",
      });
      return;
    }
    setStep("upload-model");
  };

  // Start generation with reference (recommended method)
  const handleStartGenerationWithReference = async () => {
    if (
      !modelUpload.modelImage ||
      !productUpload.productImage ||
      !bestsellerSelection.selectedBestseller
    )
      return;

    setStep("generating");
    imageGeneration.setIsGenerating(true);

    try {
      toast({
        title: "开始生成",
        description: `正在基于 ${bestsellerSelection.selectedBestseller.imageCount} 张爆款图片生成3组不同风格...`,
      });

      // 传入回调函数，第一组完成后就切换到完成页
      await imageGeneration.generateBatchImagesWithReference(
        bestsellerSelection.selectedBestseller,
        modelUpload.modelImage,
        productUpload.productImage,
        productUpload.productImageBack,
        (group: number) => {
          // 第一组完成后切换到完成页，让用户可以边看边等
          if (group === 1) {
            setStep("complete");
            toast({
              title: "第1组已完成！",
              description: "其他组正在后台生成中，您可以先查看第1组结果",
            });
          }
        }
      );

      // 全部完成（已经在complete页面了，不需要再setStep）
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
      setStep("upload-model");
    } finally {
      imageGeneration.setIsGenerating(false);
    }
  };

  // Start generation with style analysis (legacy method)
  const handleStartGeneration = async () => {
    if (
      !modelUpload.modelImage ||
      !productUpload.productImage ||
      !bestsellerSelection.selectedBestseller
    )
      return;

    setStep("analyzing-styles");
    imageGeneration.setIsGenerating(true);

    try {
      toast({
        title: "开始分析",
        description: `正在分析爆款的 ${bestsellerSelection.selectedBestseller.imageCount} 张图片...`,
      });

      const styles = await imageGeneration.analyzeStyles(
        bestsellerSelection.selectedBestseller
      );

      toast({
        title: "分析完成！",
        description: `已分析 ${styles.length} 张图片的风格`,
      });

      setStep("generating");
      await imageGeneration.generateBatchImages(
        styles,
        modelUpload.modelImage,
        productUpload.productImage
      );

      setStep("complete");
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
      setStep("upload-model");
    } finally {
      imageGeneration.setIsGenerating(false);
    }
  };

  // Restart flow
  const handleRestart = () => {
    setStep("upload-product");
    productUpload.reset();
    bestsellerSelection.reset();
    modelUpload.reset();
    imageGeneration.reset();
  };

  // ====== Render ======

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-500" />
            AI 爆款复制系统
          </h1>
          <p className="text-slate-600 text-lg">
            一键复制国际爆款产品的完整图片组，让你的产品照片达到专业水准
          </p>

          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mt-4 text-sm">
            <StepIndicator
              label="1.上传产品"
              active={step === "upload-product"}
              completed={[
                "analyzing-product",
                "select-bestseller",
                "upload-model",
                "analyzing-styles",
                "generating",
                "complete",
              ].includes(step)}
            />
            <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
            <StepIndicator
              label="2.选择爆款"
              active={step === "select-bestseller"}
              completed={[
                "upload-model",
                "analyzing-styles",
                "generating",
                "complete",
              ].includes(step)}
            />
            <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
            <StepIndicator
              label="3.上传模特"
              active={step === "upload-model"}
              completed={[
                "analyzing-styles",
                "generating",
                "complete",
              ].includes(step)}
            />
            <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
            <StepIndicator
              label="4.生成图片"
              active={["analyzing-styles", "generating"].includes(step)}
              completed={step === "complete"}
            />
          </div>
        </div>

        {/* Step Components */}
        {step === "upload-product" && (
          <UploadProductStep
            productPreview={productUpload.productPreview}
            productPreviewBack={productUpload.productPreviewBack}
            onProductImageChange={productUpload.handleProductImageChange}
            onProductImageBackChange={
              productUpload.handleProductImageBackChange
            }
            onClearProductImage={() => {
              productUpload.reset();
            }}
            onClearProductImageBack={() => {
              productUpload.setProductImageBack(null);
              productUpload.setProductPreviewBack("");
            }}
            onContinue={handleAnalyzeProduct}
            hasProductImage={!!productUpload.productImage}
          />
        )}

        {step === "analyzing-product" && (
          <AnalyzingProductStep productPreview={productUpload.productPreview} />
        )}

        {step === "select-bestseller" && (
          <SelectBestsellerStep
            productAnalysis={productUpload.productAnalysis}
            bestsellers={bestsellerSelection.bestsellers}
            selectedBestseller={bestsellerSelection.selectedBestseller}
            onSelect={bestsellerSelection.setSelectedBestseller}
            onConfirm={handleConfirmBestseller}
          />
        )}

        {step === "upload-model" && bestsellerSelection.selectedBestseller && (
          <UploadModelStep
            selectedBestseller={bestsellerSelection.selectedBestseller}
            modelPreview={modelUpload.modelPreview}
            isGenerating={imageGeneration.isGenerating}
            hasModelImage={!!modelUpload.modelImage}
            onModelImageChange={modelUpload.handleModelImageChange}
            onClearModelImage={() => {
              modelUpload.reset();
            }}
            onStartGenerationWithReference={handleStartGenerationWithReference}
            onStartGeneration={handleStartGeneration}
            onBack={() => setStep("select-bestseller")}
          />
        )}

        {step === "analyzing-styles" && (
          <AnalyzingStylesStep
            selectedBestseller={bestsellerSelection.selectedBestseller}
          />
        )}

        {step === "generating" && (
          <div className="max-w-4xl mx-auto">
            <div className="mb-4 text-center">
              <p className="text-sm text-slate-600">
                正在生成第 {imageGeneration.currentGeneratingGroup} 组（共3组）
              </p>
            </div>
            <BatchProgress
              images={imageGeneration.generatedImages.filter(
                (img) => img.group === imageGeneration.currentGeneratingGroup
              )}
              totalCount={
                bestsellerSelection.selectedBestseller?.images.length ||
                imageGeneration.imageStyles.length
              }
              currentIndex={imageGeneration.currentGeneratingIndex}
            />
          </div>
        )}

        {step === "complete" && (
          <CompleteStep
            generatedImages={imageGeneration.generatedImages}
            selectedBestseller={bestsellerSelection.selectedBestseller}
            onImageClick={(group, imageIndex) => {
              // 点击某组的某张图片，只在gallery中显示该组的图片
              setGalleryGroup(group);
              // 找到该组中该图片的位置
              const groupImages = imageGeneration.generatedImages.filter(
                (img) =>
                  img.group === group && img.status === "success" && img.url
              );
              const indexInGroup = groupImages.findIndex(
                (img) => img.index === imageIndex
              );
              setGalleryInitialIndex(indexInGroup >= 0 ? indexInGroup : 0);
              setViewingOriginals(false);
              setGalleryOpen(true);
            }}
            onViewOriginals={() => {
              // 查看爆款原图
              setViewingOriginals(true);
              setGalleryGroup(null);
              setGalleryInitialIndex(0);
              setGalleryOpen(true);
            }}
            onRestart={handleRestart}
            onRegenerate={() => setStep("upload-model")}
          />
        )}
      </div>

      <Toaster />

      {galleryOpen && (
        <ImageGallery
          images={
            viewingOriginals && bestsellerSelection.selectedBestseller
              ? // 查看原图模式：显示爆款的原图
                bestsellerSelection.selectedBestseller.images.map((img) => ({
                  url: img.url,
                  index: img.index,
                  group: undefined,
                  promptVariant: undefined,
                  style: undefined,
                  referenceUrl: undefined,
                }))
              : // 查看生成图模式：根据galleryGroup过滤
                imageGeneration.generatedImages
                  .filter(
                    (img) =>
                      img.status === "success" &&
                      img.url &&
                      (galleryGroup === null || img.group === galleryGroup)
                  )
                  .map((img) => ({
                    url: img.url!,
                    index: img.index,
                    group: img.group,
                    promptVariant: img.promptVariant,
                    style: img.style,
                    referenceUrl: img.referenceUrl,
                  }))
          }
          initialIndex={galleryInitialIndex}
          onClose={() => {
            setGalleryOpen(false);
            setViewingOriginals(false);
            setGalleryGroup(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
