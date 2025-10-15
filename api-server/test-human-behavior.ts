/**
 * 测试人类行为模拟的scraper
 *
 * 这个脚本演示如何使用增强的人类行为模拟功能：
 * - 鼠标随机贝塞尔曲线移动
 * - 逐字打字带随机延迟
 * - 随机页面滚动
 * - 模拟真实用户交互
 */

import { TemuScraper } from "./src/scraper";

async function main() {
  console.log("🎭 测试人类行为模拟爬虫");
  console.log("=".repeat(50));

  const scraper = new TemuScraper({
    headless: false, // 可见模式，方便观察
    maxProducts: 5,
    delay: 2000,
    timeout: 60000,
    debug: true,
    saveScreenshots: true,
    interceptRequests: true,
  });

  try {
    await scraper.init();

    console.log("\n📝 测试搜索: jeans");
    console.log("观察以下人类行为模拟:");
    console.log("  🖱️  鼠标随机路径移动到搜索框");
    console.log("  ⌨️  逐字输入搜索关键词");
    console.log("  📜  页面滚动模拟");
    console.log("  ⏱️  随机延迟和停顿");
    console.log("-".repeat(50));

    const products = await scraper.searchBestsellers("jeans");

    console.log("\n✅ 搜索完成!");
    console.log(`找到 ${products.length} 个产品`);

    if (products.length > 0) {
      console.log("\n📦 产品示例:");
      products.slice(0, 3).forEach((p, i) => {
        console.log(`\n${i + 1}. ${p.title}`);
        console.log(`   价格: $${p.price}`);
        console.log(`   销量: ${p.sales}`);
        console.log(`   评分: ${p.rating} (${p.reviews} 评论)`);
        console.log(`   图片: ${p.images.length} 张`);
      });
    }
  } catch (error) {
    console.error("❌ 测试失败:", error);
  } finally {
    await scraper.close();
  }
}

main();
