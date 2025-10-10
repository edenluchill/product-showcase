# Temu API 逆向工程指南

根据 Reddit 讨论，Temu 使用内部 API 和签名令牌系统。直接爬取页面经常遇到验证码和反爬虫机制。

## 🎯 推荐方案：使用内部 API

### 方法 1：手动分析网络请求

1. **打开 Chrome DevTools**

   - 访问 `https://www.temu.com`
   - 按 `F12` 打开开发者工具
   - 切换到 `Network` 标签
   - 搜索 "phone case" 或其他关键词

2. **寻找 API 端点**
   查找包含以下特征的请求：

   - URL 包含 `/api/` 或 `api.temu.com`
   - 返回 JSON 格式的产品数据
   - 包含产品列表、价格、图片等信息

3. **分析请求参数**
   记录以下信息：

   ```
   URL: https://api.temu.com/api/xxx
   Method: POST/GET
   Headers:
     - Authorization: xxx
     - anti-token: xxx (签名令牌)
     - User-Agent: xxx
   Body/Query:
     - search_key: phone case
     - page: 1
     - sign: xxxxxxxxx (这是关键!)
   ```

4. **查找签名生成逻辑**
   - 在 `Sources` 标签中搜索 `sign`、`token`、`signature`
   - 在 JavaScript 文件中查找加密/签名函数
   - 常见的签名算法：MD5, SHA256, HMAC

### 方法 2：使用我们的自动分析功能

运行爬虫时启用调试和拦截功能：

```bash
# 在 api-server 目录
HEADLESS=false DEBUG=true npm start
```

然后在浏览器窗口打开后，手动操作一次搜索，爬虫会记录所有 API 请求到：

- `data/bestsellers/api-requests-{timestamp}.json`

## 🔍 当前改进的爬虫功能

我已经为你的爬虫添加了以下诊断功能：

### 1. 截图功能

自动保存页面截图到 `data/bestsellers/` 目录：

- `homepage-{timestamp}.png` - 首页截图
- `search-{keyword}-{timestamp}.png` - 搜索页面截图

### 2. API 请求拦截

记录所有 API 请求和响应到 JSON 文件，包括：

- 请求 URL
- 请求方法
- 请求头（包括签名令牌）
- 请求体数据

### 3. HTML 保存

调试模式下保存完整 HTML 用于分析

### 4. 增强的反检测

- 更真实的 User-Agent
- 完整的 Sec-Fetch headers
- Canvas 指纹处理
- 先访问首页建立 session

## 🚀 使用步骤

### 1. 诊断当前问题

```bash
cd api-server
HEADLESS=false DEBUG=true npm start
```

在另一个终端测试：

```bash
curl -X POST http://localhost:3001/api/search-bestsellers \
  -H "Content-Type: application/json" \
  -d '{"keywords": ["phone", "case"]}'
```

查看生成的截图，确认页面是否正常加载。

### 2. 分析 API 请求

如果截图显示页面正常，但无法提取产品：

1. 检查 `api-requests-{timestamp}.json` 文件
2. 找到产品列表 API 端点
3. 分析请求参数和签名

### 3. 实现 API 调用（如果找到了）

创建新的 `temu-api.ts`：

```typescript
import axios from "axios";
import crypto from "crypto";

// 这里需要根据实际逆向的结果填写
interface TemuApiConfig {
  baseUrl: string;
  signSecret?: string; // 如果能找到签名密钥
}

export class TemuAPI {
  private config: TemuApiConfig;

  constructor(config: TemuApiConfig) {
    this.config = config;
  }

  // 生成签名（需要根据实际逆向的算法实现）
  private generateSign(params: any): string {
    // 示例：按字母排序拼接参数
    const sorted = Object.keys(params).sort();
    const str = sorted.map((k) => `${k}=${params[k]}`).join("&");
    // 添加密钥
    const withSecret = str + (this.config.signSecret || "");
    // MD5哈希
    return crypto.createHash("md5").update(withSecret).digest("hex");
  }

  async searchProducts(keyword: string, page: number = 1) {
    const params = {
      search_key: keyword,
      page: page,
      timestamp: Date.now(),
    };

    const sign = this.generateSign(params);

    const response = await axios.post(
      `${this.config.baseUrl}/api/search`,
      { ...params, sign },
      {
        headers: {
          "User-Agent": "Mozilla/5.0...",
          "anti-token": "xxx", // 如果需要
        },
      }
    );

    return response.data;
  }
}
```

## 🎯 常见问题

### 问题 1：页面显示白屏/验证码

**原因**: Temu 检测到了自动化访问

**解决方案**:

1. 使用代理 IP 轮换
2. 使用真实的浏览器 Cookie
3. 添加更多的人类行为模拟（鼠标移动、滚动）
4. 考虑使用 undetected-chromedriver

### 问题 2：找不到产品元素

**原因**: Temu 可能使用动态类名或 React/Vue 框架

**解决方案**:

1. 等待特定的网络请求完成
2. 直接拦截 API 响应获取数据
3. 使用 MutationObserver 监听 DOM 变化

### 问题 3：签名令牌无法破解

**原因**: 使用了复杂的混淆或服务端验证

**解决方案**:

1. 使用真实浏览器 Cookie 和 Session
2. 通过浏览器执行 JavaScript 生成签名
3. 考虑使用无头浏览器直接拦截响应数据

## 📝 下一步建议

1. **立即执行**: 运行改进后的爬虫并查看截图
2. **如果页面正常**: 分析 API 请求日志，尝试直接调用 API
3. **如果页面异常**: 考虑使用代理或更高级的反检测工具
4. **长期方案**:
   - 建立产品数据库，定期更新而非实时爬取
   - 使用多个 IP 地址轮换
   - 考虑付费的数据服务或 API

## 🛠️ 推荐工具

- **mitmproxy**: 拦截 HTTPS 流量分析请求
- **Charles Proxy**: GUI 版本的代理工具
- **Puppeteer-extra**: 提供更多反检测插件
- **undetected-chromedriver**: Python 的反检测浏览器驱动

## ⚠️ 法律声明

请确保你的爬虫行为符合：

1. Temu 的服务条款
2. 所在地区的法律法规
3. 合理使用原则（不要造成服务器过载）
