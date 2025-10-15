import { Download, Sparkles, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { GeneratedImage, Bestseller } from "@/lib/types";
import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver"; // You might need to install this: npm install file-saver @types/file-saver

interface CompleteStepProps {
  generatedImages: GeneratedImage[];
  selectedBestseller: Bestseller | null;
  onImageClick: (group: number, imageIndex: number) => void;
  onViewOriginals: () => void;
  onRestart: () => void;
  onRegenerate: () => void;
}

export function CompleteStep({
  generatedImages,
  selectedBestseller,
  onImageClick,
  onViewOriginals,
  onRestart,
  onRegenerate,
}: CompleteStepProps) {
  const [isDownloading, setIsDownloading] = useState<Record<string, boolean>>(
    {}
  );
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  // 按组分类图片
  const group1Images = generatedImages.filter((img) => img.group === 1);
  const group2Images = generatedImages.filter((img) => img.group === 2);
  const group3Images = generatedImages.filter((img) => img.group === 3);

  const groups = [
    { id: 1, name: "精准还原", images: group1Images, color: "blue" },
    { id: 2, name: "风格优化", images: group2Images, color: "purple" },
    { id: 3, name: "创意混合", images: group3Images, color: "green" },
  ];

  const handleDownload = async (
    images: GeneratedImage[],
    folderName: string,
    zipFileName: string
  ) => {
    const successImages = images.filter(
      (img) => img.status === "success" && img.url
    );
    if (successImages.length === 0) return;

    const zip = new JSZip();
    const folder = zip.folder(folderName);

    if (folder) {
      await Promise.all(
        successImages.map(async (img) => {
          try {
            const response = await fetch(img.url!);
            const blob = await response.blob();
            folder.file(`image-${img.index}.png`, blob);
          } catch (error) {
            console.error(`Failed to fetch image ${img.url}:`, error);
          }
        })
      );
    }

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, `${zipFileName}.zip`);
    });
  };

  const totalSuccess = generatedImages.filter(
    (img) => img.status === "success"
  ).length;

  return (
    <Card className="max-w-7xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-yellow-500" />
              🎉 生成完成！
            </CardTitle>
            <CardDescription>
              共生成 {totalSuccess}/{generatedImages.length}{" "}
              张图片（3种不同风格）
              {selectedBestseller &&
                ` （基于 ${selectedBestseller.productName}）`}
            </CardDescription>
          </div>
          <Button variant="outline" onClick={onViewOriginals}>
            <ImageIcon className="w-4 h-4 mr-2" />
            查看爆款原图
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* 3个横向滚动区域 */}
        {groups.map((group) => {
          const successCount = group.images.filter(
            (img) => img.status === "success"
          ).length;
          const isGenerating = group.images.some(
            (img) => img.status === "generating" || img.status === "pending"
          );

          return (
            <div key={group.id} className="space-y-3">
              {/* 组标题 */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-slate-900">
                    第{group.id}组 • {group.name}
                  </h3>
                  <span className="text-sm text-slate-500">
                    {successCount}/{group.images.length} 张
                  </span>
                  {isGenerating && (
                    <span className="flex items-center gap-1 text-sm text-orange-500">
                      <span className="inline-block w-2 h-2 bg-orange-400 rounded-full animate-pulse"></span>
                      生成中...
                    </span>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={isDownloading[group.name]}
                  onClick={async () => {
                    setIsDownloading((prev) => ({
                      ...prev,
                      [group.name]: true,
                    }));
                    await handleDownload(
                      group.images,
                      group.name,
                      `第${group.id}组-${group.name}`
                    );
                    setIsDownloading((prev) => ({
                      ...prev,
                      [group.name]: false,
                    }));
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  {isDownloading[group.name] ? "下载中..." : `下载本组`}
                </Button>
              </div>

              {/* 横向滚动图片区域 */}
              <div className="relative">
                <div className="overflow-x-auto pb-4">
                  <div className="flex gap-4 min-w-min">
                    {group.images.map((img) => (
                      <div
                        key={`${img.group}-${img.index}`}
                        className="flex-shrink-0 w-64 group"
                      >
                        <div
                          className={`relative aspect-[3/4] rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                            img.status === "success"
                              ? "border-blue-400 hover:border-blue-600 hover:shadow-lg"
                              : "border-slate-200"
                          }`}
                          onClick={() => {
                            if (img.status === "success" && img.url) {
                              onImageClick(group.id, img.index);
                            }
                          }}
                        >
                          {img.status === "success" && img.url ? (
                            <>
                              <img
                                src={img.url}
                                alt={`Generated ${img.index}`}
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                              <div className="absolute top-2 left-2 bg-blue-600/90 text-white px-2 py-1 rounded text-xs font-medium">
                                #{img.index}
                              </div>
                            </>
                          ) : img.status === "generating" ||
                            img.status === "pending" ? (
                            <div className="w-full h-full bg-slate-100 flex flex-col items-center justify-center">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                              <p className="text-xs text-slate-500">
                                {img.status === "generating"
                                  ? "生成中..."
                                  : "等待中"}
                              </p>
                            </div>
                          ) : (
                            <div className="w-full h-full bg-red-50 flex items-center justify-center">
                              <p className="text-red-500 text-sm">生成失败</p>
                            </div>
                          )}
                        </div>

                        {/* 下载按钮 */}
                        {img.status === "success" && img.url && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              const link = document.createElement("a");
                              link.href = img.url;
                              link.download = `generated-group${img.group}-${img.index}.png`;
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
                </div>
              </div>
            </div>
          );
        })}

        {/* 底部操作按钮 */}
        <div className="flex gap-4 justify-center pt-4 border-t border-slate-200">
          <Button onClick={onRestart}>重新开始</Button>
          <Button variant="outline" onClick={onRegenerate}>
            使用相同爆款重新生成
          </Button>
          <Button
            variant="outline"
            disabled={isDownloadingAll}
            onClick={async () => {
              setIsDownloadingAll(true);
              const zip = new JSZip();
              for (const group of groups) {
                const successImages = group.images.filter(
                  (img) => img.status === "success" && img.url
                );
                if (successImages.length > 0) {
                  const folder = zip.folder(`第${group.id}组-${group.name}`);
                  if (folder) {
                    await Promise.all(
                      successImages.map(async (img) => {
                        try {
                          const response = await fetch(img.url!);
                          const blob = await response.blob();
                          folder.file(`image-${img.index}.png`, blob);
                        } catch (error) {
                          console.error(
                            `Failed to fetch image ${img.url}:`,
                            error
                          );
                        }
                      })
                    );
                  }
                }
              }
              zip.generateAsync({ type: "blob" }).then((content) => {
                saveAs(content, "generated-images-all.zip");
                setIsDownloadingAll(false);
              });
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloadingAll ? "下载中..." : `下载全部 (${totalSuccess})`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
