/**
 * 🧪 Stealth爬虫测试脚本
 */

import { TemuScraperStealth } from "./src/scraper-stealth.js";

async function testStealthScraper() {
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║   🕵️ Temu Stealth 爬虫测试              ║");
  console.log("╚═══════════════════════════════════════════╝\n");

  const scraper = new TemuScraperStealth({
    headless: false, // 必须用非headless模式以便手动解决验证
    maxProducts: 5,
    downloadImages: false,
    delay: 2000,
    timeout: 90000, // 更长的超时时间
    debug: true,
    saveScreenshots: true,
    simulateHuman: true, // 启用人类行为模拟
  });

  try {
    // 1. 初始化浏览器
    await scraper.init();

    // 2. 运行反检测测试
    console.log("\n🔬 第一步：运行反检测测试\n");
    await scraper.runDetectionTest();

    console.log("\n⏸️ 按回车继续测试搜索功能...");
    await waitForEnter();

    // 3. 测试搜索
    const testKeyword = "jeans";
    console.log(`\n🔍 第二步：测试搜索功能 - 关键词: ${testKeyword}\n`);

    const products = await scraper.searchBestsellers(testKeyword);

    // 4. 显示结果
    console.log("\n╔═══════════════════════════════════════════╗");
    console.log("║   📊 测试结果                             ║");
    console.log("╚═══════════════════════════════════════════╝\n");

    if (products.length === 0) {
      console.log("❌ 未能获取产品，可能原因：");
      console.log("  1. 出现了人机验证");
      console.log("  2. 页面结构已改变");
      console.log("  3. IP被限制");
      console.log("\n💡 建议：");
      console.log("  - 检查截图文件");
      console.log("  - 尝试使用VPN或代理");
      console.log("  - 考虑使用API逆向方案");
    } else {
      console.log(`✅ 成功爬取 ${products.length} 个产品\n`);

      products.forEach((product, index) => {
        console.log(`${index + 1}. ${product.title || "(无标题)"}`);
        console.log(`   💰 价格: $${product.price}`);
        console.log(`   ⭐ 评分: ${product.rating} (${product.reviews} 评论)`);
        console.log(`   📦 销量: ${product.sales}`);
        console.log(`   🖼️  图片数: ${product.images.length}`);
        console.log("");
      });
    }

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

function waitForEnter(): Promise<void> {
  return new Promise((resolve) => {
    process.stdin.once("data", () => {
      resolve();
    });
  });
}

// 运行测试
testStealthScraper().catch(console.error);
