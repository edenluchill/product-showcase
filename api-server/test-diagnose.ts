/**
 * 🔍 诊断脚本 - 用于测试和诊断Temu爬虫问题
 *
 * 运行方式：
 * npm run test:diagnose
 *
 * 或直接运行：
 * npx tsx test-diagnose.ts
 */

import { TemuScraper } from "./src/scraper.js";

async function diagnose() {
  console.log(`
╔════════════════════════════════════════════╗
║   🔍 Temu 爬虫诊断工具                    ║
╚════════════════════════════════════════════╝
  `);

  const scraper = new TemuScraper({
    headless: false, // 显示浏览器，方便观察
    maxProducts: 3, // 只测试3个产品
    debug: true, // 启用详细日志
    saveScreenshots: true, // 保存截图
    interceptRequests: true, // 拦截API请求
    timeout: 90000, // 90秒超时
  });

  try {
    console.log("1️⃣ 初始化浏览器...");
    await scraper.init();

    console.log("\n2️⃣ 开始搜索测试 (关键词: phone case)...");
    console.log("⏳ 请耐心等待，浏览器会自动打开...");
    console.log("📸 截图将保存到: ./data/bestsellers/\n");

    const products = await scraper.searchBestsellers("phone case");

    console.log("\n3️⃣ 搜索结果:");
    console.log(`   ✅ 找到 ${products.length} 个产品\n`);

    if (products.length > 0) {
      console.log("   前3个产品预览:");
      products.slice(0, 3).forEach((p, i) => {
        console.log(`   ${i + 1}. ${p.title.substring(0, 60)}...`);
        console.log(`      价格: $${p.price}`);
        console.log(`      销量: ${p.sales}`);
        console.log(`      图片: ${p.images.length} 张`);
        console.log(`      URL: ${p.url.substring(0, 80)}...`);
        console.log("");
      });
    } else {
      console.log("\n   ⚠️  未找到产品！");
      console.log("   请检查以下内容：");
      console.log("   1. 查看截图文件（在 ./data/bestsellers/ 目录）");
      console.log("   2. 查看 api-requests-*.json 文件查看API调用");
      console.log("   3. 查看 search-*.html 文件查看页面HTML");
      console.log("\n   可能的原因：");
      console.log("   - Temu显示了验证码");
      console.log("   - 页面结构发生变化");
      console.log("   - 需要使用API而不是爬取页面");
    }

    console.log("\n4️⃣ 检查保存的文件:");
    console.log("   📁 ./data/bestsellers/");
    console.log("      - homepage-*.png (首页截图)");
    console.log("      - search-*.png (搜索页面截图)");
    console.log("      - search-*.html (页面HTML，仅调试模式)");
    console.log("      - api-requests-*.json (API请求记录)");

    console.log("\n✅ 诊断完成！");
  } catch (error) {
    console.error("\n❌ 诊断过程中出错:");
    console.error(error);
  } finally {
    console.log("\n5️⃣ 关闭浏览器...");
    await scraper.close();
  }

  console.log(`
╔════════════════════════════════════════════╗
║   📚 下一步建议                           ║
╚════════════════════════════════════════════╝

1. 查看截图文件，确认页面是否正常加载
2. 如果看到验证码，请阅读 TEMU_API_GUIDE.md
3. 如果页面正常但没有产品，检查 HTML 文件
4. 如果有 API 请求记录，尝试逆向 API

需要帮助？参考：
- TEMU_API_GUIDE.md - API逆向指南
- README.md - 基础使用文档
  `);
}

diagnose();
