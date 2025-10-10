import { Bestseller } from "./types";

/**
 * 爆款产品数据库
 *
 * 数据来源：
 * - 初期：人工精选 + 真实产品截图
 * - 中期：实时爬虫（参见 api-server/）
 * - 长期：官方API或人工维护
 *
 * 使用方式：
 * 1. 客户上传产品图
 * 2. AI分析产品类型（如：womens-jeans）
 * 3. 从这里查找对应类别的爆款
 * 4. 客户选择一个爆款
 * 5. AI分析爆款的每张图片风格
 * 6. 批量生成（模仿爆款的每张图）
 */

export const BESTSELLERS_DATABASE: Record<string, Bestseller[]> = {
  // 女士牛仔裤
  "womens-jeans": [
    {
      id: "temu-womens-jeans-1",
      platform: "temu",
      productName: "Women's 2025 Loose Wide Leg Jeans - Light Blue",
      price: 30.58,
      currency: "CAD",
      sales: 77000,
      rating: 4.7,
      reviews: 12543,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=900&fit=crop&q=80",
      imageCount: 8,
      productUrl:
        "https://temu.com/ca/womens-2025--loose-wide-leg-straight-jeans",
      images: [
        {
          url: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&h=900&fit=crop&q=80",
          index: 1,
          type: "main",
        },
        {
          url: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=900&fit=crop&q=80",
          index: 2,
          type: "main",
        },
        {
          url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&h=900&fit=crop&q=80",
          index: 3,
          type: "detail",
        },
        {
          url: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?w=600&h=900&fit=crop&q=80",
          index: 4,
          type: "detail",
        },
        {
          url: "https://images.unsplash.com/photo-1539533113208-f6df8cc8b2c0?w=600&h=900&fit=crop&q=80",
          index: 5,
          type: "lifestyle",
        },
        {
          url: "https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&h=900&fit=crop&q=80",
          index: 6,
          type: "lifestyle",
        },
        {
          url: "https://images.unsplash.com/photo-1509319117bbf-6b5bb0c2d4b5?w=600&h=900&fit=crop&q=80",
          index: 7,
          type: "detail",
        },
        {
          url: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&h=900&fit=crop&q=80",
          index: 8,
          type: "detail",
        },
      ],
    },
    {
      id: "temu-womens-jeans-2",
      platform: "temu",
      productName: "Women's High Waisted Straight Leg Jeans",
      price: 25.99,
      currency: "USD",
      sales: 55000,
      rating: 4.6,
      reviews: 9876,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&h=900&fit=crop&q=80",
      imageCount: 6,
      productUrl: "https://temu.com/...",
      images: [
        {
          url: "https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=600&h=900&fit=crop&q=80",
          index: 1,
          type: "main",
        },
        {
          url: "https://images.unsplash.com/photo-1582418702059-97ebafb35d09?w=600&h=900&fit=crop&q=80",
          index: 2,
          type: "main",
        },
        {
          url: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&h=900&fit=crop&q=80",
          index: 3,
          type: "detail",
        },
        {
          url: "https://images.unsplash.com/photo-1602293589930-45aad59ba3ab?w=600&h=900&fit=crop&q=80",
          index: 4,
          type: "detail",
        },
        {
          url: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=600&h=900&fit=crop&q=80",
          index: 5,
          type: "lifestyle",
        },
        {
          url: "https://images.unsplash.com/photo-1618333262478-b5e452197a8b?w=600&h=900&fit=crop&q=80",
          index: 6,
          type: "detail",
        },
      ],
    },
  ],

  // 男士T恤
  "mens-tshirt": [
    {
      id: "temu-mens-tshirt-1",
      platform: "temu",
      productName: "Men's Basic Cotton T-Shirt - Multiple Colors",
      price: 12.99,
      currency: "USD",
      sales: 42000,
      rating: 4.5,
      reviews: 7234,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=900&fit=crop&q=80",
      imageCount: 6,
      productUrl: "https://temu.com/...",
      images: [
        {
          url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&h=900&fit=crop&q=80",
          index: 1,
          type: "main",
        },
        {
          url: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600&h=900&fit=crop&q=80",
          index: 2,
          type: "main",
        },
        {
          url: "https://images.unsplash.com/photo-1622445275576-721325763afe?w=600&h=900&fit=crop&q=80",
          index: 3,
          type: "detail",
        },
        {
          url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=600&h=900&fit=crop&q=80",
          index: 4,
          type: "detail",
        },
        {
          url: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=900&fit=crop&q=80",
          index: 5,
          type: "lifestyle",
        },
        {
          url: "https://images.unsplash.com/photo-1574180566232-aaad1b5b8450?w=600&h=900&fit=crop&q=80",
          index: 6,
          type: "detail",
        },
      ],
    },
  ],

  // 女士连衣裙
  "womens-dress": [
    {
      id: "temu-womens-dress-1",
      platform: "temu",
      productName: "Women's Summer Floral Dress",
      price: 28.99,
      currency: "USD",
      sales: 38000,
      rating: 4.6,
      reviews: 6543,
      thumbnailUrl:
        "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=900&fit=crop&q=80",
      imageCount: 7,
      productUrl: "https://temu.com/...",
      images: [
        {
          url: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&h=900&fit=crop&q=80",
          index: 1,
          type: "main",
        },
        {
          url: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=900&fit=crop&q=80",
          index: 2,
          type: "main",
        },
        {
          url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=600&h=900&fit=crop&q=80",
          index: 3,
          type: "detail",
        },
        {
          url: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd?w=600&h=900&fit=crop&q=80",
          index: 4,
          type: "detail",
        },
        {
          url: "https://images.unsplash.com/photo-1611601322396-c0c62634a6d7?w=600&h=900&fit=crop&q=80",
          index: 5,
          type: "lifestyle",
        },
        {
          url: "https://images.unsplash.com/photo-1612423284934-2850a4ea6b0f?w=600&h=900&fit=crop&q=80",
          index: 6,
          type: "lifestyle",
        },
        {
          url: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?w=600&h=900&fit=crop&q=80",
          index: 7,
          type: "detail",
        },
      ],
    },
  ],
};

// 搜索爆款产品
export function searchBestsellers(
  category: string,
  limit: number = 5
): Bestseller[] {
  const normalizedCategory = category.toLowerCase().replace(/[^a-z0-9]/g, "-");
  const results = BESTSELLERS_DATABASE[normalizedCategory] || [];

  return results.sort((a, b) => b.sales - a.sales).slice(0, limit);
}

// 根据搜索关键词查找爆款
export function searchBestsellersByKeywords(keywords: string[]): Bestseller[] {
  const allBestsellers: Bestseller[] = [];

  // 简单的关键词匹配
  for (const [category, bestsellers] of Object.entries(BESTSELLERS_DATABASE)) {
    const categoryMatches = keywords.some((keyword) =>
      category.includes(keyword.toLowerCase())
    );

    if (categoryMatches) {
      allBestsellers.push(...bestsellers);
    }
  }

  // 按销量排序
  return allBestsellers.sort((a, b) => b.sales - a.sales);
}

// 获取单个爆款详情
export function getBestseller(id: string): Bestseller | null {
  for (const bestsellers of Object.values(BESTSELLERS_DATABASE)) {
    const found = bestsellers.find((b) => b.id === id);
    if (found) return found;
  }
  return null;
}

// 获取所有分类
export function getAllCategories(): string[] {
  return Object.keys(BESTSELLERS_DATABASE);
}
