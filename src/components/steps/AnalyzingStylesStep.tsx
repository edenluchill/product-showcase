import { ImageIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Bestseller } from "@/lib/types";

interface AnalyzingStylesStepProps {
  selectedBestseller: Bestseller | null;
}

export function AnalyzingStylesStep({
  selectedBestseller,
}: AnalyzingStylesStepProps) {
  return (
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
  );
}
