/**
 * 🎭 Playwright 基础测试
 *
 * 用于验证 Playwright 迁移是否成功
 */

import { chromium } from "playwright";

async function testPlaywright() {
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║   🎭 Playwright 基础测试                 ║");
  console.log("╚═══════════════════════════════════════════╝\n");

  console.log("1️⃣ 启动浏览器...");
  const browser = await chromium.launch({
    headless: false,
    args: ["--no-sandbox"],
  });
  console.log("✅ 浏览器已启动\n");

  console.log("2️⃣ 创建浏览器上下文...");
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  console.log("✅ 上下文已创建\n");

  console.log("3️⃣ 打开新页面...");
  const page = await context.newPage();
  console.log("✅ 页面已打开\n");

  console.log("4️⃣ 访问测试网站...");
  await page.goto("https://example.com", { waitUntil: "domcontentloaded" });
  console.log("✅ 页面已加载\n");

  console.log("5️⃣ 获取页面信息...");
  const title = await page.title();
  const url = page.url();
  console.log(`   标题: ${title}`);
  console.log(`   URL: ${url}\n`);

  console.log("6️⃣ 执行浏览器脚本...");
  const result = await page.evaluate(() => {
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      webdriver: navigator.webdriver,
    };
  });
  console.log("   浏览器信息:");
  console.log(`   - User Agent: ${result.userAgent.substring(0, 60)}...`);
  console.log(`   - Platform: ${result.platform}`);
  console.log(`   - Language: ${result.language}`);
  console.log(`   - Webdriver: ${result.webdriver}\n`);

  console.log("7️⃣ 截图测试...");
  await page.screenshot({ path: "./data/bestsellers/playwright-test.png" });
  console.log("✅ 截图已保存: ./data/bestsellers/playwright-test.png\n");

  console.log("8️⃣ 关闭浏览器...");
  await browser.close();
  console.log("✅ 浏览器已关闭\n");

  console.log("╔═══════════════════════════════════════════╗");
  console.log("║   ✅ Playwright 测试通过！               ║");
  console.log("╚═══════════════════════════════════════════╝\n");
}

testPlaywright().catch((error) => {
  console.error("\n❌ 测试失败:", error);
  process.exit(1);
});
