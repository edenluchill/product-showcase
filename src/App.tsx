import { useState } from "react";
import {
  Upload,
  Image as ImageIcon,
  Loader2,
  Sparkles,
  Check,
  ArrowRight,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Toaster } from "@/components/ui/toaster";
import { toast } from "@/hooks/use-toast";
import { BestsellerSelector } from "@/components/BestsellerSelector";
import { BatchProgress } from "@/components/BatchProgress";
import {
  ProductAnalysis,
  Bestseller,
  ImageStyle,
  GeneratedImage,
} from "@/lib/types";
import { searchBestsellersByKeywords } from "@/lib/bestsellers-api";

type Step =
  | "upload-product" // 步骤1：上传产品图
  | "analyzing-product" // 步骤2：AI分析产品
  | "select-bestseller" // 步骤3：选择爆款
  | "upload-model" // 步骤4：上传模特图
  | "analyzing-styles" // 步骤5：分析爆款图片风格
  | "generating" // 步骤6：批量生成
  | "complete"; // 步骤7：完成

function App() {
  // 流程状态
  const [step, setStep] = useState<Step>("upload-product");

  // 产品相关
  const [productImage, setProductImage] = useState<File | null>(null);
  const [productPreview, setProductPreview] = useState<string>("");
  const [productAnalysis, setProductAnalysis] =
    useState<ProductAnalysis | null>(null);

  // 爆款相关
  const [bestsellers, setBestsellers] = useState<Bestseller[]>([]);
  const [selectedBestseller, setSelectedBestseller] =
    useState<Bestseller | null>(null);

  // 模特相关
  const [modelImage, setModelImage] = useState<File | null>(null);
  const [modelPreview, setModelPreview] = useState<string>("");

  // 生成相关
  const [imageStyles, setImageStyles] = useState<ImageStyle[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [currentGeneratingIndex, setCurrentGeneratingIndex] = useState(0);

  // 加载状态
  const [isGenerating, setIsGenerating] = useState(false);

  // ====== 处理函数 ======

  // 处理产品图片上传
  const handleProductImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProductImage(file);
      setProductPreview(URL.createObjectURL(file));
    }
  };

  // 处理模特图片上传
  const handleModelImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setModelImage(file);
      setModelPreview(URL.createObjectURL(file));
    }
  };

  // 分析产品
  const handleAnalyzeProduct = async () => {
    if (!productImage) return;

    setStep("analyzing-product");

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

      // 根据分析结果搜索爆款（使用实时爬虫或本地数据库）
      const foundBestsellers = await searchBestsellersByKeywords(
        analysis.searchKeywords
      );

      if (foundBestsellers.length === 0) {
        toast({
          title: "未找到匹配的爆款",
          description: `分析结果：${analysis.category}。暂无此类产品的爆款数据。`,
          variant: "destructive",
        });
        setStep("upload-product");
        return;
      }

      setBestsellers(foundBestsellers);
      setStep("select-bestseller");

      toast({
        title: "分析完成！",
        description: `识别为：${analysis.category}，找到 ${foundBestsellers.length} 个爆款`,
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "分析失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
      setStep("upload-product");
    }
  };

  // 选择爆款
  const handleSelectBestseller = (bestseller: Bestseller) => {
    setSelectedBestseller(bestseller);
  };

  // 确认爆款并继续
  const handleConfirmBestseller = () => {
    if (!selectedBestseller) {
      toast({
        title: "请选择爆款",
        description: "请先选择一个爆款产品",
        variant: "destructive",
      });
      return;
    }
    setStep("upload-model");
  };

  // 开始生成
  const handleStartGeneration = async () => {
    if (!modelImage || !productImage || !selectedBestseller) return;

    setStep("analyzing-styles");
    setIsGenerating(true);

    try {
      // 步骤1：分析爆款的每张图片风格
      toast({
        title: "开始分析",
        description: `正在分析爆款的 ${selectedBestseller.imageCount} 张图片...`,
      });

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

      toast({
        title: "分析完成！",
        description: `已分析 ${styles.length} 张图片的风格`,
      });

      // 步骤2：批量生成
      setStep("generating");
      await generateBatchImages(styles);
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "生成失败",
        description: error instanceof Error ? error.message : "请稍后重试",
        variant: "destructive",
      });
      setStep("upload-model");
    } finally {
      setIsGenerating(false);
    }
  };

  // 批量生成图片
  const generateBatchImages = async (styles: ImageStyle[]) => {
    if (!modelImage || !productImage) return;

    const results: GeneratedImage[] = [];

    setGeneratedImages([]);
    setCurrentGeneratingIndex(0);

    for (let i = 0; i < styles.length; i++) {
      const style = styles[i];
      setCurrentGeneratingIndex(i + 1);

      // 添加pending状态的图片
      const pendingImage: GeneratedImage = {
        index: i + 1,
        url: "",
        status: "pending",
        style: style,
      };
      results.push(pendingImage);
      setGeneratedImages([...results]);

      try {
        // 调用单张生成API
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

        // 更新为成功状态
        results[i] = {
          index: i + 1,
          url: data.imageUrl,
          status: "success",
          style: style,
        };
      } catch (error) {
        console.error(`生成第 ${i + 1} 张失败:`, error);

        // 更新为失败状态
        results[i] = {
          index: i + 1,
          url: "",
          status: "failed",
          style: style,
          error: error instanceof Error ? error.message : "生成失败",
        };
      }

      setGeneratedImages([...results]);
    }

    setStep("complete");

    const successCount = results.filter((r) => r.status === "success").length;
    toast({
      title: "生成完成！",
      description: `成功生成 ${successCount}/${styles.length} 张图片`,
    });
  };

  // 重新开始
  const handleRestart = () => {
    setStep("upload-product");
    setProductImage(null);
    setProductPreview("");
    setProductAnalysis(null);
    setBestsellers([]);
    setSelectedBestseller(null);
    setModelImage(null);
    setModelPreview("");
    setImageStyles([]);
    setGeneratedImages([]);
    setCurrentGeneratingIndex(0);
  };

  // ====== 渲染 ======

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* 标题 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-500" />
            AI 爆款复制系统
          </h1>
          <p className="text-slate-600 text-lg">
            一键复制国际爆款产品的完整图片组，让你的产品照片达到专业水准
          </p>

          {/* 步骤指示器 */}
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

        {/* 步骤1：上传产品图 */}
        {step === "upload-product" && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>🎯 上传您的产品照片</CardTitle>
              <CardDescription>
                我们将使用AI分析您的产品，并为您找到相似的爆款产品
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                  {productPreview ? (
                    <div className="space-y-4">
                      <img
                        src={productPreview}
                        alt="Product preview"
                        className="max-h-96 mx-auto rounded-lg"
                      />
                      <div className="flex gap-3 justify-center">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setProductImage(null);
                            setProductPreview("");
                          }}
                        >
                          更换图片
                        </Button>
                        <Button size="sm" onClick={handleAnalyzeProduct}>
                          继续 →
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                      <p className="text-sm text-slate-600 mb-2">
                        点击上传或拖拽产品图片
                      </p>
                      <p className="text-xs text-slate-400">
                        支持 JPG、PNG 格式，建议使用清晰的产品照片
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProductImageChange}
                      />
                    </label>
                  )}
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    💡 <strong>提示：</strong>
                    清晰的产品照片能够帮助AI更准确地分析产品类型并找到最匹配的爆款
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 步骤2：AI分析中 */}
        {step === "analyzing-product" && (
          <Card className="max-w-2xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto relative">
                  <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">
                    🔍 AI正在分析您的产品...
                  </h3>
                  <div className="space-y-2 text-sm text-slate-600">
                    <p>✓ 识别产品类型...</p>
                    <p>✓ 分析产品特征...</p>
                    <p className="animate-pulse">⏳ 搜索相似爆款...</p>
                  </div>
                </div>

                {productPreview && (
                  <img
                    src={productPreview}
                    alt="Product"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* 步骤3：选择爆款 */}
        {step === "select-bestseller" && (
          <div>
            <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-blue-900 mb-2">
                      产品分析完成：{productAnalysis?.category}
                    </h3>
                    <p className="text-sm text-blue-700 mb-2">
                      特征：{productAnalysis?.features.join("、")}
                    </p>
                    <p className="text-xs text-blue-600">
                      搜索关键词：{productAnalysis?.searchKeywords.join(", ")}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>选择要模仿的爆款</CardTitle>
                <CardDescription>
                  选择后，我们将分析这个爆款的所有图片风格，并为您生成相同风格的产品图
                </CardDescription>
              </CardHeader>
              <CardContent>
                <BestsellerSelector
                  bestsellers={bestsellers}
                  selectedBestseller={selectedBestseller}
                  onSelect={handleSelectBestseller}
                />

                <div className="flex justify-center mt-6">
                  <Button
                    size="lg"
                    onClick={handleConfirmBestseller}
                    disabled={!selectedBestseller}
                  >
                    确认并继续 →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* 步骤4：上传模特图 */}
        {step === "upload-model" && selectedBestseller && (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>👤 上传您的模特照片</CardTitle>
              <CardDescription>
                我们将使用您的模特和产品，模仿爆款的{" "}
                {selectedBestseller.imageCount} 张图片风格
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* 已选择的爆款信息 */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <img
                    src={selectedBestseller.thumbnailUrl}
                    alt={selectedBestseller.productName}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div>
                    <p className="font-medium text-blue-900">
                      {selectedBestseller.productName}
                    </p>
                    <p className="text-sm text-blue-700">
                      {selectedBestseller.platform.toUpperCase()} •{" "}
                      {formatSales(selectedBestseller.sales)} 销量 •{" "}
                      {selectedBestseller.imageCount} 张图片
                    </p>
                  </div>
                </div>
              </div>

              {/* 模特照片上传 */}
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors mb-6">
                {modelPreview ? (
                  <div className="space-y-4">
                    <img
                      src={modelPreview}
                      alt="Model preview"
                      className="max-h-96 mx-auto rounded-lg"
                    />
                    <div className="flex gap-3 justify-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setModelImage(null);
                          setModelPreview("");
                        }}
                      >
                        更换图片
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="w-16 h-16 mx-auto text-slate-400 mb-4" />
                    <p className="text-sm text-slate-600 mb-2">
                      点击上传或拖拽模特照片
                    </p>
                    <p className="text-xs text-slate-400">
                      建议：全身照、清晰可见、白底或简单背景、自然站姿
                    </p>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleModelImageChange}
                    />
                  </label>
                )}
              </div>

              {/* 开始生成按钮 */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setStep("select-bestseller")}
                >
                  ← 返回选择爆款
                </Button>
                <Button
                  className="flex-1"
                  size="lg"
                  onClick={handleStartGeneration}
                  disabled={!modelImage || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      开始生成 {selectedBestseller.imageCount} 张图片
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 步骤5：分析爆款图片风格 */}
        {step === "analyzing-styles" && (
          <Card className="max-w-4xl mx-auto">
            <CardContent className="pt-6">
              <div className="text-center space-y-6">
                <div className="w-24 h-24 mx-auto relative">
                  <div className="absolute inset-0 bg-purple-500 rounded-full animate-ping opacity-20"></div>
                  <div className="relative w-24 h-24 bg-purple-500 rounded-full flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-bold mb-2">
                    🔬 正在分析爆款的 {selectedBestseller?.imageCount} 张图片...
                  </h3>
                  <p className="text-sm text-slate-600">
                    AI正在分析每张图片的角度、姿势、光线、背景等细节
                  </p>
                  <p className="text-xs text-slate-500 mt-2">
                    这需要约 {selectedBestseller?.imageCount || 0} 秒
                  </p>
                </div>

                <div className="grid grid-cols-6 gap-2 max-w-2xl mx-auto">
                  {selectedBestseller?.images.slice(0, 6).map((img) => (
                    <div
                      key={img.index}
                      className="aspect-square rounded overflow-hidden border"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 步骤6：批量生成中 */}
        {step === "generating" && (
          <div className="max-w-4xl mx-auto">
            <BatchProgress
              images={generatedImages}
              totalCount={imageStyles.length}
              currentIndex={currentGeneratingIndex}
            />
          </div>
        )}

        {/* 步骤7：完成 */}
        {step === "complete" && (
          <Card className="max-w-6xl mx-auto">
            <CardHeader>
              <CardTitle>🎉 生成完成！</CardTitle>
              <CardDescription>
                共生成{" "}
                {
                  generatedImages.filter((img) => img.status === "success")
                    .length
                }
                /{generatedImages.length} 张图片
                {selectedBestseller &&
                  ` （基于 ${selectedBestseller.productName}）`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6">
                {generatedImages.map((img) => (
                  <div key={img.index} className="space-y-2">
                    <div className="relative aspect-[3/4] rounded-lg overflow-hidden border-2 border-slate-200 bg-slate-50">
                      {img.status === "success" && img.url ? (
                        <img
                          src={img.url}
                          alt={`Generated ${img.index}`}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-red-50">
                          <p className="text-red-500 text-sm">生成失败</p>
                        </div>
                      )}
                      <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                        图 {img.index}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 text-center">
                      {img.style.angle} • {img.style.shot}
                    </p>
                    {img.status === "success" && img.url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = img.url;
                          link.download = `generated-${img.index}.png`;
                          link.click();
                        }}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        下载
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex gap-4 justify-center">
                <Button onClick={handleRestart}>重新开始</Button>
                <Button
                  variant="outline"
                  onClick={() => setStep("upload-model")}
                >
                  使用相同爆款重新生成
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      <Toaster />
    </div>
  );
}

// 步骤指示器组件
function StepIndicator({
  label,
  active,
  completed,
}: {
  label: string;
  active: boolean;
  completed: boolean;
}) {
  return (
    <div
      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
        completed
          ? "bg-green-500 text-white"
          : active
          ? "bg-blue-500 text-white"
          : "bg-slate-200 text-slate-500"
      }`}
    >
      {completed && <Check className="w-3 h-3 inline mr-1" />}
      {label}
    </div>
  );
}

// 格式化销量
function formatSales(num: number) {
  if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
}

export default App;
