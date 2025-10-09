import { useState, useMemo } from "react";
import { TrendingTemplate } from "@/lib/types";
import {
  TRENDING_TEMPLATES,
  getTemplatesByCategory,
  getTopTemplates,
  CATEGORY_LABELS,
  MARKET_LABELS,
} from "@/lib/templates";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, TrendingUp, Star, ShoppingCart } from "lucide-react";

interface TemplateSelectorProps {
  selectedTemplate: TrendingTemplate | null;
  onSelectTemplate: (template: TrendingTemplate) => void;
}

export function TemplateSelector({
  selectedTemplate,
  onSelectTemplate,
}: TemplateSelectorProps) {
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [marketFilter, setMarketFilter] = useState<string>("all");

  // 筛选模板
  const filteredTemplates = useMemo(() => {
    let templates = TRENDING_TEMPLATES;

    if (categoryFilter !== "all") {
      templates = getTemplatesByCategory(categoryFilter);
    }

    if (marketFilter !== "all") {
      templates = templates.filter((t) =>
        t.targetMarket.includes(marketFilter as any)
      );
    }

    return templates;
  }, [categoryFilter, marketFilter]);

  // 获取热门推荐
  const topTemplates = useMemo(() => getTopTemplates(3), []);

  // 格式化销量数字
  const formatSales = (num: number) => {
    if (num >= 10000) return `${(num / 10000).toFixed(1)}万`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  return (
    <div className="space-y-8">
      {/* 热门推荐 - 大卡片 */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="w-6 h-6 text-orange-500" />
          <h3 className="text-2xl font-bold">🔥 热门爆款模板</h3>
          <span className="text-sm text-slate-500">最多人用，转化率最高</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-2xl ${
                selectedTemplate?.id === template.id
                  ? "ring-4 ring-blue-500 shadow-2xl"
                  : ""
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              <CardContent className="p-0">
                {/* 真实产品图预览 - 大图 */}
                <div className="relative h-80 overflow-hidden bg-slate-50">
                  <img
                    src={template.previewImages[0]}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />

                  {/* 选中标记 */}
                  {selectedTemplate?.id === template.id && (
                    <div className="absolute top-4 right-4 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Check className="w-6 h-6 text-white" />
                    </div>
                  )}

                  {/* 平台标签 */}
                  <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-xs font-medium">
                    {template.socialProof.platform}
                  </div>
                </div>

                {/* 核心信息 */}
                <div className="p-5">
                  <h4 className="font-bold text-lg mb-2">{template.name}</h4>

                  {/* 社会证明 - 最突出的部分 */}
                  <div className="grid grid-cols-3 gap-2 mb-3 pb-3 border-b">
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-orange-500">
                        <ShoppingCart className="w-4 h-4" />
                        <span className="font-bold">
                          {formatSales(template.socialProof.productSales)}+
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">销量</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-green-500">
                        <TrendingUp className="w-4 h-4" />
                        <span className="font-bold">
                          {template.socialProof.conversionRate}%
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">转化率</div>
                    </div>

                    <div className="text-center">
                      <div className="flex items-center justify-center gap-1 text-yellow-500">
                        <Star className="w-4 h-4 fill-yellow-500" />
                        <span className="font-bold">
                          {template.socialProof.rating}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500">评分</div>
                    </div>
                  </div>

                  {/* 简短描述 */}
                  <p className="text-sm text-slate-600 mb-3">
                    {template.description}
                  </p>

                  {/* 小预览图 */}
                  {template.previewImages.length > 1 && (
                    <div className="flex gap-2">
                      {template.previewImages.slice(1, 4).map((img, idx) => (
                        <div
                          key={idx}
                          className="w-16 h-16 rounded overflow-hidden border"
                        >
                          <img
                            src={img}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 筛选器 - 简化 */}
      <div>
        <h3 className="text-xl font-bold mb-4">浏览更多模板</h3>

        <div className="flex gap-4 mb-6">
          {/* 分类筛选 */}
          <div className="flex gap-2">
            <Button
              variant={categoryFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter("all")}
            >
              全部
            </Button>
            {Object.entries(CATEGORY_LABELS)
              .slice(0, 5)
              .map(([key, label]) => (
                <Button
                  key={key}
                  variant={categoryFilter === key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCategoryFilter(key)}
                >
                  {label}
                </Button>
              ))}
          </div>

          {/* 市场筛选 */}
          <div className="flex gap-2">
            {Object.entries(MARKET_LABELS).map(([key, label]) => (
              <Button
                key={key}
                variant={marketFilter === key ? "default" : "outline"}
                size="sm"
                onClick={() => setMarketFilter(key)}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* 模板网格 - 小卡片 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredTemplates.map((template) => (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedTemplate?.id === template.id
                  ? "ring-2 ring-blue-500 shadow-lg"
                  : ""
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              <CardContent className="p-0">
                {/* 图片 */}
                <div className="relative h-56 overflow-hidden bg-slate-50">
                  <img
                    src={template.previewImages[0]}
                    alt={template.name}
                    className="w-full h-full object-cover"
                  />

                  {selectedTemplate?.id === template.id && (
                    <div className="absolute top-2 right-2 w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  )}

                  <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {template.socialProof.platform}
                  </div>
                </div>

                {/* 信息 */}
                <div className="p-3">
                  <h4 className="font-semibold text-sm mb-2 line-clamp-1">
                    {template.name}
                  </h4>

                  {/* 关键数据 */}
                  <div className="flex items-center justify-between text-xs mb-1">
                    <div className="flex items-center gap-1 text-orange-500">
                      <ShoppingCart className="w-3 h-3" />
                      <span className="font-bold">
                        {formatSales(template.socialProof.productSales)}+
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-green-500">
                      <TrendingUp className="w-3 h-3" />
                      <span className="font-bold">
                        {template.socialProof.conversionRate}%
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-yellow-500">
                      <Star className="w-3 h-3 fill-yellow-500" />
                      <span className="font-bold">
                        {template.socialProof.rating}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12 text-slate-500">
            <p>暂无符合条件的模板</p>
          </div>
        )}
      </div>
    </div>
  );
}
