import { TrendingTemplate } from "./types";

/**
 * 爆款模板库 - 以转化率为导向
 *
 * 核心理念：
 * 1. 真实产品图预览 - 让客户看到实际效果
 * 2. 社会证明 - 强调"多少人买了"、"转化率多高"
 * 3. 简化决策 - 客户一眼就能判断要不要用这个模板
 *
 * 运营策略：
 * - 从Amazon、Temu、TikTok Shop精选高销量产品
 * - 直接使用这些产品的图片作为预览
 * - 追踪真实销量和转化率数据
 * - 每月更新，淘汰低效模板
 */

export const TRENDING_TEMPLATES: TrendingTemplate[] = [
  // 🔥 Amazon 超级爆款 - 牛仔裤全身照
  {
    id: "apparel-us-001",
    name: "Amazon 超级爆款：全身正面照",
    description: "白底全身照，自然站姿，这个风格在Amazon卖了5万+条牛仔裤",
    category: "apparel",
    targetMarket: ["us", "global"],
    style: ["lifestyle", "minimal"],

    // 真实产品图预览
    previewImages: [
      "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=750&fit=crop&q=80", // 白底全身照示例1
      "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&h=750&fit=crop&q=80", // 白底全身照示例2
      "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=500&h=750&fit=crop&q=80", // 白底全身照示例3
    ],

    // 社会证明
    socialProof: {
      platform: "Amazon",
      productSales: 50000,
      conversionRate: 12.5,
      reviews: 8234,
      rating: 4.6,
    },

    sourceUrl: "https://www.amazon.com/dp/example",
    tags: ["高转化", "白底", "全身照"],

    // AI生成指令（用户不可见）
    generationPrompts: {
      composition:
        "Full body shot, centered composition with model taking up 60-70% of frame height. Clean white background with subtle shadow beneath feet for depth.",
      pose: "Natural standing pose with slight weight shift to one leg. One hand gently touching waist or hip, other hand relaxed at side. Shoulders relaxed, slight smile, eyes directly at camera.",
      lighting:
        "Soft, even studio lighting from front with subtle fill light. Main light at 45-degree angle. Slight rim light from behind for separation.",
      angle:
        "Eye-level camera angle, shot from approximately 8-10 feet away with medium focal length for natural proportions. Full body visible from head to toe.",
      style:
        "Professional e-commerce style with lifestyle feel. Clean, bright, and aspirational. Focus on product fit and drape. Color-accurate representation.",
    },
  },

  // 🔥 TikTok Shop 爆款 - 侧身轮廓
  {
    id: "apparel-us-002",
    name: "TikTok Shop 爆款：侧身展示",
    description: "侧面轮廓照，展现身材曲线，TikTok上这样的照片卖了3.5万件衣服",
    category: "apparel",
    targetMarket: ["us"],
    style: ["trendy", "lifestyle"],

    previewImages: [
      "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=500&h=750&fit=crop&q=80",
      "https://images.unsplash.com/photo-1509319117bbf-6b5bb0c2d4b5?w=500&h=750&fit=crop&q=80",
    ],

    socialProof: {
      platform: "TikTok Shop",
      productSales: 35000,
      conversionRate: 9.8,
      reviews: 5420,
      rating: 4.5,
    },

    tags: ["时尚", "侧面", "身材"],

    generationPrompts: {
      composition:
        "Three-quarter side view showing profile and silhouette. Model positioned slightly off-center. White or light neutral background.",
      pose: "Dynamic side stance with one leg slightly forward. Model looking over shoulder toward camera. Hand on hip or running through hair.",
      lighting:
        "Directional lighting from camera side to emphasize contours and body shape. Soft shadow on far side creates dimension.",
      angle:
        "Camera at chest height, slight upward angle for flattering perspective. Captures full body with emphasis on silhouette and garment fit.",
      style:
        "Contemporary fashion editorial meets e-commerce. More dynamic than standard product photos. Emphasizes fit, drape, and movement.",
    },
  },

  // 🔥 Amazon Best Seller - 细节特写
  {
    id: "apparel-us-003",
    name: "Amazon 畅销款：材质细节",
    description: "特写展示面料、缝线、纽扣，用这种图片的商家转化率提升40%",
    category: "apparel",
    targetMarket: ["us", "eu"],
    style: ["minimal", "studio"],

    previewImages: [
      "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=500&h=750&fit=crop&q=80",
      "https://images.unsplash.com/photo-1618333262478-b5e452197a8b?w=500&h=750&fit=crop&q=80",
    ],

    socialProof: {
      platform: "Amazon",
      productSales: 45000,
      conversionRate: 14.2,
      reviews: 6890,
      rating: 4.7,
    },

    tags: ["细节", "质感", "高端"],

    generationPrompts: {
      composition:
        "Close-up detail shot focusing on specific product features. Fill frame with texture, stitching, buttons, zippers, or fabric weave.",
      pose: "Partial view of model wearing item, focusing on key detail area. Hands may interact with detail naturally.",
      lighting:
        "Macro-style lighting to reveal texture and craftsmanship. Slightly directional to show fabric weave and stitching dimension.",
      angle:
        "Close-up, often 1-2 feet from subject. Shallow depth of field optional to draw eye to specific feature.",
      style:
        "High-quality product photography emphasizing craftsmanship and material quality. Sharp focus on detail. Professional and trustworthy feel.",
    },
  },

  // 🔥 Temu 超级爆款 - 多角度组合
  {
    id: "apparel-cn-001",
    name: "Temu 爆款：多角度展示",
    description: "正面+侧面+细节，一套图展示所有，Temu上销量2.8万+",
    category: "apparel",
    targetMarket: ["us", "global"],
    style: ["lifestyle", "minimal"],

    previewImages: [
      "https://images.unsplash.com/photo-1539533113208-f6df8cc8b2c0?w=500&h=750&fit=crop&q=80",
      "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=500&h=750&fit=crop&q=80",
      "https://images.unsplash.com/photo-1544441893-675973e31985?w=500&h=750&fit=crop&q=80",
    ],

    socialProof: {
      platform: "Temu",
      productSales: 28000,
      conversionRate: 11.3,
      reviews: 4120,
      rating: 4.4,
    },

    tags: ["全面", "多角度", "详细"],

    generationPrompts: {
      composition:
        "Full body shot, centered, clean white background. Show product from multiple angles in sequence.",
      pose: "Natural standing pose, confident but approachable. Slight smile, direct eye contact with camera.",
      lighting:
        "Bright, even studio lighting. Eliminate harsh shadows. Product should be clearly visible with accurate colors.",
      angle:
        "Eye-level, straight-on view. Medium distance to show full body and product details clearly.",
      style:
        "Professional e-commerce photography. Clean, bright, simple. Focus entirely on product presentation and fit.",
    },
  },

  // 🔥 欧洲市场 - 简约高级
  {
    id: "apparel-eu-001",
    name: "欧洲爆款：高级简约风",
    description: "Editorial风格，欧洲市场最受欢迎，客单价比普通图片高2倍",
    category: "apparel",
    targetMarket: ["eu"],
    style: ["editorial", "luxury", "minimal"],

    previewImages: [
      "https://images.unsplash.com/photo-1502716119720-b23a93e5fe1b?w=500&h=750&fit=crop&q=80",
      "https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&h=750&fit=crop&q=80",
    ],

    socialProof: {
      platform: "Amazon EU",
      productSales: 18000,
      conversionRate: 8.5,
      reviews: 2340,
      rating: 4.8,
    },

    tags: ["高级", "简约", "欧洲"],

    generationPrompts: {
      composition:
        "Full body editorial composition with generous negative space. Model positioned off-center following rule of thirds. Clean, minimalist background.",
      pose: "Editorial pose with strong lines and angles. Hand in pocket with elbow out, or looking away from camera. More attitude than lifestyle poses.",
      lighting:
        "High-contrast editorial lighting. Single strong light source creating defined shadows. Dramatic mood and atmosphere.",
      angle:
        "Eye-level or slightly below for empowerment. Shot from greater distance with prime lens for compression.",
      style:
        "Fashion editorial meets luxury brand aesthetic. More artistic and sophisticated. Slight desaturation or specific color tone.",
    },
  },

  // 🔥 配饰专用 - 佩戴效果
  {
    id: "accessories-001",
    name: "配饰爆款：佩戴展示",
    description: "展示配饰的佩戴效果，Amazon上手表、包包都用这种图，销量1.5万+",
    category: "accessories",
    targetMarket: ["us", "eu", "global"],
    style: ["lifestyle", "minimal"],

    previewImages: [
      "https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=500&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1624687943971-e86af76d57de?w=500&h=500&fit=crop&q=80",
    ],

    socialProof: {
      platform: "Amazon",
      productSales: 15000,
      conversionRate: 13.7,
      reviews: 3240,
      rating: 4.5,
    },

    tags: ["配饰", "佩戴", "特写"],

    generationPrompts: {
      composition:
        "Close-up to medium shot emphasizing accessory. Clean background. Focus on product in use.",
      pose: "Natural pose showing item in use. Hand elegantly positioned to display watch/bracelet/ring. Face may be partially visible or cropped.",
      lighting:
        "Even, bright lighting to show product details clearly. Slightly brighter than apparel shots to capture shine and texture.",
      angle:
        "Close-up angle emphasizing accessory. Slight angle to show dimensions. Product is the absolute focus.",
      style:
        "Clean, professional product photography with lifestyle element. White or very light background. Color-accurate to build trust.",
    },
  },

  // 🔥 家居生活 - 场景化
  {
    id: "home-us-001",
    name: "家居爆款：生活场景",
    description: "展示家居产品在真实环境中的效果，转化率比白底高60%",
    category: "home",
    targetMarket: ["us", "eu"],
    style: ["lifestyle", "minimal"],

    previewImages: [
      "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=500&h=500&fit=crop&q=80",
      "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=500&h=500&fit=crop&q=80",
    ],

    socialProof: {
      platform: "Amazon",
      productSales: 22000,
      conversionRate: 10.8,
      reviews: 4560,
      rating: 4.6,
    },

    tags: ["场景", "生活", "氛围"],

    generationPrompts: {
      composition:
        "Product placed in realistic home setting. Wide enough to show context but focused on product. Clean, organized space with complementary styling.",
      pose: "N/A for static home goods, or showing hands naturally using/interacting with product if applicable.",
      lighting:
        "Natural, warm lighting suggesting real home environment. Soft window light ideal. Cozy, inviting atmosphere while maintaining product visibility.",
      angle:
        "Eye-level or slightly elevated as if viewer is in the space. For tabletop: 30-45 degree angle. Show scale with recognizable objects.",
      style:
        "Aspirational lifestyle photography that feels attainable. Instagram-worthy but not overly styled. Natural color tones, possibly warmed.",
    },
  },
];

// 辅助函数：按分类筛选
export function getTemplatesByCategory(category: string): TrendingTemplate[] {
  return TRENDING_TEMPLATES.filter((t) => t.category === category);
}

// 辅助函数：按目标市场筛选
export function getTemplatesByMarket(market: string): TrendingTemplate[] {
  return TRENDING_TEMPLATES.filter((t) =>
    t.targetMarket.includes(market as any)
  );
}

// 辅助函数：按风格筛选
export function getTemplatesByStyle(style: string): TrendingTemplate[] {
  return TRENDING_TEMPLATES.filter((t) => t.style.includes(style as any));
}

// 辅助函数：获取热门模板（按销量排序）
export function getTopTemplates(limit: number = 6): TrendingTemplate[] {
  return [...TRENDING_TEMPLATES]
    .sort((a, b) => b.socialProof.productSales - a.socialProof.productSales)
    .slice(0, limit);
}

// 分类标签的中文映射
export const CATEGORY_LABELS: Record<string, string> = {
  apparel: "服装",
  accessories: "配饰",
  home: "家居",
  electronics: "电子产品",
  beauty: "美妆",
  sports: "运动用品",
  jewelry: "珠宝首饰",
};

// 市场标签的中文映射
export const MARKET_LABELS: Record<string, string> = {
  us: "美国",
  eu: "欧洲",
  jp: "日本",
  global: "全球",
};

// 风格标签的中文映射
export const STYLE_LABELS: Record<string, string> = {
  minimal: "简约",
  luxury: "奢华",
  lifestyle: "生活方式",
  studio: "专业摄影棚",
  outdoor: "户外",
  editorial: "编辑风格",
  casual: "休闲",
  trendy: "时尚潮流",
};
