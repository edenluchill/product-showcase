import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface AnalyzingProductStepProps {
  productPreview: string;
}

export function AnalyzingProductStep({
  productPreview,
}: AnalyzingProductStepProps) {
  return (
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
            <h3 className="text-xl font-bold mb-2">🔍 AI正在分析您的产品...</h3>
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
  );
}
