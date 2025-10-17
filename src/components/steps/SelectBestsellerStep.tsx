import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BestsellerSelector } from "@/components/BestsellerSelector";
import { Bestseller, ProductAnalysis } from "@/lib/types";

interface SelectBestsellerStepProps {
  productAnalysis: ProductAnalysis | null;
  bestsellers: Bestseller[];
  selectedBestseller: Bestseller | null;
  onSelect: (bestseller: Bestseller) => void;
  onConfirm: () => void;
}

export function SelectBestsellerStep({
  productAnalysis,
  bestsellers,
  selectedBestseller,
  onSelect,
  onConfirm,
}: SelectBestsellerStepProps) {
  return (
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
          <CardTitle>选择爆款模板</CardTitle>
          <CardDescription>
            选择一个爆款模板，我们将使用您上传的产品和模特照片，按照该模板的风格生成专业图片组
          </CardDescription>
        </CardHeader>
        <CardContent>
          <BestsellerSelector
            bestsellers={bestsellers}
            selectedBestseller={selectedBestseller}
            onSelect={onSelect}
          />

          <div className="flex justify-center mt-6">
            <Button
              size="lg"
              onClick={onConfirm}
              disabled={!selectedBestseller}
            >
              开始生成 →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
