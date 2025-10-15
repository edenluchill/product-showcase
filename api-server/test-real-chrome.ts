/**
 * 🧪 使用真实 Chrome 的爬虫测试
 *
 * 使用方法：
 * 1. 先运行 launch-chrome.bat 启动 Chrome
 * 2. 然后运行: npm run test:real-chrome
 *
 * 优势：
 * - 使用真实 Chrome，所有指纹 100% 正确
 * - 反人机验证成功率最高
 * - 可以手动处理验证码
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright";

// 🆕 添加人机验证检测函数
async function detectCaptcha(page: any): Promise<boolean> {
  try {
    // 检测常见的人机验证元素
    const captchaSelectors = [
      'iframe[src*="captcha"]',
      'iframe[src*="recaptcha"]',
      'div[class*="captcha"]',
      'div[id*="captcha"]',
      'div[class*="verify"]',
      'div[id*="verify"]',
      '[aria-label*="verification"]',
      '[aria-label*="verify"]',
    ];

    for (const selector of captchaSelectors) {
      const element = page.locator(selector).first();
      if ((await element.count()) > 0) {
        return true;
      }
    }

    // 检测页面标题或URL是否包含验证相关关键词
    const url = page.url();
    const title = await page.title();

    if (
      url.includes("captcha") ||
      url.includes("verify") ||
      title.includes("Verify") ||
      title.includes("验证")
    ) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// 🆕 等待人工验证完成
async function waitForManualVerification(page: any): Promise<void> {
  console.log("\n╔═══════════════════════════════════════════╗");
  console.log("║   🤖 检测到人机验证                       ║");
  console.log("╚═══════════════════════════════════════════╝\n");
  console.log("⚠️  请在 Chrome 窗口中手动完成人机验证");
  console.log("💡 验证完成后，脚本将自动继续执行");
  console.log("⏳ 等待验证中...\n");

  // 轮询检测验证是否完成
  let verified = false;
  let attempts = 0;
  const maxAttempts = 120; // 最多等待 2 分钟（每次检查 1 秒）

  while (!verified && attempts < maxAttempts) {
    await delay(1000);
    attempts++;

    // 检查是否还在验证页面
    const stillCaptcha = await detectCaptcha(page);

    if (!stillCaptcha) {
      // 验证可能已完成，再等待一下确保页面加载完成
      await delay(2000);
      verified = true;
      console.log("✅ 人机验证已完成！继续执行...\n");
    }

    // 每 10 秒提示一次
    if (attempts % 10 === 0) {
      console.log(`   ⏳ 已等待 ${attempts} 秒...`);
    }
  }

  if (!verified) {
    console.log("\n⚠️  等待超时，但继续尝试执行...\n");
  }
}

// 🆕 检测是否在搜索结果页面
async function isOnSearchResultsPage(
  page: any,
  keyword: string
): Promise<boolean> {
  try {
    // 检查 URL 是否包含搜索关键词
    const url = page.url();
    if (
      url.includes(`q=${keyword}`) ||
      url.includes(`query=${keyword}`) ||
      url.includes(keyword)
    ) {
      // 进一步检查页面是否有产品列表
      const productSelectors = [
        'div[class*="rateAndSkcWrap"]',
        'div[class*="product"]',
        'a[href*="goods.html"]',
      ];

      for (const selector of productSelectors) {
        const products = page.locator(selector);
        const count = await products.count();
        if (count > 0) {
          console.log(`   ✅ 检测到 ${count} 个产品，已到达搜索结果页面`);
          return true;
        }
      }
    }
    return false;
  } catch {
    return false;
  }
}

// 🆕 等待人工完成验证并到达搜索结果页
async function waitForSearchResults(
  page: any,
  context: any,
  keyword: string
): Promise<void> {
  console.log("\n╔═══════════════════════════════════════════╗");
  console.log("║   👤 等待人工完成验证                     ║");
  console.log("╚═══════════════════════════════════════════╝\n");
  console.log("⚠️  检测到验证或需要人工操作");
  console.log("    请在 Chrome 窗口中：");
  console.log("    1. 完成滑块验证（如果有）");
  console.log("    2. 等待搜索结果页面加载");
  console.log("    3. 确保看到产品列表");
  console.log("\n💡 脚本会自动检测何时到达搜索结果页面");
  console.log("⏳ 等待中...\n");

  let onResultsPage = false;
  let attempts = 0;
  const maxAttempts = 300; // 最多等待 5 分钟

  while (!onResultsPage && attempts < maxAttempts) {
    await delay(1000);
    attempts++;

    try {
      // 检查所有打开的页面
      const pages = context.pages();

      for (const currentPage of pages) {
        // 检查是否在搜索结果页
        if (await isOnSearchResultsPage(currentPage, keyword)) {
          onResultsPage = true;
          console.log("✅ 已到达搜索结果页面！\n");
          console.log("🤖 继续自动化操作...\n");

          // 如果搜索结果在不同的页面，切换过去
          if (currentPage !== page) {
            console.log("   切换到搜索结果页面");
            // 注意：这里需要返回正确的页面，所以可能需要修改函数签名
          }
          break;
        }
      }

      // 每 10 秒提示一次
      if (attempts % 10 === 0) {
        console.log(`   ⏳ 已等待 ${attempts} 秒... (等待到达搜索结果页面)`);

        // 显示当前页面状态
        const currentUrl = page.url();
        console.log(`   📍 当前页面: ${currentUrl.substring(0, 60)}...`);
      }
    } catch (error: any) {
      // 忽略检测错误，继续等待
    }
  }

  if (!onResultsPage) {
    console.log("\n⚠️  等待超时，但继续尝试执行...\n");
  }

  // 给页面一点时间完全加载
  await delay(2000);
}

async function testWithRealChrome() {
  console.log("╔═══════════════════════════════════════════╗");
  console.log("║   🧪 使用真实 Chrome 测试                 ║");
  console.log("╚═══════════════════════════════════════════╝\n");

  const outputDir = "./data/bestsellers";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    console.log("🔗 连接到真实 Chrome (端口 9222)...");

    // 连接到已启动的 Chrome
    const browser = await chromium.connectOverCDP("http://localhost:9222");
    console.log("✅ 已连接到真实 Chrome");

    // 🆕 检测 IP 信息（可选，用于调试）
    console.log("📡 检测当前 IP 信息...");
    try {
      const tempContexts = browser.contexts();
      const tempContext = tempContexts[0] || (await browser.newContext());
      const tempPage = await tempContext.newPage();
      const ipInfo = await tempPage.evaluate(async () => {
        try {
          const response = await fetch("https://api.ipify.org?format=json");
          const data = await response.json();
          return data.ip;
        } catch {
          return "Unable to detect";
        }
      });
      console.log(`   当前 IP: ${ipInfo}`);
      await tempPage.close();
    } catch {
      console.log("   ⚠️ 无法检测 IP（但不影响测试）");
    }
    console.log("");

    // 获取默认上下文（真实 Chrome 的上下文）
    const contexts = browser.contexts();
    const context = contexts[0] || (await browser.newContext());

    const page = await context.newPage();

    // 🆕 监听新页面打开（验证可能在新标签页）
    context.on("page", async (newPage: any) => {
      console.log(`\n   🔔 检测到新页面打开: ${newPage.url()}`);

      // 等待页面加载
      await newPage.waitForLoadState("domcontentloaded").catch(() => {});

      // 检查是否是验证页面
      if (await detectCaptcha(newPage)) {
        console.log("   ✋ 这是验证页面，等待人工完成...");
      }
    });

    try {
      // 设置超时
      page.setDefaultTimeout(60000);
      page.setDefaultNavigationTimeout(60000);

      const keyword = "jeans";
      console.log(`🔍 搜索关键词: ${keyword}\n`);

      // 1. 访问首页
      console.log("⏳ 正在访问 Temu 首页...");
      await page.goto("https://www.temu.com", {
        waitUntil: "domcontentloaded",
        timeout: 60000,
      });
      console.log("✅ 首页已加载");

      // 🆕 检测是否有人机验证（传入 context）
      if (await detectCaptcha(page)) {
        await waitForManualVerification(page);
      }

      // 🆕 首次访问：停留更久，模拟真实用户行为
      // 随机移动鼠标，模拟阅读页面
      await randomMouseMovements(page, 3);
      await delay(1000 + Math.random() * 1000);

      // 2. 模拟人类行为 - 慢慢浏览
      console.log("🖱️ 滚动浏览页面...");
      await humanScroll(page);
      await delay(500 + Math.random() * 1500);

      // 再次随机移动鼠标
      await randomMouseMovements(page, 2);

      // 3. 慢慢滚动回到顶部，确保搜索框可见
      console.log("⬆️ 准备搜索，滚动回顶部...");
      await smoothScrollToTop(page);
      await delay(500 + Math.random() * 1000);

      // 查找搜索框
      console.log("🔍 寻找搜索框...");

      let searchInput = null;
      let searchInputExists = false;

      // 策略0: 先尝试找到并点击搜索按钮 div
      const searchButton = page
        .locator('div[class*="searchBar"][role="button"]')
        .first();
      const searchButtonExists = (await searchButton.count()) > 0;

      if (searchButtonExists) {
        console.log("   找到搜索按钮，模拟点击激活...");
        // 🆕 先移动鼠标再点击
        await humanMouseMove(page, searchButton);
        await delay(200 + Math.random() * 300);
        await searchButton.click();
        await delay(600 + Math.random() * 600); // 等待搜索框出现

        // 现在尝试找到真正的 input
        searchInput = page
          .locator('input[role="searchbox"]')
          .or(page.locator('input[type="search"]'));
        searchInputExists = (await searchInput.count()) > 0;
      }

      // 策略1: 直接查找搜索输入框
      if (!searchInputExists) {
        searchInput = page.locator('input[type="search"]').first();
        searchInputExists = (await searchInput.count()) > 0;
      }

      console.log(
        `   搜索框状态: ${searchInputExists ? "✅ 已找到" : "❌ 未找到"}`
      );

      // 4. 点击并输入搜索词（只在找到搜索框时执行）
      if (searchInputExists) {
        await searchWithHumanBehavior(page, searchInput, keyword);

        // 🆕 搜索后立即检测是否需要验证或人工操作
        console.log("⏳ 等待页面响应...");
        await delay(500); // 等待一下让验证或搜索结果出现

        // 检测是否已经在搜索结果页面
        const directlyOnResults = await isOnSearchResultsPage(page, keyword);

        if (!directlyOnResults) {
          // 可能需要验证或其他人工操作
          console.log("⚠️  未直接到达搜索结果页面");

          // 检查是否有验证
          const hasCaptcha = await detectCaptcha(page);
          if (hasCaptcha) {
            console.log("   检测到验证码");
          }

          // 等待人工完成验证并到达搜索结果页
          await waitForSearchResults(page, context, keyword);
        } else {
          console.log("✅ 已直接到达搜索结果页面\n");
          await delay(1000);
        }

        // ❌ 删除或注释掉原来的这些代码
        // await page.waitForLoadState("domcontentloaded");
        // await delay(3000 + Math.random() * 2000);
        // if (await detectCaptcha(page)) {
        //   await waitForManualVerification(page, context);
        // }
      } else {
        // 如果使用了直接导航，已经在搜索结果页了
        console.log("ℹ️ 已使用直接导航方式，跳过手动搜索\n");
      }

      // 🆕 确认在搜索结果页后再继续
      console.log("╔═══════════════════════════════════════════╗");
      console.log("║   🎯 开始自动化提取产品信息               ║");
      console.log("╚═══════════════════════════════════════════╝\n");

      // 7. 浏览搜索结果
      console.log("🖱️ 浏览搜索结果...");
      await humanScroll(page);
      await delay(2000 + Math.random() * 1500);

      // 随机鼠标移动（模拟查看产品）
      await randomMouseMovements(page, 2);
      await delay(1000 + Math.random() * 1000);

      // 慢慢滚动回顶部
      console.log("⬆️ 滚动回到顶部...");
      await smoothScrollToTop(page);
      await delay(1000 + Math.random() * 1000);

      // 🆕 添加排序功能
      console.log("🔽 选择按销量排序...");

      // 步骤1: 点击 "Sort by" 按钮打开排序菜单
      const sortByButton = page
        .locator('li[aria-label="Sort by"][role="tab"]')
        .first();
      const sortByExists = (await sortByButton.count()) > 0;

      if (sortByExists) {
        console.log("   点击排序菜单...");
        // 🆕 先移动鼠标
        await humanMouseMove(page, sortByButton);
        await delay(200 + Math.random() * 300);
        await sortByButton.click();
        await delay(400 + Math.random() * 400); // 等待菜单展开

        // 步骤2: 点击 "Top sales" 选项
        const topSalesOption = page
          .locator('div[role="button"]:has-text("Top sales")')
          .first();
        const topSalesExists = (await topSalesOption.count()) > 0;

        if (topSalesExists) {
          console.log("   选择按销量排序...");
          // 🆕 先移动鼠标
          await humanMouseMove(page, topSalesOption);
          await delay(150 + Math.random() * 250);
          await topSalesOption.click();
          await delay(1500 + Math.random() * 1000);

          console.log("✅ 已切换到按销量排序");

          // 等待排序后的内容加载
          await page.waitForLoadState("domcontentloaded");
          await delay(2000 + Math.random() * 1500);
        } else {
          console.log("   ⚠️ 未找到 Top sales 选项");
        }
      } else {
        console.log("   ℹ️ 未找到排序按钮，跳过排序");
      }

      // 8. 浏览并提取产品数据
      console.log("\n👀 开始浏览前4个产品详情...\n");
      const allProductDetails: any[] = [];

      for (let i = 0; i < 4; i++) {
        console.log(`\n📦 [${i + 1}/4] 查看产品...`);

        try {
          // 🆕 每次操作前检测验证
          if (await detectCaptcha(page)) {
            await waitForManualVerification(page);
          }

          // 使用更稳定的选择器找到产品卡片
          // 优先使用 data-* 属性，回退到通用选择器
          const productCard = page
            .locator('div[class*="rateAndSkcWrap"]')
            .nth(i);
          const productExists = (await productCard.count()) > 0;

          if (!productExists) {
            console.log(`   ⚠️  未找到第 ${i + 1} 个产品`);
            continue;
          }

          // 找到产品内的链接并点击（使用更通用的选择器）
          const productLink = productCard
            .locator('a[href*="goods.html"], a[class*="title"]')
            .first();

          // 🆕 模拟人类：先移动鼠标到产品上，悬停，然后点击
          console.log(`   🖱️  移动鼠标到产品...`);
          await humanMouseMove(page, productLink);
          await delay(300 + Math.random() * 500); // 悬停观察

          console.log(`   👆 点击产品...`);
          // 使用 Promise.all 等待导航完成
          await Promise.all([
            page.waitForLoadState("domcontentloaded"),
            productLink.click(),
          ]);

          await delay(1500 + Math.random() * 1000);
          console.log(`   ✅ 产品页面已加载`);

          // 🆕 提取产品详细信息
          console.log(`   📊 提取产品信息...`);
          const productDetails = await page.evaluate(() => {
            // 1. 标题 - 使用语义化标签和属性
            const title =
              document.querySelector('h1[id*="Title"]')?.textContent?.trim() ||
              document.querySelector('h1[role="text"]')?.textContent?.trim() ||
              document.querySelector("h1")?.textContent?.trim() ||
              "";

            // 2. 价格 - 使用 data 属性
            const priceElement =
              document.querySelector("[data-price-info]") ||
              document.querySelector('[aria-label*="CA$"]') ||
              document.querySelector('[aria-label*="$"]');
            const currentPrice = priceElement?.textContent?.trim() || "";

            // 3. 评分 - 使用 aria-label
            const ratingElement = document.querySelector(
              '[aria-label*="out of five stars"]'
            );
            const ratingText = ratingElement?.getAttribute("aria-label") || "";
            const rating = ratingText.match(/(\d+\.?\d*)\s*out/)?.[1] || "";

            // 4. 销量 - 使用 aria-label 文本匹配
            const soldElement = document.querySelector('[aria-label*="sold"]');
            const soldCount = soldElement?.textContent?.trim() || "";

            // 5. 产品ID - 从URL获取
            const productId =
              new URL(window.location.href).searchParams.get("goods_id") || "";

            // 6. 图片 - 使用更通用的选择器
            const bannerImages: string[] = [];
            document
              .querySelectorAll(
                'img[alt*="item picture"], img[role="img"], img[alt*="details"]'
              )
              .forEach((img: any) => {
                const src = img.src || img.getAttribute("data-src");
                if (src && src.startsWith("http") && !src.includes("avatar")) {
                  bannerImages.push(src.split("?")[0]); // 去除查询参数
                }
              });

            // 7. 产品属性 - 使用文本模式匹配
            const details: any = {};
            document.querySelectorAll("div").forEach((div: any) => {
              const text = div.textContent?.trim() || "";
              // 匹配 "标签: 值" 模式
              const match = text.match(/^([^:]+):\s*(.+)$/);
              if (match && match[1].length < 30 && match[2].length < 100) {
                const key = match[1].trim();
                const value = match[2].trim();
                // 过滤常见的产品属性
                if (
                  [
                    "Composition",
                    "Material",
                    "Length",
                    "Style",
                    "Color",
                    "Pattern",
                    "Season",
                  ].includes(key)
                ) {
                  details[key] = value;
                }
              }
            });

            // 8. 尺寸 - 使用 role 和 aria 属性
            const sizes: string[] = [];
            document
              .querySelectorAll('[role="radio"][aria-label]')
              .forEach((el: any) => {
                const size =
                  el.getAttribute("aria-label") || el.textContent?.trim();
                if (size && size.length < 20) {
                  sizes.push(size);
                }
              });

            return {
              productId,
              title,
              url: window.location.href,
              price: { current: currentPrice },
              rating: { score: rating },
              soldCount,
              images: { all: [...new Set(bannerImages)] },
              details,
              sizes,
              timestamp: new Date().toISOString(),
            };
          });

          allProductDetails.push(productDetails);
          console.log(`   ✅ 已保存产品信息`);
          console.log(`   📝 ${productDetails.title.substring(0, 50)}...`);
          console.log(`   💰 ${productDetails.price.current}`);
          console.log(`   🖼️  ${productDetails.images.all.length} 张图片`);

          // 模拟真实用户浏览产品详情
          console.log(`   👀 查看产品详情...`);
          await delay(1000 + Math.random() * 1000);

          // 随机鼠标移动（模拟查看图片和详情）
          await randomMouseMovements(page, 3);
          await delay(500 + Math.random() * 500);

          // 滚动查看详情
          await humanScroll(page);
          await delay(1500 + Math.random() * 1500);

          // 再次随机鼠标移动
          await randomMouseMovements(page, 2);
          await delay(800 + Math.random() * 1200);

          // 再滚动一次，更真实
          await humanScroll(page);
          await delay(1500 + Math.random() * 1000);

          // 使用浏览器的后退功能（更像人类）
          console.log(`   ⬅️  返回搜索结果...`);
          await page.goBack({ waitUntil: "domcontentloaded" });

          await delay(1500 + Math.random() * 1000);
          console.log(`   ✅ 已返回搜索页面`);

          // 等待一下再看下一个产品，更自然
          await delay(1000 + Math.random() * 1500);
        } catch (error: any) {
          console.log(`   ⚠️  访问产品 ${i + 1} 时出错:`, error.message);

          // 如果出错，尝试后退
          try {
            console.log(`   🔄 尝试返回搜索页面...`);
            await page.goBack({
              waitUntil: "domcontentloaded",
              timeout: 10000,
            });
            await delay(1000);
          } catch (backError) {
            console.log(`   ⚠️  返回失败，可能需要手动处理`);
            // 继续下一个
          }
        }
      }

      console.log(`\n✅ 完成浏览前4个产品！\n`);

      // 9. 保存和显示结果
      console.log("╔═══════════════════════════════════════════╗");
      console.log("║   📊 测试结果                             ║");
      console.log("╚═══════════════════════════════════════════╝\n");

      if (allProductDetails.length > 0) {
        console.log(
          `✅ 成功提取 ${allProductDetails.length} 个产品的详细信息\n`
        );

        // 保存产品详情到JSON文件
        const detailsPath = path.join(
          outputDir,
          `product-details-${keyword}-${Date.now()}.json`
        );
        fs.writeFileSync(
          detailsPath,
          JSON.stringify(allProductDetails, null, 2)
        );
        console.log(`💾 产品详情已保存: ${detailsPath}\n`);

        // 显示摘要
        allProductDetails.forEach((product, index) => {
          console.log(`${index + 1}. ${product.title.substring(0, 60)}...`);
          console.log(`   💰 价格: ${product.price.current}`);
          console.log(`   ⭐ 评分: ${product.rating.score}`);
          console.log(`   📦 销量: ${product.soldCount}`);
          console.log(`   🖼️  图片: ${product.images.all.length} 张`);
          console.log(`   🔗 链接: ${product.url}`);
          console.log("");
        });

        console.log("🎉 测试成功！");
      } else {
        console.log("⚠️ 未提取到任何产品信息");
      }

      console.log(
        "\n💡 提示: Chrome 窗口将保持打开，你可以手动查看或继续其他操作"
      );
      console.log("         关闭 Chrome 窗口即可结束测试");
      console.log(
        "\n⚠️  重要: 为避免触发人机验证，请至少等待 5-10 分钟后再次测试"
      );
      console.log(
        "         频繁测试会导致 IP 被标记，大幅增加触发验证的概率\n"
      );
    } finally {
      await page.close();
    }

    // 注意：不要关闭 browser，因为这是真实的 Chrome
    // await browser.close();
  } catch (error: any) {
    console.error("\n❌ 测试失败:", error.message);

    if (
      error.message.includes("connect") ||
      error.message.includes("ECONNREFUSED")
    ) {
      console.log("\n💡 解决方案:");
      console.log("   1. 请先运行 launch-chrome.bat 启动 Chrome");
      console.log("   2. 确保 Chrome 在端口 9222 运行");
      console.log("   3. 然后重新运行: npm run test:real-chrome\n");
      console.log("   Windows PowerShell 快速启动命令:");
      console.log(
        '   & "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --remote-debugging-port=9222 --user-data-dir="$env:TEMP\\chrome-debug"\n'
      );
    }
  }
}

// 辅助函数
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 🆕 改进的人类滚动函数 - 更自然的滚动行为
async function humanScroll(page: any) {
  // 滚动距离随机且可变
  const scrollDistance = 300 + Math.random() * 500;
  const scrollSteps = 8 + Math.floor(Math.random() * 10);
  const stepDistance = scrollDistance / scrollSteps;

  for (let i = 0; i < scrollSteps; i++) {
    // 每次滚动的距离略有不同（模拟手指/鼠标滚轮的不规则性）
    const variance = (Math.random() - 0.5) * 20;
    await page.mouse.wheel(0, stepDistance + variance);

    // 不规则的延迟
    const pauseTime = 80 + Math.random() * 150;
    await delay(pauseTime);

    // 偶尔在滚动中停顿（模拟阅读）
    if (Math.random() < 0.2) {
      await delay(300 + Math.random() * 700);
    }
  }

  // 30% 概率往回滚一点（模拟看漏了某些内容）
  if (Math.random() < 0.3) {
    await delay(500 + Math.random() * 800);
    const backScrollDistance = scrollDistance * (0.2 + Math.random() * 0.3);
    await page.mouse.wheel(0, -backScrollDistance);
    await delay(300 + Math.random() * 500);
  }
}

// 🆕 平滑滚动回顶部
async function smoothScrollToTop(page: any) {
  // 获取当前滚动位置
  const currentScroll = await page.evaluate(() => window.scrollY);

  if (currentScroll < 100) {
    // 已经在顶部附近了
    return;
  }

  // 分多次滚动回顶部，更自然
  const steps = 5 + Math.floor(Math.random() * 5);
  const stepDistance = -currentScroll / steps;

  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepDistance);
    await delay(100 + Math.random() * 200);
  }

  // 确保到达顶部
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await delay(500 + Math.random() * 500);
}

// 🆕 随机鼠标移动（模拟查看页面不同区域）
async function randomMouseMovements(page: any, count: number = 3) {
  const viewportSize = await page.viewportSize();
  const width = viewportSize?.width || 1280;
  const height = viewportSize?.height || 720;

  for (let i = 0; i < count; i++) {
    // 随机但合理的位置（避免边缘）
    const x = 100 + Math.random() * (width - 200);
    const y = 100 + Math.random() * (height - 200);

    // 使用贝塞尔曲线移动（更自然）
    const currentPos = await page.evaluate(() => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }));

    const steps = 15 + Math.floor(Math.random() * 10);
    const startX = currentPos.x;
    const startY = currentPos.y;

    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
      // 简单的二次贝塞尔曲线
      const controlX =
        startX + (x - startX) * 0.5 + (Math.random() - 0.5) * 100;
      const controlY =
        startY + (y - startY) * 0.5 + (Math.random() - 0.5) * 100;

      const currentX =
        Math.pow(1 - t, 2) * startX +
        2 * (1 - t) * t * controlX +
        Math.pow(t, 2) * x;
      const currentY =
        Math.pow(1 - t, 2) * startY +
        2 * (1 - t) * t * controlY +
        Math.pow(t, 2) * y;

      await page.mouse.move(currentX, currentY);
      await delay(10 + Math.random() * 20);
    }

    // 在每个位置停留一会儿
    await delay(200 + Math.random() * 600);
  }
}

// ✅ 改进 1: 添加真实的鼠标移动函数
async function humanMouseMove(page: any, targetLocator: any) {
  // 获取元素位置
  const box = await targetLocator.boundingBox();
  if (!box) return;

  // 当前鼠标位置（假设从页面某处开始）
  const startX = Math.random() * 300 + 100;
  const startY = Math.random() * 200 + 100;

  // 目标位置（在元素范围内随机点）
  const targetX = box.x + box.width * (0.3 + Math.random() * 0.4);
  const targetY = box.y + box.height * (0.3 + Math.random() * 0.4);

  // 贝塞尔曲线移动（模拟真实鼠标轨迹）
  const steps = 20 + Math.floor(Math.random() * 15);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

    // 使用三次贝塞尔曲线
    const controlX1 =
      startX + (targetX - startX) * 0.3 + (Math.random() - 0.5) * 50;
    const controlY1 =
      startY + (targetY - startY) * 0.3 + (Math.random() - 0.5) * 50;
    const controlX2 =
      startX + (targetX - startX) * 0.7 + (Math.random() - 0.5) * 50;
    const controlY2 =
      startY + (targetY - startY) * 0.7 + (Math.random() - 0.5) * 50;

    const x =
      Math.pow(1 - t, 3) * startX +
      3 * Math.pow(1 - t, 2) * t * controlX1 +
      3 * (1 - t) * Math.pow(t, 2) * controlX2 +
      Math.pow(t, 3) * targetX;

    const y =
      Math.pow(1 - t, 3) * startY +
      3 * Math.pow(1 - t, 2) * t * controlY1 +
      3 * (1 - t) * Math.pow(t, 2) * controlY2 +
      Math.pow(t, 3) * targetY;

    await page.mouse.move(x, y);
    await delay(10 + Math.random() * 20);
  }

  // 到达目标后短暂停留
  await delay(100 + Math.random() * 200);
}

// ✅ 改进 2: 更真实的打字函数（带错误和修正）
async function humanTypeRealistic(locator: any, text: string) {
  const chars = text.split("");

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    // 10% 概率打错字
    if (Math.random() < 0.1 && i < chars.length - 1) {
      // 打一个错误的字符
      const wrongChar = String.fromCharCode(
        char.charCodeAt(0) + (Math.random() > 0.5 ? 1 : -1)
      );
      await locator.pressSequentially(wrongChar, {
        delay: 80 + Math.random() * 120,
      });
      await delay(100 + Math.random() * 200);

      // 删除错误字符
      await locator.press("Backspace");
      await delay(50 + Math.random() * 100);
    }

    // 输入正确字符
    await locator.pressSequentially(char, {
      delay: 80 + Math.random() * 180, // 更大的变化范围
    });

    // 随机停顿（思考时间）
    if (Math.random() < 0.15) {
      await delay(300 + Math.random() * 700); // 偶尔停顿思考
    }
  }
}

// ✅ 改进 3: 完整的搜索流程
async function searchWithHumanBehavior(
  page: any,
  searchInput: any,
  keyword: string
) {
  // 1. 移动鼠标到搜索框附近（不是精确位置）
  console.log("🖱️ 移动鼠标到搜索框...");
  await humanMouseMove(page, searchInput);

  // 2. 短暂悬停（人类会先观察）
  await delay(200 + Math.random() * 400);

  // 3. 点击搜索框
  console.log("👆 点击搜索框...");
  await searchInput.click();

  // 4. 等待获得焦点（人类需要反应时间）
  await delay(400 + Math.random() * 600);

  // 5. 开始输入（带错误和修正）
  console.log(`⌨️ 输入搜索关键词: ${keyword}`);
  await humanTypeRealistic(searchInput, keyword);

  // 6. 输入后停顿（人类会检查拼写）
  await delay(500 + Math.random() * 1000);

  // 7. 随机选择提交方式
  if (Math.random() < 0.7) {
    // 70% 按 Enter
    console.log("🔍 按 Enter 键搜索...");
    await page.keyboard.press("Enter");
  } else {
    // 30% 点击搜索按钮（如果有的话）
    console.log("🔍 点击搜索按钮...");
    const searchButton = page.locator('button[type="submit"]').first();
    if ((await searchButton.count()) > 0) {
      await humanMouseMove(page, searchButton);
      await delay(100 + Math.random() * 200);
      await searchButton.click();
    } else {
      await page.keyboard.press("Enter");
    }
  }
}

// 运行测试
testWithRealChrome().catch(console.error);
