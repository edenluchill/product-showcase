import { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "./ui/button";

interface ImageGalleryProps {
  images: Array<{
    url: string;
    index: number;
    group?: number;
    promptVariant?: string;
    style?: { angle: string; shot: string };
    referenceUrl?: string;
  }>;
  initialIndex: number;
  onClose: () => void;
}

export function ImageGallery({
  images,
  initialIndex,
  onClose,
}: ImageGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const currentImage = images[currentIndex];

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = currentImage.url;
    link.download = `generated-${currentImage.index}.png`;
    link.click();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === "ArrowLeft") {
        goToPrevious();
      } else if (e.key === "ArrowRight") {
        goToNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      {/* Close Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
        onClick={onClose}
      >
        <X className="w-6 h-6" />
      </Button>

      {/* Download Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-16 text-white hover:bg-white/20 z-10"
        onClick={(e) => {
          e.stopPropagation();
          handleDownload();
        }}
      >
        <Download className="w-5 h-5" />
      </Button>

      {/* Previous Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 text-white hover:bg-white/20 w-12 h-12"
        onClick={(e) => {
          e.stopPropagation();
          goToPrevious();
        }}
      >
        <ChevronLeft className="w-8 h-8" />
      </Button>

      {/* Next Button */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 text-white hover:bg-white/20 w-12 h-12"
        onClick={(e) => {
          e.stopPropagation();
          goToNext();
        }}
      >
        <ChevronRight className="w-8 h-8" />
      </Button>

      {/* Main Image Container */}
      <div
        className="max-w-7xl max-h-[90vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 单独查看模式 */}
        <div className="relative">
          <img
            src={currentImage.url}
            alt={`Generated ${currentImage.index}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
          />

          {/* Image Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
            <div className="flex items-center justify-between text-white">
              <div>
                <p className="text-lg font-semibold">
                  图片 {currentImage.index}
                  {currentImage.group && ` - 第${currentImage.group}组`}
                  {currentImage.promptVariant && (
                    <span className="ml-2 text-sm bg-white/20 px-2 py-1 rounded">
                      {currentImage.promptVariant}
                    </span>
                  )}
                </p>
                <p className="text-sm text-white/80">
                  {currentImage.style
                    ? `${currentImage.style.angle} • ${currentImage.style.shot}`
                    : currentImage.referenceUrl
                    ? "基于参考图生成"
                    : ""}
                </p>
              </div>
              <p className="text-sm text-white/60">
                {currentIndex + 1} / {images.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Thumbnail Strip */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-sm rounded-lg p-3">
        <div className="flex gap-2 max-w-[90vw] overflow-x-auto no-scrollbar">
          {images.map((img, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(idx);
              }}
              className={`relative flex-shrink-0 w-16 h-20 rounded overflow-hidden transition-all ${
                idx === currentIndex
                  ? "ring-2 ring-white scale-110"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={img.url}
                alt={`Thumbnail ${img.index}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
