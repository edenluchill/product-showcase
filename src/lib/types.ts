export type PagesFunction<Env = unknown> = (context: {
  request: Request;
  env: Env;
  params: Record<string, string>;
  waitUntil: (promise: Promise<unknown>) => void;
  next: () => Promise<Response>;
  data: Record<string, unknown>;
}) => Response | Promise<Response>;

// 爆款模板类型定义
export interface TrendingTemplate {
  id: string;
  name: string;
  description: string;
  category: ProductCategory;
  targetMarket: TargetMarket[];
  style: TemplateStyle[];

  // ⭐ 核心：真实产品图预览
  previewImages: string[]; // 真实的temu/amazon产品图片URLs

  // ⭐ 核心：社会证明数据
  socialProof: {
    platform: string; // "Amazon" | "Temu" | "TikTok Shop"
    productSales: number; // 使用这个模板的产品销量
    conversionRate?: number; // 转化率（可选）
    reviews?: number; // 评价数
    rating?: number; // 评分
  };

  sourceUrl?: string; // 可选：原始爆款链接
  tags: string[];

  // AI生成时的详细prompt（用户不可见，仅供AI使用）
  generationPrompts: {
    composition: string;
    pose: string;
    lighting: string;
    angle: string;
    style: string;
  };
}

export type ProductCategory =
  | "apparel" // 服装
  | "accessories" // 配饰
  | "home" // 家居
  | "electronics" // 电子产品
  | "beauty" // 美妆
  | "sports" // 运动用品
  | "jewelry"; // 珠宝首饰

export type TargetMarket =
  | "us" // 美国
  | "eu" // 欧洲
  | "jp" // 日本
  | "global"; // 全球

export type TemplateStyle =
  | "minimal" // 简约
  | "luxury" // 奢华
  | "lifestyle" // 生活方式
  | "studio" // 专业摄影棚
  | "outdoor" // 户外
  | "editorial" // 编辑风格
  | "casual" // 休闲
  | "trendy"; // 时尚潮流

// ====== 爆款复制系统类型定义 ======

// 产品分析结果
export interface ProductAnalysis {
  category: string; // "女士牛仔裤"
  subCategory?: string; // "宽松直筒"
  features: string[]; // ["高腰", "浅蓝色", "破洞"]
  searchKeywords: string[]; // ["womens", "loose", "jeans"]
  confidence: number; // 0.95
}

// 爆款产品信息
export interface Bestseller {
  id: string;
  platform: "temu" | "amazon" | "shein";
  productName: string;
  price: number; // 价格
  currency: "USD" | "CAD" | "EUR" | "GBP" | "CNY"; // 货币类型
  sales: number;
  rating: number;
  reviews: number;
  thumbnailUrl: string;
  imageCount: number;
  productUrl: string;
  images: BestsellerImage[];
}

export interface BestsellerImage {
  url: string;
  index: number;
  type?: "main" | "detail" | "lifestyle";
  viewAngle?: "front" | "back" | "side" | "other"; // 新增：明确标记图片视角
}

// 图片风格分析结果
export interface ImageStyle {
  angle: "front" | "side" | "back" | "detail" | "overhead" | "3/4";
  shot: "full-body" | "half-body" | "close-up" | "detail";
  pose: string; // 详细的姿势描述
  background: string; // 背景描述
  lighting: string; // 光线描述
  focusArea?: string; // 特写的焦点区域
  props?: string[]; // 道具
  specialNotes?: string; // 特殊说明
  group?: number;
  promptVariant?: string;
}

// 批量生成结果
export interface GeneratedImageSet {
  images: GeneratedImage[];
  totalCount: number;
  successCount: number;
  failedCount: number;
}

export interface GeneratedImage {
  index: number;
  group: number; // 1, 2, 3 表示三组不同的 prompt 策略
  promptVariant: string; // "精准还原" | "风格优化" | "创意混合"
  url: string;
  status: "success" | "failed" | "pending" | "generating";
  style?: ImageStyle; // 可选：基于风格分析的生成方式会有这个
  referenceUrl?: string; // 可选：基于参考图的生成方式会有这个
  error?: string;
}
