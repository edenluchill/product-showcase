/**
 * 将爬取的数据转换为应用格式
 */

import * as fs from "fs/promises";
import * as path from "path";

interface ScrapedProduct {
  id: string;
  url: string;
  title: string;
  price: number;
  sales: number;
  rating: number;
  reviews: number;
  images: string[];
  category: string;
  scrapedAt: string;
}

interface AppBestseller {
  id: string;
  platform: "temu" | "amazon" | "shein";
  productName: string;
  sales: number;
  rating: number;
  reviews: number;
  thumbnailUrl: string;
  imageCount: number;
  productUrl: string;
  images: Array<{
    url: string;
    index: number;
    type?: "main" | "detail" | "lifestyle";
  }>;
}

async function convertScrapedData() {
  const inputDir = "./data/bestsellers";
  const outputFile = "./src/lib/bestsellers-generated.ts";

  console.log("🔄 开始转换数据...\n");

  try {
    // 读取所有JSON文件
    const files = await fs.readdir(inputDir);
    const jsonFiles = files.filter((f) => f.endsWith(".json"));

    if (jsonFiles.length === 0) {
      console.log("⚠️  没有找到数据文件");
      return;
    }

    const allBestsellers: Record<string, AppBestseller[]> = {};
    let totalProducts = 0;
    let totalImages = 0;

    for (const file of jsonFiles) {
      const category = file.replace(".json", "");
      console.log(`📁 处理类别: ${category}`);

      const content = await fs.readFile(path.join(inputDir, file), "utf-8");
      const products: ScrapedProduct[] = JSON.parse(content);

      allBestsellers[category] = products.map((p, index) => {
        const images = p.images || [];
        totalImages += images.length;

        return {
          id: `temu-${sanitizeId(category)}-${index + 1}`,
          platform: "temu" as const,
          productName: p.title,
          sales: p.sales || 0,
          rating: p.rating || 0,
          reviews: p.reviews || 0,
          thumbnailUrl: images[0] || "",
          imageCount: images.length,
          productUrl: p.url || "",
          images: images.map((url, i) => ({
            url,
            index: i + 1,
            type:
              i === 0
                ? ("main" as const)
                : i < 5
                ? ("detail" as const)
                : ("lifestyle" as const),
          })),
        };
      });

      console.log(`  ✅ ${products.length} 个产品`);
      totalProducts += products.length;
    }

    // 生成TypeScript文件
    const tsContent = generateTypeScriptFile(allBestsellers);

    await fs.writeFile(outputFile, tsContent, "utf-8");

    console.log("\n📊 转换统计:");
    console.log(`  • 类别数: ${Object.keys(allBestsellers).length}`);
    console.log(`  • 产品数: ${totalProducts}`);
    console.log(`  • 图片数: ${totalImages}`);
    console.log(`\n✅ 已生成: ${outputFile}`);
  } catch (error) {
    console.error("❌ 转换失败:", error);
    throw error;
  }
}

function generateTypeScriptFile(data: Record<string, AppBestseller[]>): string {
  const timestamp = new Date().toISOString();

  return `// 🤖 此文件由爬虫自动生成
// 生成时间: ${timestamp}
// 
// ⚠️ 请勿手动编辑此文件
// 要更新数据，请运行: npm run scrape && npm run convert-data

import { Bestseller } from './types';

export const SCRAPED_BESTSELLERS: Record<string, Bestseller[]> = ${JSON.stringify(
    data,
    null,
    2
  )};

// 导出辅助函数
export function getScrapedBestsellers(category: string): Bestseller[] {
  return SCRAPED_BESTSELLERS[category] || [];
}

export function getAllCategories(): string[] {
  return Object.keys(SCRAPED_BESTSELLERS);
}

export function getTotalProducts(): number {
  return Object.values(SCRAPED_BESTSELLERS)
    .reduce((sum, products) => sum + products.length, 0);
}

// 元数据
export const SCRAPE_METADATA = {
  timestamp: '${timestamp}',
  categories: ${Object.keys(data).length},
  totalProducts: ${Object.values(data).reduce(
    (sum, products) => sum + products.length,
    0
  )},
  totalImages: ${Object.values(data).reduce(
    (sum, products) =>
      sum + products.reduce((imgSum, p) => imgSum + p.imageCount, 0),
    0
  )}
};
`;
}

function sanitizeId(str: string): string {
  return str.replace(/[^a-z0-9]/gi, "-").toLowerCase();
}

// 运行
if (require.main === module) {
  convertScrapedData();
}

export default convertScrapedData;
