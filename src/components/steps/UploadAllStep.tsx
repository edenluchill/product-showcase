import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UploadAllStepProps {
  productPreview: string;
  productPreviewBack: string;
  modelPreview: string;
  onProductImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProductImageBackChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onModelImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearProductImage: () => void;
  onClearProductImageBack: () => void;
  onClearModelImage: () => void;
  onContinue: () => void;
  hasProductImage: boolean;
  hasModelImage: boolean;
}

export function UploadAllStep({
  productPreview,
  productPreviewBack,
  modelPreview,
  onProductImageChange,
  onProductImageBackChange,
  onModelImageChange,
  onClearProductImage,
  onClearProductImageBack,
  onClearModelImage,
  onContinue,
  hasProductImage,
  hasModelImage,
}: UploadAllStepProps) {
  return (
    <Card className="max-w-5xl mx-auto">
      <CardHeader>
        <CardTitle>📸 上传您的照片</CardTitle>
        <CardDescription>
          请上传您的产品照片和模特照片，我们将为您匹配爆款模板并生成专业图片
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-8">
          {/* 产品图片区域 */}
          <div className="border-2 border-blue-200 bg-blue-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 bg-blue-600 text-white text-sm font-medium rounded-full">
                产品照片
              </div>
              <p className="text-sm text-blue-900">上传您要销售的产品图片</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* 产品正面图 */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">
                  产品正面图 <span className="text-red-500">*</span>
                </h3>
                <div className="border-2 border-dashed border-blue-300 bg-white rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {productPreview ? (
                    <div className="space-y-3">
                      <img
                        src={productPreview}
                        alt="Product preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearProductImage}
                      >
                        更换图片
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-10 h-10 mx-auto text-blue-400 mb-2" />
                      <p className="text-sm text-slate-600 mb-1">
                        点击上传产品正面
                      </p>
                      <p className="text-xs text-slate-400">支持 JPG、PNG</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onProductImageChange}
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* 产品背面图 */}
              <div>
                <h3 className="text-sm font-medium text-slate-700 mb-2">
                  产品背面图{" "}
                  <span className="text-slate-400 text-xs">(可选)</span>
                </h3>
                <div className="border-2 border-dashed border-blue-300 bg-white rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  {productPreviewBack ? (
                    <div className="space-y-3">
                      <img
                        src={productPreviewBack}
                        alt="Product back preview"
                        className="max-h-48 mx-auto rounded-lg"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={onClearProductImageBack}
                      >
                        更换图片
                      </Button>
                    </div>
                  ) : (
                    <label className="cursor-pointer block">
                      <Upload className="w-10 h-10 mx-auto text-blue-400 mb-2" />
                      <p className="text-sm text-slate-600 mb-1">
                        点击上传产品背面
                      </p>
                      <p className="text-xs text-slate-400">
                        提供背面图可更好展示细节
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={onProductImageBackChange}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 模特图片区域 */}
          <div className="border-2 border-purple-200 bg-purple-50 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="px-3 py-1 bg-purple-600 text-white text-sm font-medium rounded-full">
                模特照片
              </div>
              <p className="text-sm text-purple-900">
                上传穿着您产品的模特照片
              </p>
            </div>

            <div className="max-w-sm mx-auto">
              <h3 className="text-sm font-medium text-slate-700 mb-2">
                模特照片 <span className="text-red-500">*</span>
              </h3>
              <div className="border-2 border-dashed border-purple-300 bg-white rounded-lg p-8 text-center hover:border-purple-400 transition-colors">
                {modelPreview ? (
                  <div className="space-y-3">
                    <img
                      src={modelPreview}
                      alt="Model preview"
                      className="max-h-64 mx-auto rounded-lg"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onClearModelImage}
                    >
                      更换图片
                    </Button>
                  </div>
                ) : (
                  <label className="cursor-pointer block">
                    <Upload className="w-12 h-12 mx-auto text-purple-400 mb-3" />
                    <p className="text-sm text-slate-600 mb-1">
                      点击上传模特照片
                    </p>
                    <p className="text-xs text-slate-400">
                      建议：全身照、清晰可见、简单背景
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
            </div>
          </div>

          {/* 继续按钮 */}
          {hasProductImage && hasModelImage && (
            <div className="flex justify-center pt-2">
              <Button size="lg" onClick={onContinue}>
                继续 - 查找爆款模板 →
              </Button>
            </div>
          )}

          {/* 提示信息 */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-slate-700">
              💡 <strong>温馨提示：</strong>
            </p>
            <ul className="text-sm text-slate-600 mt-2 space-y-1 ml-4 list-disc">
              <li>
                <strong className="text-blue-600">产品照片</strong>
                ：您要销售的产品本身的图片（如服装平铺图）
              </li>
              <li>
                <strong className="text-purple-600">模特照片</strong>
                ：穿着该产品的模特照片，用于生成最终效果
              </li>
              <li>提供清晰的照片能帮助AI生成更好的效果</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
