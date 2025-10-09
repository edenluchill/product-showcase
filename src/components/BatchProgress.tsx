import { GeneratedImage } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Loader2, XCircle, Clock } from "lucide-react";

interface BatchProgressProps {
  images: GeneratedImage[];
  totalCount: number;
  currentIndex: number;
}

export function BatchProgress({
  images,
  totalCount,
  currentIndex,
}: BatchProgressProps) {
  const successCount = images.filter((img) => img.status === "success").length;
  const failedCount = images.filter((img) => img.status === "failed").length;
  const progressPercent = (currentIndex / totalCount) * 100;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* 总进度 */}
          <div>
            <div className="flex justify-between text-sm font-medium mb-2">
              <span>⚡ 正在生成产品图片组...</span>
              <span>
                {currentIndex}/{totalCount} 完成
              </span>
            </div>
            <Progress value={progressPercent} className="h-3" />
          </div>

          {/* 统计 */}
          <div className="grid grid-cols-3 gap-4 text-center text-sm">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check className="w-4 h-4" />
              <span className="font-medium">{successCount} 成功</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-red-600">
              <XCircle className="w-4 h-4" />
              <span className="font-medium">{failedCount} 失败</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-slate-600">
              <Clock className="w-4 h-4" />
              <span className="font-medium">
                {totalCount - currentIndex} 等待中
              </span>
            </div>
          </div>

          {/* 详细进度列表 */}
          <div className="max-h-64 overflow-y-auto space-y-2 border-t pt-4">
            {images.map((img) => (
              <div
                key={img.index}
                className="flex items-center gap-3 text-sm p-2 rounded hover:bg-slate-50"
              >
                {img.status === "success" && (
                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                )}
                {img.status === "failed" && (
                  <XCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                )}
                {img.status === "pending" && (
                  <Loader2 className="w-4 h-4 text-blue-500 flex-shrink-0 animate-spin" />
                )}

                <span className="flex-1">
                  图 {img.index}: {img.style.angle} {img.style.shot}
                  {img.error && (
                    <span className="text-red-500 text-xs ml-2">
                      ({img.error})
                    </span>
                  )}
                </span>

                {img.status === "success" && img.url && (
                  <div className="w-12 h-12 rounded overflow-hidden border">
                    <img
                      src={img.url}
                      alt={`Generated ${img.index}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            ))}

            {/* 剩余未开始的 */}
            {Array.from({ length: totalCount - images.length }).map((_, i) => (
              <div
                key={`pending-${i}`}
                className="flex items-center gap-3 text-sm p-2 rounded text-slate-400"
              >
                <Clock className="w-4 h-4 flex-shrink-0" />
                <span>图 {images.length + i + 1}: 等待中...</span>
              </div>
            ))}
          </div>

          {/* 预计时间 */}
          <div className="text-center text-sm text-slate-500 pt-2 border-t">
            预计剩余时间: 约{" "}
            {Math.ceil(((totalCount - currentIndex) * 10) / 60)} 分钟
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
