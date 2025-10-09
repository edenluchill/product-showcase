import { useState } from "react";
import { Bestseller } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Check,
  TrendingUp,
  Star,
  ShoppingCart,
  MessageCircle,
  Sparkles,
  ExternalLink,
} from "lucide-react";

interface BestsellerSelectorProps {
  bestsellers: Bestseller[];
  selectedBestseller: Bestseller | null;
  onSelect: (bestseller: Bestseller) => void;
  isLoading?: boolean;
}

export function BestsellerSelector({
  bestsellers,
  selectedBestseller,
  onSelect,
  isLoading = false,
}: BestsellerSelectorProps) {
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [viewingBestseller, setViewingBestseller] = useState<Bestseller | null>(
    null
  );

  // 格式化销量数字
  const formatSales = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const formatReviews = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  // 获取货币符号
  const getCurrencySymbol = (currency: string) => {
    const symbols: Record<string, string> = {
      USD: "$",
      CAD: "CA$",
      EUR: "€",
      GBP: "£",
      CNY: "¥",
    };
    return symbols[currency] || "$";
  };

  const handleCardClick = (bestseller: Bestseller) => {
    setViewingBestseller(bestseller);
    setDetailDialogOpen(true);
  };

  const handleSelectInDialog = () => {
    if (viewingBestseller) {
      onSelect(viewingBestseller);
      setDetailDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-600">AI正在分析您的产品并搜索爆款...</p>
      </div>
    );
  }

  if (bestsellers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600 mb-2">暂未找到匹配的爆款产品</p>
        <p className="text-sm text-slate-500">请尝试上传不同的产品图片</p>
      </div>
    );
  }

  return (
    <>
      {/* 标题 */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-pink-500 rounded-lg flex items-center justify-center">
          <TrendingUp className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900">
            为您找到 {bestsellers.length} 个爆款
          </h3>
          <p className="text-xs text-slate-500">点击查看详情并选择</p>
        </div>
      </div>

      {/* 产品网格 - 类似Temu/Amazon */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {bestsellers.map((bestseller) => (
          <Card
            key={bestseller.id}
            className={`group cursor-pointer transition-all hover:shadow-md overflow-hidden ${
              selectedBestseller?.id === bestseller.id
                ? "ring-2 ring-blue-500 shadow-md"
                : ""
            }`}
            onClick={() => handleCardClick(bestseller)}
          >
            <CardContent className="p-0">
              {/* 主图 */}
              <div className="relative aspect-[3/4] bg-slate-50 overflow-hidden">
                <img
                  src={bestseller.thumbnailUrl}
                  alt={bestseller.productName}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* 平台标签 */}
                <div className="absolute top-2 left-2">
                  <div className="bg-black/80 text-white px-2 py-0.5 rounded text-[10px] font-bold">
                    {bestseller.platform.toUpperCase()}
                  </div>
                </div>

                {/* 选中标记 */}
                {selectedBestseller?.id === bestseller.id && (
                  <div className="absolute top-2 right-2">
                    <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                {/* 图片数量 */}
                <div className="absolute bottom-2 right-2">
                  <div className="bg-white/95 px-2 py-0.5 rounded text-[10px] font-medium text-slate-700">
                    📸 {bestseller.imageCount}
                  </div>
                </div>
              </div>

              {/* 产品信息 */}
              <div className="p-3">
                {/* 价格 */}
                <div className="mb-2">
                  <span className="text-lg font-bold text-slate-900">
                    {getCurrencySymbol(bestseller.currency)}
                    {bestseller.price.toFixed(2)}
                  </span>
                </div>

                {/* 产品名 */}
                <h4 className="text-xs font-medium mb-2 line-clamp-2 min-h-[2rem] text-slate-700">
                  {bestseller.productName}
                </h4>

                {/* 核心数据 - 单行紧凑 */}
                <div className="flex items-center justify-between text-[11px] mb-2">
                  <div className="flex items-center gap-1 text-orange-600">
                    <ShoppingCart className="w-3 h-3" />
                    <span className="font-bold">
                      {formatSales(bestseller.sales)}
                    </span>
                  </div>
                  <div className="flex items-center gap-0.5 text-yellow-600">
                    <Star className="w-3 h-3 fill-yellow-600" />
                    <span className="font-bold">{bestseller.rating}</span>
                  </div>
                  <div className="flex items-center gap-0.5 text-slate-500">
                    <MessageCircle className="w-3 h-3" />
                    <span className="text-[10px]">
                      {formatReviews(bestseller.reviews)}
                    </span>
                  </div>
                </div>

                {/* 小图片预览 */}
                <div className="grid grid-cols-4 gap-0.5 mb-2">
                  {bestseller.images.slice(0, 4).map((img) => (
                    <div
                      key={img.index}
                      className="aspect-square rounded-sm overflow-hidden border border-slate-200"
                    >
                      <img
                        src={img.url}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>

                {/* 查看详情提示 */}
                <div className="text-center">
                  <span className="text-[10px] text-blue-600 font-medium">
                    点击查看详情 →
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 详情Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-5xl">
          {viewingBestseller && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  {viewingBestseller.productName}
                </DialogTitle>
                <DialogDescription className="flex items-center gap-3">
                  <span>
                    {viewingBestseller.platform.toUpperCase()} 爆款产品
                  </span>
                  <span>•</span>
                  <span className="text-lg font-bold text-blue-600">
                    {getCurrencySymbol(viewingBestseller.currency)}
                    {viewingBestseller.price.toFixed(2)}
                  </span>
                  <span>•</span>
                  <span>共 {viewingBestseller.imageCount} 张参考图片</span>
                </DialogDescription>
              </DialogHeader>

              <div className="grid md:grid-cols-2 gap-6">
                {/* 左侧：核心数据 */}
                <div className="space-y-4">
                  {/* 社会证明数据 */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-orange-600 mb-1">
                        <ShoppingCart className="w-5 h-5" />
                        <span className="font-bold text-xl">
                          {formatSales(viewingBestseller.sales)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">销量</div>
                    </div>

                    <div className="text-center p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-yellow-600 mb-1">
                        <Star className="w-5 h-5 fill-yellow-600" />
                        <span className="font-bold text-xl">
                          {viewingBestseller.rating}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">评分</div>
                    </div>

                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-center gap-2 text-blue-600 mb-1">
                        <MessageCircle className="w-5 h-5" />
                        <span className="font-bold text-xl">
                          {formatReviews(viewingBestseller.reviews)}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600">评价</div>
                    </div>
                  </div>

                  {/* 主图 */}
                  <div className="aspect-[3/4] rounded-lg overflow-hidden border-2 border-slate-200">
                    <img
                      src={viewingBestseller.thumbnailUrl}
                      alt={viewingBestseller.productName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* 链接 */}
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() =>
                      window.open(viewingBestseller.productUrl, "_blank")
                    }
                  >
                    <ExternalLink className="w-3.5 h-3.5 mr-2" />在
                    {viewingBestseller.platform.toUpperCase()}查看
                  </Button>
                </div>

                {/* 右侧：所有图片 */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-blue-500" />
                    产品参考图片（共 {viewingBestseller.imageCount} 张）
                  </h4>
                  <p className="text-sm text-slate-600 mb-4">
                    我们将分析并模仿这些图片的拍摄风格，为您生成相同风格的产品图
                  </p>

                  {/* 所有图片网格 */}
                  <div className="grid grid-cols-3 gap-2 max-h-96 overflow-y-auto pr-2">
                    {viewingBestseller.images.map((img) => (
                      <div
                        key={img.index}
                        className="relative aspect-square rounded overflow-hidden border border-slate-200 hover:border-blue-400 transition-all group"
                      >
                        <img
                          src={img.url}
                          alt={`图片 ${img.index}`}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                          <div className="flex items-center justify-between text-white text-xs">
                            <span>图 {img.index}</span>
                            {img.type && (
                              <span className="bg-white/20 px-1.5 py-0.5 rounded text-[10px]">
                                {img.type === "main"
                                  ? "主图"
                                  : img.type === "detail"
                                  ? "细节"
                                  : "场景"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* 底部操作 */}
              <DialogFooter className="gap-3">
                {selectedBestseller?.id === viewingBestseller.id ? (
                  <div className="flex-1 flex items-center justify-center gap-2 text-green-600 font-medium">
                    <Check className="w-5 h-5" />
                    <span>已选择此爆款</span>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    className="flex-1"
                    onClick={handleSelectInDialog}
                  >
                    <Sparkles className="w-4 h-4 mr-2" />
                    选择这个爆款（将生成 {viewingBestseller.imageCount} 张图片）
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
