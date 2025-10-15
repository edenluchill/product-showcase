import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface UploadProductStepProps {
  productPreview: string;
  productPreviewBack: string;
  onProductImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onProductImageBackChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearProductImage: () => void;
  onClearProductImageBack: () => void;
  onContinue: () => void;
  hasProductImage: boolean;
}

export function UploadProductStep({
  productPreview,
  productPreviewBack,
  onProductImageChange,
  onProductImageBackChange,
  onClearProductImage,
  onClearProductImageBack,
  onContinue,
  hasProductImage,
}: UploadProductStepProps) {
  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>🎯 上传您的产品照片</CardTitle>
        <CardDescription>
          我们将使用AI分析您的产品，并为您找到相似的爆款产品
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* 产品正面图 */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">
              产品正面图 <span className="text-red-500">*</span>
            </h3>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
              {productPreview ? (
                <div className="space-y-4">
                  <img
                    src={productPreview}
                    alt="Product preview"
                    className="max-h-64 mx-auto rounded-lg"
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
                  <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-sm text-slate-600 mb-1">
                    点击上传产品正面图
                  </p>
                  <p className="text-xs text-slate-400">支持 JPG、PNG 格式</p>
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

          {/* 产品背面图（可选） */}
          <div>
            <h3 className="text-sm font-medium text-slate-700 mb-2">
              产品背面图 <span className="text-slate-400 text-xs">(可选)</span>
            </h3>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
              {productPreviewBack ? (
                <div className="space-y-4">
                  <img
                    src={productPreviewBack}
                    alt="Product back preview"
                    className="max-h-64 mx-auto rounded-lg"
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
                  <Upload className="w-12 h-12 mx-auto text-slate-400 mb-3" />
                  <p className="text-sm text-slate-600 mb-1">
                    点击上传产品背面图
                  </p>
                  <p className="text-xs text-slate-400">
                    提供背面图可让AI更好地理解产品细节
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

          {/* 继续按钮 */}
          {hasProductImage && (
            <div className="flex justify-center pt-2">
              <Button size="lg" onClick={onContinue}>
                继续 →
              </Button>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-900">
              💡 <strong>提示：</strong>
              清晰的产品照片能够帮助AI更准确地分析产品类型。提供前后两张图片可以让AI更好地理解产品的完整细节（如裤子、外套等的背面设计）
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
