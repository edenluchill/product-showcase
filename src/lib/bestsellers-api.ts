/**
 * 🌐 爆款产品 API 客户端
 *
 * 提供两种模式：
 * 1. 实时爬虫模式（需要运行爬虫API服务器）
 * 2. 静态数据模式（使用本地数据库）
 */

import { Bestseller } from "./types";
import { searchBestsellersByKeywords as searchLocal } from "./bestsellers";

// 配置
const SCRAPER_API_URL =
  import.meta.env.VITE_SCRAPER_API_URL || "http://localhost:3001";
const USE_LIVE_SCRAPER = import.meta.env.VITE_USE_LIVE_SCRAPER === "true";

/**
 * 从实时爬虫API搜索爆款
 */
async function searchFromLiveScraper(
  keywords: string[]
): Promise<Bestseller[]> {
  try {
    console.log("🕷️ 使用实时爬虫搜索...");

    const response = await fetch(`${SCRAPER_API_URL}/api/search-bestsellers`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ keywords }),
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.message || "爬虫搜索失败");
    }

    console.log(`✅ 实时爬虫找到 ${data.bestsellers.length} 个产品`);
    return data.bestsellers;
  } catch (error) {
    console.error("❌ 实时爬虫失败:", error);

    // 降级到本地数据库
    console.log("⚠️  降级到本地数据库...");
    return searchLocal(keywords);
  }
}

/**
 * 搜索爆款产品（智能模式）
 *
 * - 如果启用了实时爬虫，则使用爬虫API
 * - 如果爬虫不可用或失败，则降级到本地数据库
 */
export async function searchBestsellersByKeywords(
  keywords: string[]
): Promise<Bestseller[]> {
  // 如果启用了实时爬虫
  if (USE_LIVE_SCRAPER) {
    return searchFromLiveScraper(keywords);
  }

  // 否则使用本地数据库
  console.log("📦 使用本地数据库搜索...");
  return searchLocal(keywords);
}

/**
 * 检查爬虫API是否可用
 */
export async function checkScraperStatus(): Promise<boolean> {
  try {
    const response = await fetch(`${SCRAPER_API_URL}/health`, {
      method: "GET",
      signal: AbortSignal.timeout(3000), // 3秒超时
    });

    if (response.ok) {
      const data = await response.json();
      return data.status === "ok" && data.scraperInitialized;
    }

    return false;
  } catch (error) {
    return false;
  }
}

/**
 * 获取当前使用的搜索模式
 */
export function getSearchMode(): "live" | "local" {
  return USE_LIVE_SCRAPER ? "live" : "local";
}
