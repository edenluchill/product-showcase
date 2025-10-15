/**
 * 🧪 爬虫测试脚本
 *
 * 使用方法：
 * npm run test:scraper
 *
 * 或直接运行：
 * npx tsx test-scraper.ts
 */

import { TemuScraper } from "./src/scraper.js";

async function testScraper() {
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║   🧪 Temu 爬虫测试                        ║");
  console.log("╚═══════════════════════════════════════════╝\n");

  const scraper = new TemuScraper({
    headless: false, // 🔍 显示浏览器，可以看到运行过程
    maxProducts: 3, // 只爬取3个产品用于测试
    downloadImages: false,
    delay: 2000,
    incognito: true, // 🕶️ 使用隐身模式
    timeout: 60000,
    debug: true, // 📊 显示详细日志
  });

  try {
    await scraper.init();

    // 测试关键词
    const testKeyword = "jeans";
    console.log(`\n🔍 测试关键词: ${testKeyword}\n`);

    const products = await scraper.searchBestsellers(testKeyword);

    console.log("\n╔═══════════════════════════════════════════╗");
    console.log("║   📊 测试结果                             ║");
    console.log("╚═══════════════════════════════════════════╝\n");

    console.log(`✅ 成功爬取 ${products.length} 个产品\n`);

    products.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title}`);
      console.log(`   💰 价格: $${product.price}`);
      console.log(`   ⭐ 评分: ${product.rating} (${product.reviews} 评论)`);
      console.log(`   📦 销量: ${product.sales}`);
      console.log(`   🖼️  图片数: ${product.images.length}`);
      console.log(`   🔗 链接: ${product.url}`);
      console.log("");
    });

    console.log("🎉 测试完成！");
  } catch (error) {
    console.error("\n❌ 测试失败:", error);
    if (error instanceof Error) {
      console.error("错误信息:", error.message);
      console.error("错误堆栈:", error.stack);
    }
  } finally {
    await scraper.close();
  }
}

// 运行测试
testScraper().catch(console.error);
