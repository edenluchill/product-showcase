/**
 * Temu 爆款产品爬虫
 *
 * ⚠️ 法律声明：
 * - 此脚本仅用于学习和研究目的
 * - 使用前请确保遵守Temu的服务条款
 * - 建议使用合理的请求频率，避免对服务器造成压力
 * - 商业使用前请咨询法律顾问
 */

import puppeteer, { Browser, Page } from "puppeteer";
import * as fs from "fs/promises";
import * as path from "path";
import axios from "axios";

interface TemuProduct {
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

interface ScraperConfig {
  headless: boolean;
  maxProducts: number;
  downloadImages: boolean;
  outputDir: string;
  delay: number; // 请求间隔（毫秒）
}

export class TemuScraper {
  private browser: Browser | null = null;
  private config: ScraperConfig;

  constructor(config: Partial<ScraperConfig> = {}) {
    this.config = {
      headless: true,
      maxProducts: 10,
      downloadImages: true,
      outputDir: "./data/bestsellers",
      delay: 2000,
      ...config,
    };
  }

  async init() {
    console.log("🚀 启动浏览器...");
    this.browser = await puppeteer.launch({
      headless: this.config.headless,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
      console.log("✅ 浏览器已关闭");
    }
  }

  /**
   * 搜索爆款产品
   */
  async searchBestsellers(keyword: string): Promise<TemuProduct[]> {
    if (!this.browser) throw new Error("浏览器未初始化");

    const page = await this.browser.newPage();

    try {
      // 设置用户代理，避免被检测为爬虫
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      console.log(`🔍 搜索关键词: ${keyword}`);

      // 访问Temu搜索页面
      const searchUrl = `https://www.temu.com/search_result.html?search_key=${encodeURIComponent(
        keyword
      )}`;
      await page.goto(searchUrl, { waitUntil: "networkidle2" });

      // 等待产品列表加载
      await this.delay(3000);

      // 提取产品数据
      const products = await page.evaluate((maxProducts) => {
        const items = document.querySelectorAll("[data-product-id]");
        const results: any[] = [];

        items.forEach((item, index) => {
          if (index >= maxProducts) return;

          try {
            const productId = item.getAttribute("data-product-id") || "";
            const link = item.querySelector("a");
            const title =
              item.querySelector('[class*="title"]')?.textContent?.trim() || "";
            const priceText =
              item.querySelector('[class*="price"]')?.textContent?.trim() ||
              "0";
            const salesText =
              item.querySelector('[class*="sales"]')?.textContent?.trim() ||
              "0";
            const ratingText =
              item.querySelector('[class*="rating"]')?.textContent?.trim() ||
              "0";
            const reviewsText =
              item.querySelector('[class*="reviews"]')?.textContent?.trim() ||
              "0";

            // 提取所有图片
            const imageElements = item.querySelectorAll("img");
            const images: string[] = [];
            imageElements.forEach((img) => {
              const src =
                img.getAttribute("src") || img.getAttribute("data-src");
              if (src && src.startsWith("http")) {
                images.push(src);
              }
            });

            results.push({
              id: productId,
              url: link ? link.href : "",
              title,
              price: parseFloat(priceText.replace(/[^0-9.]/g, "")),
              sales: parseInt(salesText.replace(/[^0-9]/g, "")) || 0,
              rating: parseFloat(ratingText.replace(/[^0-9.]/g, "")) || 0,
              reviews: parseInt(reviewsText.replace(/[^0-9]/g, "")) || 0,
              images,
            });
          } catch (error) {
            console.error("解析产品数据失败:", error);
          }
        });

        return results;
      }, this.config.maxProducts);

      console.log(`✅ 找到 ${products.length} 个产品`);

      // 对每个产品获取详细信息
      const detailedProducts: TemuProduct[] = [];

      for (const product of products) {
        if (!product.url) continue;

        try {
          console.log(`📸 获取产品详情: ${product.title.substring(0, 50)}...`);
          const details = await this.getProductDetails(product.url);

          detailedProducts.push({
            ...product,
            ...details,
            category: keyword,
            scrapedAt: new Date().toISOString(),
          });

          await this.delay(this.config.delay);
        } catch (error) {
          console.error(`获取产品详情失败: ${product.title}`, error);
        }
      }

      return detailedProducts;
    } finally {
      await page.close();
    }
  }

  /**
   * 获取产品详细信息（包括所有图片）
   */
  private async getProductDetails(
    productUrl: string
  ): Promise<Partial<TemuProduct>> {
    if (!this.browser) throw new Error("浏览器未初始化");

    const page = await this.browser.newPage();

    try {
      await page.setUserAgent(
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      );

      await page.goto(productUrl, { waitUntil: "networkidle2" });
      await this.delay(2000);

      // 提取所有产品图片
      const images = await page.evaluate(() => {
        const imageUrls: string[] = [];

        // 查找主图区域
        const mainImages = document.querySelectorAll(
          '[class*="gallery"] img, [class*="image-list"] img, [class*="product-image"] img'
        );
        mainImages.forEach((img) => {
          const src = img.getAttribute("src") || img.getAttribute("data-src");
          if (src && src.startsWith("http")) {
            // 获取高清版本（去掉尺寸限制）
            const highResSrc = src.replace(/_\d+x\d+\./, "_2000x2000.");
            imageUrls.push(highResSrc);
          }
        });

        // 查找缩略图
        const thumbnails = document.querySelectorAll(
          '[class*="thumbnail"] img'
        );
        thumbnails.forEach((img) => {
          const src = img.getAttribute("src") || img.getAttribute("data-src");
          if (src && src.startsWith("http")) {
            const highResSrc = src.replace(/_\d+x\d+\./, "_2000x2000.");
            if (!imageUrls.includes(highResSrc)) {
              imageUrls.push(highResSrc);
            }
          }
        });

        return imageUrls;
      });

      return { images };
    } finally {
      await page.close();
    }
  }

  /**
   * 下载图片
   */
  async downloadImages(product: TemuProduct): Promise<string[]> {
    const productDir = path.join(
      this.config.outputDir,
      "images",
      this.sanitizeFilename(product.id)
    );

    await fs.mkdir(productDir, { recursive: true });

    const localPaths: string[] = [];

    for (let i = 0; i < product.images.length; i++) {
      const imageUrl = product.images[i];
      const filename = `image_${i + 1}.jpg`;
      const filepath = path.join(productDir, filename);

      try {
        console.log(
          `  📥 下载图片 ${i + 1}/${product.images.length}: ${filename}`
        );

        const response = await axios.get(imageUrl, {
          responseType: "arraybuffer",
          timeout: 30000,
        });

        await fs.writeFile(filepath, response.data);
        localPaths.push(filepath);
      } catch (error) {
        console.error(`  ❌ 下载图片失败: ${filename}`, error);
      }

      await this.delay(500);
    }

    return localPaths;
  }

  /**
   * 保存产品数据
   */
  async saveProducts(products: TemuProduct[], category: string) {
    const dataDir = this.config.outputDir;
    await fs.mkdir(dataDir, { recursive: true });

    // 保存JSON
    const jsonPath = path.join(
      dataDir,
      `${this.sanitizeFilename(category)}.json`
    );
    await fs.writeFile(jsonPath, JSON.stringify(products, null, 2), "utf-8");
    console.log(`💾 数据已保存: ${jsonPath}`);

    // 如果需要下载图片
    if (this.config.downloadImages) {
      console.log("📸 开始下载图片...");
      for (const product of products) {
        try {
          const localPaths = await this.downloadImages(product);
          console.log(
            `  ✅ ${product.title.substring(0, 50)}... (${localPaths.length}张)`
          );
        } catch (error) {
          console.error(`  ❌ 下载失败: ${product.title}`, error);
        }
      }
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private sanitizeFilename(filename: string): string {
    return filename.replace(/[^a-z0-9_-]/gi, "_").toLowerCase();
  }
}

// 使用示例
async function main() {
  const scraper = new TemuScraper({
    headless: false, // 显示浏览器，方便调试
    maxProducts: 5,
    downloadImages: true,
    outputDir: "./data/bestsellers",
    delay: 2000,
  });

  try {
    await scraper.init();

    // 搜索不同类别的爆款
    const categories = [
      "womens jeans",
      "mens t-shirt",
      "womens dress",
      "sneakers",
    ];

    for (const category of categories) {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`🎯 开始爬取类别: ${category}`);
      console.log("=".repeat(60));

      const products = await scraper.searchBestsellers(category);

      if (products.length > 0) {
        await scraper.saveProducts(products, category);
        console.log(`✅ ${category} 完成，共 ${products.length} 个产品\n`);
      } else {
        console.log(`⚠️  ${category} 没有找到产品\n`);
      }

      // 类别之间延迟，避免被封
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }

    console.log("\n🎉 所有数据爬取完成！");
  } catch (error) {
    console.error("❌ 爬虫运行失败:", error);
  } finally {
    await scraper.close();
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  main();
}

export default TemuScraper;
