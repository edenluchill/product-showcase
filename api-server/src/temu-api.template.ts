/**
 * 🚀 Temu API 直接调用方案（模板）
 *
 * 根据Reddit讨论，Temu使用内部API和签名令牌。
 * 这个模板需要你先通过诊断工具找到实际的API端点和签名算法。
 *
 * 使用步骤：
 * 1. 运行 npm run test:diagnose
 * 2. 查看 data/bestsellers/api-requests-*.json
 * 3. 在Chrome DevTools中分析签名生成逻辑
 * 4. 填写下面的配置和签名函数
 * 5. 重命名为 temu-api.ts 并使用
 */

import axios, { AxiosInstance } from "axios";
import crypto from "crypto";

interface TemuApiConfig {
  baseUrl: string; // 例如: https://api.temu.com
  apiVersion?: string; // API版本
  timeout?: number;
  headers?: Record<string, string>;
}

interface SearchParams {
  searchKey: string;
  page?: number;
  pageSize?: number;
  [key: string]: any;
}

interface TemuApiProduct {
  goodsId: string;
  goodsName: string;
  image: string;
  price: number;
  // ... 根据实际API响应添加其他字段
}

export class TemuAPI {
  private axios: AxiosInstance;
  private config: TemuApiConfig;

  constructor(config: TemuApiConfig) {
    this.config = {
      timeout: 30000,
      ...config,
    };

    this.axios = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        Accept: "application/json",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept-Encoding": "gzip, deflate, br",
        Origin: "https://www.temu.com",
        Referer: "https://www.temu.com/",
        ...this.config.headers,
      },
    });
  }

  /**
   * 🔐 生成签名
   *
   * ⚠️ 这是最关键的部分！需要根据实际逆向的结果实现
   *
   * 常见的签名算法：
   * 1. 参数按字母顺序排序后拼接
   * 2. 添加时间戳和密钥
   * 3. 使用MD5/SHA256/HMAC等哈希
   *
   * 示例步骤：
   * 1. 在Chrome DevTools的Sources标签中搜索 "sign" 或 "signature"
   * 2. 找到生成签名的JavaScript函数
   * 3. 在这里用TypeScript重新实现
   */
  private generateSign(params: Record<string, any>): string {
    // ========================================
    // 🚨 TODO: 实现你的签名算法
    // ========================================

    // 示例1：简单的参数排序+MD5
    const sortedKeys = Object.keys(params).sort();
    const paramStr = sortedKeys.map((key) => `${key}=${params[key]}`).join("&");

    // 添加密钥（需要从JavaScript中找到）
    const SECRET = "YOUR_SECRET_KEY_HERE"; // 🚨 替换为实际密钥
    const signStr = paramStr + SECRET;

    // 生成MD5哈希
    const sign = crypto.createHash("md5").update(signStr).digest("hex");

    return sign;

    // 示例2：HMAC-SHA256
    // const sign = crypto
    //   .createHmac('sha256', SECRET)
    //   .update(paramStr)
    //   .digest('hex');
    // return sign;

    // 示例3：复杂的自定义算法
    // 需要根据实际的JavaScript代码重新实现
  }

  /**
   * 🔐 生成anti-token (如果需要)
   *
   * 某些API可能需要额外的anti-token header
   */
  private generateAntiToken(): string {
    // 🚨 TODO: 如果Temu API需要anti-token，在这里实现
    // 通常这个token也是通过JavaScript生成的
    return "";
  }

  /**
   * 🔍 搜索产品
   *
   * @param keyword 搜索关键词
   * @param page 页码（从1开始）
   * @param pageSize 每页数量
   */
  async searchProducts(
    keyword: string,
    page: number = 1,
    pageSize: number = 20
  ): Promise<TemuApiProduct[]> {
    // ========================================
    // 🚨 TODO: 填写实际的API端点
    // ========================================
    const endpoint = "/api/oak/search/list"; // 🚨 替换为实际端点

    // 准备请求参数
    const timestamp = Date.now();
    const params: SearchParams = {
      searchKey: keyword,
      page,
      pageSize,
      timestamp,
      // 🚨 添加其他必需的参数
    };

    // 生成签名
    const sign = this.generateSign(params);

    // 准备请求体（如果是POST）
    const requestData = {
      ...params,
      sign,
    };

    // 准备headers（如果需要anti-token）
    const headers: Record<string, string> = {};
    const antiToken = this.generateAntiToken();
    if (antiToken) {
      headers["anti-token"] = antiToken;
    }

    try {
      console.log(`🔍 API搜索: ${keyword} (page ${page})`);
      console.log(`📡 请求URL: ${this.config.baseUrl}${endpoint}`);

      // ========================================
      // 🚨 根据实际情况选择 POST 或 GET
      // ========================================

      // POST请求
      const response = await this.axios.post(endpoint, requestData, {
        headers,
      });

      // GET请求（如果API使用GET）
      // const response = await this.axios.get(endpoint, {
      //   params: requestData,
      //   headers,
      // });

      console.log(`✅ API响应状态: ${response.status}`);

      // ========================================
      // 🚨 TODO: 解析实际的响应结构
      // ========================================

      // 假设响应结构：
      // {
      //   code: 0,
      //   data: {
      //     list: [ { goodsId: '...', goodsName: '...', ... } ]
      //   }
      // }

      if (response.data.code === 0) {
        const products = response.data.data.list || [];
        console.log(`✅ 找到 ${products.length} 个产品`);
        return products;
      } else {
        console.error("❌ API返回错误:", response.data.message);
        return [];
      }
    } catch (error) {
      console.error("❌ API请求失败:", error);
      if (axios.isAxiosError(error)) {
        console.error("响应数据:", error.response?.data);
        console.error("响应状态:", error.response?.status);
      }
      throw error;
    }
  }

  /**
   * 🖼️ 获取产品详情
   */
  async getProductDetail(productId: string): Promise<any> {
    // 🚨 TODO: 实现产品详情API
    const endpoint = "/api/oak/goods/detail"; // 替换为实际端点

    const params = {
      goodsId: productId,
      timestamp: Date.now(),
    };

    const sign = this.generateSign(params);

    try {
      const response = await this.axios.post(
        endpoint,
        { ...params, sign },
        {
          headers: {
            "anti-token": this.generateAntiToken(),
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error(`❌ 获取产品详情失败: ${productId}`, error);
      throw error;
    }
  }

  /**
   * 🧪 测试API连接
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log("🧪 测试API连接...");
      await this.searchProducts("test", 1, 1);
      console.log("✅ API连接成功");
      return true;
    } catch (error) {
      console.error("❌ API连接失败");
      return false;
    }
  }
}

/**
 * 📝 使用示例：
 *
 * import { TemuAPI } from './temu-api.js';
 *
 * const api = new TemuAPI({
 *   baseUrl: 'https://api.temu.com',
 *   headers: {
 *     // 从浏览器复制的headers
 *   }
 * });
 *
 * // 测试连接
 * await api.testConnection();
 *
 * // 搜索产品
 * const products = await api.searchProducts('phone case');
 * console.log(products);
 *
 * // 获取详情
 * const detail = await api.getProductDetail('123456');
 * console.log(detail);
 */

/**
 * 🔍 如何找到实际的API信息：
 *
 * 1. 打开Chrome，访问 temu.com
 * 2. F12 → Network标签
 * 3. 搜索任意关键词（如 "phone case"）
 * 4. 在Network中找到包含产品数据的请求（通常是POST到/api/开头的URL）
 * 5. 查看请求的：
 *    - URL和方法
 *    - Headers（特别是anti-token等自定义header）
 *    - Request Payload（请求参数和sign）
 *    - Response（了解数据结构）
 *
 * 6. 在Sources标签中：
 *    - Ctrl+Shift+F 搜索 "sign" 或请求URL
 *    - 找到生成签名的函数
 *    - 分析签名算法（可能需要格式化混淆的代码）
 *
 * 7. 使用断点调试：
 *    - 在生成签名的地方打断点
 *    - 重新搜索，查看变量值
 *    - 理解签名生成逻辑
 *
 * 8. 测试验证：
 *    - 复制cURL命令（右键请求 → Copy → Copy as cURL）
 *    - 在命令行测试，确认可以得到数据
 *    - 逐步替换参数，理解哪些是必需的
 */
