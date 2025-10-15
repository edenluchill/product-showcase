import { Upload, Loader2, Sparkles, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bestseller } from "@/lib/types";
import { formatSales } from "@/lib/format-utils";

interface UploadModelStepProps {
  selectedBestseller: Bestseller;
  modelPreview: string;
  isGenerating: boolean;
  hasModelImage: boolean;
  onModelImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearModelImage: () => void;
  onStartGenerationWithReference: () => void;
  onStartGeneration: () => void;
  onBack: () => void;
}

export function UploadModelStep({
  selectedBestseller,
  modelPreview,
  isGenerating,
  hasModelImage,
  onModelImageChange,
  onClearModelImage,
  onStartGenerationWithReference,
  onStartGeneration,
  onBack,
}: UploadModelStepProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>👤 上传您的模特照片</CardTitle>
        <CardDescription>
          我们将使用您的模特和产品，模仿爆款的 {selectedBestseller.imageCount}{" "}
          张图片风格
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
                <Button variant="outline" size="sm" onClick={onClearModelImage}>
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
                onChange={onModelImageChange}
              />
            </label>
          )}
        </div>

        {/* 生成方式选择 */}
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              选择生成方式
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 方式1：基于参考图直接生成 */}
              <div className="bg-white rounded-lg p-4 border-2 border-blue-300">
                <div className="flex items-start gap-2 mb-2">
                  <div className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                    推荐
                  </div>
                  <h4 className="font-medium text-slate-900 flex-1">
                    参考图生成
                  </h4>
                </div>
                <p className="text-sm text-slate-600 mb-3">
                  直接使用爆款图片作为参考，保持相同的构图、角度和光线，生成速度更快
                </p>
                <Button
                  className="w-full"
                  onClick={onStartGenerationWithReference}
                  disabled={!hasModelImage || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      快速生成
                    </>
                  )}
                </Button>
              </div>

              {/* 方式2：分析风格后生成 */}
              <div className="bg-white rounded-lg p-4 border border-slate-200">
                <h4 className="font-medium text-slate-900 mb-2">
                  风格分析生成
                </h4>
                <p className="text-sm text-slate-600 mb-3">
                  先分析爆款图片的风格细节，再根据风格描述生成，适合需要精确控制的场景
                </p>
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={onStartGeneration}
                  disabled={!hasModelImage || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    <>
                      <ImageIcon className="w-4 h-4 mr-2" />
                      分析并生成
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* 返回按钮 */}
          <Button variant="outline" onClick={onBack} className="w-full">
            ← 返回选择爆款
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
