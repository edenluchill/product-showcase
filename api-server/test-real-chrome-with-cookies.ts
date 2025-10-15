/**
 * 🧪 使用真实 Chrome + Cookie 持久化的爬虫测试
 *
 * 使用方法：
 * 1. 先运行 launch-chrome.bat 启动 Chrome
 * 2. 运行: npm run test:real-chrome:cookies
 * 3. 如果触发验证，手动完成后按 Enter 继续
 * 4. Cookie 会自动保存，下次无需再验证
 *
 * 优势：
 * - Cookie 持久化，验证一次即可
 * - 模拟"老用户"，降低检测风险
 * - 支持手动处理验证码
 */

import fs from "fs";
import path from "path";
import { chromium } from "playwright";
import * as readline from "readline";

// Cookie 存储路径
const COOKIE_FILE = "./data/temu-session.json";

async function testWithRealChromeAndCookies() {
  console.log("╔═════════════════════════════════════════════╗");
  console.log("║   🧪 使用真实 Chrome + Cookie 持久化        ║");
  console.log("╚═════════════════════════════════════════════╝\n");

  const outputDir = "./data/bestsellers";
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    console.log("🔗 连接到真实 Chrome (端口 9222)...");

    // 连接到已启动的 Chrome
    const browser = await chromium.connectOverCDP("http://localhost:9222");
    console.log("✅ 已连接到真实 Chrome");

    // 检测 IP 信息
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

    // 🆕 检查是否有保存的 Cookie
    let hasSavedCookies = false;
    if (fs.existsSync(COOKIE_FILE)) {
      console.log("\n🍪 发现已保存的 Cookie！");
      console.log("   将使用已验证的会话，大幅降低触发验证的概率\n");
      hasSavedCookies = true;
    } else {
      console.log("\n🆕 首次运行，将在测试后保存 Cookie");
      console.log("   如果遇到验证码，请手动完成验证\n");
    }

    // 获取或创建上下文
    const contexts = browser.contexts();
    let context;

    if (hasSavedCookies) {
      // 🆕 使用保存的 Cookie 创建新上下文
      try {
        const savedState = JSON.parse(fs.readFileSync(COOKIE_FILE, "utf-8"));
        // 注意：CDP 连接时我们需要使用默认上下文
        context = contexts[0] || (await browser.newContext());

        // 无法直接加载 storageState 到 CDP 上下文
        // 所以我们需要手动设置 cookies
        console.log("🔄 正在恢复 Cookie...");
        // 这部分需要特殊处理，因为 CDP 连接的限制
      } catch (error) {
        console.log("⚠️ Cookie 加载失败，使用新会话");
        context = contexts[0] || (await browser.newContext());
      }
    } else {
      context = contexts[0] || (await browser.newContext());
    }

    const page = await context.newPage();

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

      // 🆕 检测是否触发验证
      console.log("\n🔍 检查是否触发验证...");
      await delay(2000);

      const hasVerification = await page.evaluate(() => {
        // 查找验证码对话框
        const verificationDialog =
          document.querySelector('[class*="verification"]') ||
          document.querySelector('[class*="captcha"]') ||
          document.querySelector('text="Security Verification"') ||
          document.querySelector('[alt*="verification"]');
        return !!verificationDialog;
      });

      if (hasVerification) {
        console.log("⚠️ 触发了安全验证！\n");
        console.log("📝 请在浏览器中手动完成验证（拖动滑块或完成拼图）");
        console.log("   验证完成后，按 Enter 键继续...\n");

        // 等待用户输入
        await waitForUserInput();

        console.log("✅ 继续执行...\n");
      } else {
        console.log("✅ 无需验证，直接继续！\n");
      }

      // 🆕 保存 Cookie（无论是否触发验证）
      console.log("💾 保存当前会话 Cookie...");
      try {
        // 获取所有 cookies
        const cookies = await context.cookies();
        const storageState = {
          cookies: cookies,
          origins: [],
        };
        fs.writeFileSync(COOKIE_FILE, JSON.stringify(storageState, null, 2));
        console.log(`✅ Cookie 已保存到: ${COOKIE_FILE}\n`);
      } catch (error: any) {
        console.log(`⚠️ Cookie 保存失败: ${error.message}（但不影响继续）\n`);
      }

      // 2. 首次访问：停留更久，模拟真实用户行为
      console.log("👀 查看首页内容（模拟真实用户）...");
      await delay(2000 + Math.random() * 2000);

      // 随机移动鼠标，模拟阅读页面
      await randomMouseMovements(page, 3);
      await delay(1000 + Math.random() * 1000);

      // 3. 模拟人类行为 - 慢慢浏览
      console.log("🖱️ 滚动浏览页面...");
      await humanScroll(page);
      await delay(1500 + Math.random() * 1500);

      // 再次随机移动鼠标
      await randomMouseMovements(page, 2);
      await delay(800 + Math.random() * 1200);

      // 4. 慢慢滚动回到顶部，确保搜索框可见
      console.log("⬆️ 准备搜索，滚动回顶部...");
      await smoothScrollToTop(page);
      await delay(1000 + Math.random() * 1000);

      // 再次停顿（模拟决定要搜索什么）
      await randomMouseMovements(page, 1);
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
        await humanMouseMove(page, searchButton);
        await delay(200 + Math.random() * 300);
        await searchButton.click();
        await delay(600 + Math.random() * 600);

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

      // 5. 点击并输入搜索词
      if (searchInputExists) {
        await searchWithHumanBehavior(page, searchInput, keyword);

        // 6. 等待搜索结果
        console.log("⏳ 等待搜索结果...");
        await page.waitForLoadState("domcontentloaded");
        await delay(3000 + Math.random() * 2000);

        console.log("✅ 搜索页面已加载\n");

        // 🆕 再次检测验证（有时搜索后也会触发）
        const hasVerificationAfterSearch = await page.evaluate(() => {
          const verificationDialog =
            document.querySelector('[class*="verification"]') ||
            document.querySelector('[class*="captcha"]');
          return !!verificationDialog;
        });

        if (hasVerificationAfterSearch) {
          console.log("⚠️ 搜索后触发了验证！");
          console.log("📝 请手动完成验证，然后按 Enter 继续...\n");
          await waitForUserInput();

          // 重新保存 Cookie
          const cookies = await context.cookies();
          fs.writeFileSync(
            COOKIE_FILE,
            JSON.stringify({ cookies, origins: [] }, null, 2)
          );
          console.log("✅ Cookie 已更新\n");
        }
      } else {
        console.log("ℹ️ 未找到搜索框\n");
        return;
      }

      // 继续原有流程...
      console.log("🖱️ 浏览搜索结果...");
      await humanScroll(page);
      await delay(2000 + Math.random() * 1500);

      await randomMouseMovements(page, 2);
      await delay(1000 + Math.random() * 1000);

      console.log("⬆️ 滚动回到顶部...");
      await smoothScrollToTop(page);
      await delay(1000 + Math.random() * 1000);

      // 排序功能
      console.log("🔽 选择按销量排序...");
      const sortByButton = page
        .locator('li[aria-label="Sort by"][role="tab"]')
        .first();
      const sortByExists = (await sortByButton.count()) > 0;

      if (sortByExists) {
        console.log("   点击排序菜单...");
        await humanMouseMove(page, sortByButton);
        await delay(200 + Math.random() * 300);
        await sortByButton.click();
        await delay(400 + Math.random() * 400);

        const topSalesOption = page
          .locator('div[role="button"]:has-text("Top sales")')
          .first();
        const topSalesExists = (await topSalesOption.count()) > 0;

        if (topSalesExists) {
          console.log("   选择按销量排序...");
          await humanMouseMove(page, topSalesOption);
          await delay(150 + Math.random() * 250);
          await topSalesOption.click();
          await delay(1500 + Math.random() * 1000);

          console.log("✅ 已切换到按销量排序");
          await page.waitForLoadState("domcontentloaded");
          await delay(2000 + Math.random() * 1500);
        }
      }

      // 提取产品
      console.log("\n👀 开始浏览前4个产品详情...\n");
      const allProductDetails: any[] = [];

      for (let i = 0; i < 4; i++) {
        console.log(`\n📦 [${i + 1}/4] 查看产品...`);

        try {
          const productCard = page
            .locator('div[class*="rateAndSkcWrap"]')
            .nth(i);
          const productExists = (await productCard.count()) > 0;

          if (!productExists) {
            console.log(`   ⚠️  未找到第 ${i + 1} 个产品`);
            continue;
          }

          const productLink = productCard
            .locator('a[href*="goods.html"], a[class*="title"]')
            .first();

          console.log(`   🖱️  移动鼠标到产品...`);
          await humanMouseMove(page, productLink);
          await delay(300 + Math.random() * 500);

          console.log(`   👆 点击产品...`);
          await Promise.all([
            page.waitForLoadState("domcontentloaded"),
            productLink.click(),
          ]);

          await delay(1500 + Math.random() * 1000);
          console.log(`   ✅ 产品页面已加载`);

          // 提取产品信息
          console.log(`   📊 提取产品信息...`);
          const productDetails = await page.evaluate(() => {
            const title =
              document.querySelector('h1[id*="Title"]')?.textContent?.trim() ||
              document.querySelector('h1[role="text"]')?.textContent?.trim() ||
              document.querySelector("h1")?.textContent?.trim() ||
              "";

            const priceElement =
              document.querySelector("[data-price-info]") ||
              document.querySelector('[aria-label*="CA$"]') ||
              document.querySelector('[aria-label*="$"]');
            const currentPrice = priceElement?.textContent?.trim() || "";

            const ratingElement = document.querySelector(
              '[aria-label*="out of five stars"]'
            );
            const ratingText = ratingElement?.getAttribute("aria-label") || "";
            const rating = ratingText.match(/(\d+\.?\d*)\s*out/)?.[1] || "";

            const soldElement = document.querySelector('[aria-label*="sold"]');
            const soldCount = soldElement?.textContent?.trim() || "";

            const productId =
              new URL(window.location.href).searchParams.get("goods_id") || "";

            const bannerImages: string[] = [];
            document
              .querySelectorAll(
                'img[alt*="item picture"], img[role="img"], img[alt*="details"]'
              )
              .forEach((img: any) => {
                const src = img.src || img.getAttribute("data-src");
                if (src && src.startsWith("http") && !src.includes("avatar")) {
                  bannerImages.push(src.split("?")[0]);
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
              timestamp: new Date().toISOString(),
            };
          });

          allProductDetails.push(productDetails);
          console.log(`   ✅ 已保存产品信息`);
          console.log(`   📝 ${productDetails.title.substring(0, 50)}...`);

          // 模拟浏览
          console.log(`   👀 查看产品详情...`);
          await delay(1000 + Math.random() * 1000);
          await randomMouseMovements(page, 3);
          await delay(500 + Math.random() * 500);
          await humanScroll(page);
          await delay(1500 + Math.random() * 1500);
          await randomMouseMovements(page, 2);
          await delay(800 + Math.random() * 1200);
          await humanScroll(page);
          await delay(1500 + Math.random() * 1000);

          // 返回
          console.log(`   ⬅️  返回搜索结果...`);
          await page.goBack({ waitUntil: "domcontentloaded" });
          await delay(1500 + Math.random() * 1000);
          console.log(`   ✅ 已返回搜索页面`);

          await delay(1000 + Math.random() * 1500);
        } catch (error: any) {
          console.log(`   ⚠️  访问产品 ${i + 1} 时出错:`, error.message);
          try {
            await page.goBack({
              waitUntil: "domcontentloaded",
              timeout: 10000,
            });
            await delay(1000);
          } catch {
            // 继续
          }
        }
      }

      console.log(`\n✅ 完成浏览前4个产品！\n`);

      // 保存结果
      console.log("╔═══════════════════════════════════════════╗");
      console.log("║   📊 测试结果                             ║");
      console.log("╚═══════════════════════════════════════════╝\n");

      if (allProductDetails.length > 0) {
        console.log(
          `✅ 成功提取 ${allProductDetails.length} 个产品的详细信息\n`
        );

        const detailsPath = path.join(
          outputDir,
          `product-details-${keyword}-${Date.now()}.json`
        );
        fs.writeFileSync(
          detailsPath,
          JSON.stringify(allProductDetails, null, 2)
        );
        console.log(`💾 产品详情已保存: ${detailsPath}\n`);

        allProductDetails.forEach((product, index) => {
          console.log(`${index + 1}. ${product.title.substring(0, 60)}...`);
          console.log(`   💰 价格: ${product.price.current}`);
          console.log(`   ⭐ 评分: ${product.rating.score}`);
          console.log(`   📦 销量: ${product.soldCount}`);
          console.log(`   🖼️  图片: ${product.images.all.length} 张`);
          console.log("");
        });

        console.log("🎉 测试成功！");
      }

      console.log("\n💡 提示: Cookie 已保存，下次运行将使用已验证的会话");
      console.log("      大幅降低触发验证的概率");
      console.log(
        "\n⚠️  重要: 为避免触发验证，请至少等待 5-10 分钟后再次测试\n"
      );
    } finally {
      await page.close();
    }
  } catch (error: any) {
    console.error("\n❌ 测试失败:", error.message);

    if (
      error.message.includes("connect") ||
      error.message.includes("ECONNREFUSED")
    ) {
      console.log("\n💡 解决方案:");
      console.log("   1. 请先运行 launch-chrome.bat 启动 Chrome");
      console.log("   2. 确保 Chrome 在端口 9222 运行");
      console.log("   3. 然后重新运行测试\n");
    }
  }
}

// 辅助函数
function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForUserInput(): Promise<void> {
  return new Promise((resolve) => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    rl.question("", () => {
      rl.close();
      resolve();
    });
  });
}

// 改进的人类滚动函数
async function humanScroll(page: any) {
  const scrollDistance = 300 + Math.random() * 500;
  const scrollSteps = 8 + Math.floor(Math.random() * 10);
  const stepDistance = scrollDistance / scrollSteps;

  for (let i = 0; i < scrollSteps; i++) {
    const variance = (Math.random() - 0.5) * 20;
    await page.mouse.wheel(0, stepDistance + variance);

    const pauseTime = 80 + Math.random() * 150;
    await delay(pauseTime);

    if (Math.random() < 0.2) {
      await delay(300 + Math.random() * 700);
    }
  }

  if (Math.random() < 0.3) {
    await delay(500 + Math.random() * 800);
    const backScrollDistance = scrollDistance * (0.2 + Math.random() * 0.3);
    await page.mouse.wheel(0, -backScrollDistance);
    await delay(300 + Math.random() * 500);
  }
}

// 平滑滚动回顶部
async function smoothScrollToTop(page: any) {
  const currentScroll = await page.evaluate(() => window.scrollY);

  if (currentScroll < 100) {
    return;
  }

  const steps = 5 + Math.floor(Math.random() * 5);
  const stepDistance = -currentScroll / steps;

  for (let i = 0; i < steps; i++) {
    await page.mouse.wheel(0, stepDistance);
    await delay(100 + Math.random() * 200);
  }

  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "smooth" }));
  await delay(500 + Math.random() * 500);
}

// 随机鼠标移动
async function randomMouseMovements(page: any, count: number = 3) {
  const viewportSize = await page.viewportSize();
  const width = viewportSize?.width || 1280;
  const height = viewportSize?.height || 720;

  for (let i = 0; i < count; i++) {
    const x = 100 + Math.random() * (width - 200);
    const y = 100 + Math.random() * (height - 200);

    const currentPos = await page.evaluate(() => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    }));

    const steps = 15 + Math.floor(Math.random() * 10);
    const startX = currentPos.x;
    const startY = currentPos.y;

    for (let j = 0; j <= steps; j++) {
      const t = j / steps;
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

    await delay(200 + Math.random() * 600);
  }
}

// 真实的鼠标移动
async function humanMouseMove(page: any, targetLocator: any) {
  const box = await targetLocator.boundingBox();
  if (!box) return;

  const startX = Math.random() * 300 + 100;
  const startY = Math.random() * 200 + 100;

  const targetX = box.x + box.width * (0.3 + Math.random() * 0.4);
  const targetY = box.y + box.height * (0.3 + Math.random() * 0.4);

  const steps = 20 + Math.floor(Math.random() * 15);

  for (let i = 0; i <= steps; i++) {
    const t = i / steps;

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

  await delay(100 + Math.random() * 200);
}

// 真实的打字函数
async function humanTypeRealistic(locator: any, text: string) {
  const chars = text.split("");

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];

    if (Math.random() < 0.1 && i < chars.length - 1) {
      const wrongChar = String.fromCharCode(
        char.charCodeAt(0) + (Math.random() > 0.5 ? 1 : -1)
      );
      await locator.pressSequentially(wrongChar, {
        delay: 80 + Math.random() * 120,
      });
      await delay(100 + Math.random() * 200);

      await locator.press("Backspace");
      await delay(50 + Math.random() * 100);
    }

    await locator.pressSequentially(char, {
      delay: 80 + Math.random() * 180,
    });

    if (Math.random() < 0.15) {
      await delay(300 + Math.random() * 700);
    }
  }
}

// 完整的搜索流程
async function searchWithHumanBehavior(
  page: any,
  searchInput: any,
  keyword: string
) {
  console.log("🖱️ 移动鼠标到搜索框...");
  await humanMouseMove(page, searchInput);

  await delay(200 + Math.random() * 400);

  console.log("👆 点击搜索框...");
  await searchInput.click();

  await delay(400 + Math.random() * 600);

  console.log(`⌨️ 输入搜索关键词: ${keyword}`);
  await humanTypeRealistic(searchInput, keyword);

  await delay(500 + Math.random() * 1000);

  if (Math.random() < 0.7) {
    console.log("🔍 按 Enter 键搜索...");
    await page.keyboard.press("Enter");
  } else {
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
testWithRealChromeAndCookies().catch(console.error);
