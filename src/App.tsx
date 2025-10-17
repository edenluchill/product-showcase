import { useState } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { BatchProgress } from "@/components/BatchProgress";
import { ImageGallery } from "@/components/ImageGallery";
import { StepIndicator } from "@/components/StepIndicator";
import { UploadAllStep } from "@/components/steps/UploadAllStep";
import { AnalyzingProductStep } from "@/components/steps/AnalyzingProductStep";
import { SelectBestsellerStep } from "@/components/steps/SelectBestsellerStep";
import { CompleteStep } from "@/components/steps/CompleteStep";
import { Bestseller } from "@/lib/types";
import { MOCK_BESTSELLERS_DATA } from "./bestsellers-mock";
import { useProductUpload } from "@/hooks/useProductUpload";
import { useBestsellerSelection } from "@/hooks/useBestsellerSelection";
import { useModelUpload } from "@/hooks/useModelUpload";
import { useImageGeneration } from "@/hooks/useImageGeneration";

type Step =
  | "upload-all"
  | "analyzing-product"
  | "select-bestseller"
  | "generating"
  | "complete";

function App() {
  const [step, setStep] = useState<Step>("upload-all");

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
    if (!productUpload.productImage || !modelUpload.modelImage) return;

    setStep("analyzing-product");

    const analysis = await productUpload.analyzeProduct();
    if (!analysis) {
      setStep("upload-all");
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
      setStep("upload-all");
      return;
    }

    bestsellerSelection.setBestsellers(foundBestsellers);
    setStep("select-bestseller");

    toast({
      title: "分析完成！",
      description: `识别为：${analysis.category}，找到 ${foundBestsellers.length} 个爆款模板`,
    });
  };

  // Confirm bestseller selection and start generation
  const handleConfirmBestseller = async () => {
    if (!bestsellerSelection.selectedBestseller) {
      toast({
        title: "请选择爆款模板",
        description: "请先选择一个爆款模板",
        variant: "destructive",
      });
      return;
    }

    // 直接开始生成
    await handleStartGenerationWithReference();
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
      setStep("select-bestseller");
    } finally {
      imageGeneration.setIsGenerating(false);
    }
  };

  // Restart flow
  const handleRestart = () => {
    setStep("upload-all");
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
              label="1.上传照片"
              active={step === "upload-all"}
              completed={[
                "analyzing-product",
                "select-bestseller",
                "generating",
                "complete",
              ].includes(step)}
            />
            <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
            <StepIndicator
              label="2.分析产品"
              active={step === "analyzing-product"}
              completed={[
                "select-bestseller",
                "generating",
                "complete",
              ].includes(step)}
            />
            <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
            <StepIndicator
              label="3.选择模板"
              active={step === "select-bestseller"}
              completed={["generating", "complete"].includes(step)}
            />
            <ArrowRight className="w-4 h-4 text-slate-400 self-center" />
            <StepIndicator
              label="4.生成图片"
              active={step === "generating"}
              completed={step === "complete"}
            />
          </div>
        </div>

        {/* Step Components */}
        {step === "upload-all" && (
          <UploadAllStep
            productPreview={productUpload.productPreview}
            productPreviewBack={productUpload.productPreviewBack}
            modelPreview={modelUpload.modelPreview}
            onProductImageChange={productUpload.handleProductImageChange}
            onProductImageBackChange={
              productUpload.handleProductImageBackChange
            }
            onModelImageChange={modelUpload.handleModelImageChange}
            onClearProductImage={() => {
              productUpload.setProductImage(null);
              productUpload.setProductPreview("");
            }}
            onClearProductImageBack={() => {
              productUpload.setProductImageBack(null);
              productUpload.setProductPreviewBack("");
            }}
            onClearModelImage={() => {
              modelUpload.setModelImage(null);
              modelUpload.setModelPreview("");
            }}
            onContinue={handleAnalyzeProduct}
            hasProductImage={!!productUpload.productImage}
            hasModelImage={!!modelUpload.modelImage}
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
            onRegenerate={() => setStep("select-bestseller")}
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
