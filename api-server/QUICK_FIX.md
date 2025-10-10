# 🚨 快速修复指南：爬虫显示白屏问题

## 问题诊断

你的爬虫打不开 Temu 网站，只显示白屏。这通常是由于 Temu 的反爬虫机制。

## ✅ 我已经做了以下改进

### 1. 增强的反检测功能

- ✅ 更真实的 User-Agent 和浏览器指纹
- ✅ 完整的 Sec-Fetch headers
- ✅ 先访问首页建立 session
- ✅ Canvas 指纹处理
- ✅ 网络等待策略从`domcontentloaded`改为`networkidle2`

### 2. 诊断工具

- ✅ 自动保存页面截图
- ✅ 保存完整 HTML 用于分析
- ✅ 拦截和记录所有 API 请求
- ✅ 详细的调试日志

## 🚀 立即运行诊断

### 步骤 1：运行诊断脚本

```bash
cd api-server
npm run test:diagnose
```

这会：

1. 打开一个可见的浏览器窗口（你可以看到发生了什么）
2. 访问 Temu 首页和搜索页面
3. 保存截图到 `./data/bestsellers/` 目录
4. 记录所有 API 请求

### 步骤 2：查看截图

诊断运行后，检查这些文件：

```
api-server/data/bestsellers/
├── homepage-{timestamp}.png      ← 首页截图
├── search-phone-case-{timestamp}.png  ← 搜索页截图
├── search-phone-case-{timestamp}.html ← 页面HTML
└── api-requests-{timestamp}.json     ← API请求记录
```

## 🔍 根据截图判断问题

### 情况 1：截图显示验证码

**说明**: Temu 检测到了自动化访问

**解决方案**:

1. **使用代理 IP**（推荐）
2. **使用真实 Cookie**
3. **降低请求频率**
4. **切换到 API 方案**（见下文）

### 情况 2：截图显示正常页面，但没有产品

**说明**: 页面结构可能发生了变化

**解决方案**:

1. 查看 `search-*.html` 文件
2. 在 HTML 中搜索产品信息
3. 更新选择器代码

### 情况 3：截图完全空白

**说明**: 页面没有加载或被重定向

**解决方案**:

1. 检查网络连接
2. 尝试增加等待时间
3. 查看 console 输出的错误信息

## 🎯 推荐方案：使用 Temu API

根据 Reddit 讨论，最可靠的方法是使用 Temu 的内部 API：

### 1. 使用诊断工具找到 API 端点

运行诊断后，查看 `api-requests-{timestamp}.json` 文件：

```json
[
  {
    "url": "https://api.temu.com/api/oak/search/list",
    "method": "POST",
    "headers": {
      "anti-token": "xxx",
      ...
    },
    "postData": "{\"searchKey\":\"phone case\",\"sign\":\"xxx\"}",
    "timestamp": "2024-..."
  }
]
```

### 2. 分析签名生成

打开 Chrome DevTools:

1. F12 → Network 标签
2. 搜索 "phone case"
3. 找到 API 请求
4. 右键 → Copy → Copy as cURL
5. 分析请求参数

### 3. 实现 API 调用（示例）

如果你找到了 API 端点，可以直接调用：

```typescript
// 创建 api-server/src/temu-api.ts
import axios from "axios";

export async function searchTemuAPI(keyword: string) {
  // 根据你分析的结果填写
  const response = await axios.post(
    "https://api.temu.com/api/xxx",
    {
      searchKey: keyword,
      // 其他参数...
    },
    {
      headers: {
        "User-Agent": "Mozilla/5.0...",
        // 其他headers...
      },
    }
  );

  return response.data;
}
```

## 🛠️ 临时解决方案

### 方案 A：使用代理

安装代理插件：

```bash
npm install puppeteer-page-proxy
```

修改 `scraper.ts`:

```typescript
import useProxy from "puppeteer-page-proxy";

// 在page.goto之前
await useProxy(page, "http://your-proxy:port");
```

### 方案 B：使用真实 Cookie

1. 手动登录 Temu
2. 复制 Cookie
3. 在 scraper 中使用：

```typescript
await page.setCookie({
  name: "xxx",
  value: "xxx",
  domain: ".temu.com",
});
```

### 方案 C：增加等待时间

如果只是加载慢：

```typescript
// 在 scraper.ts 中增加等待时间
await this.delay(10000); // 等待10秒
```

## 📊 运行服务器测试

启动 API 服务器（可见浏览器模式）：

```bash
cd api-server
npm run start:visible
```

在另一个终端测试：

```bash
curl -X POST http://localhost:3001/api/search-bestsellers \
  -H "Content-Type: application/json" \
  -d '{"keywords": ["phone", "case"]}'
```

## 📚 更多帮助

- `TEMU_API_GUIDE.md` - 详细的 API 逆向指南
- `README.md` - 基础使用文档
- Reddit 讨论中提到的成功案例需要逆向签名算法

## ⚡ 快速命令参考

```bash
# 诊断问题（显示浏览器）
npm run test:diagnose

# 启动服务（显示浏览器+调试）
npm run start:visible

# 普通启动
npm start
```

## 🎯 预期结果

运行 `npm run test:diagnose` 后，你应该能看到：

1. ✅ 浏览器自动打开
2. ✅ 访问 Temu 首页
3. ✅ 执行搜索
4. ✅ 生成截图文件
5. ✅ 控制台显示找到的产品数量

如果一切正常，你会看到类似这样的输出：

```
✅ 找到 3 个产品

前3个产品预览:
1. Premium Phone Case for iPhone 15...
   价格: $9.99
   销量: 50000
   图片: 8 张
```

如果看到问题，截图会告诉你具体是什么问题！
