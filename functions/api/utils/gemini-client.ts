import { GoogleGenAI } from "@google/genai";

/**
 * Gemini API 客户端模块
 * 封装与 Gemini AI 的交互逻辑
 */

export interface ImageData {
  data: string;
  mimeType: string;
}

export interface GenerateImageRequest {
  prompt: string;
  images: ImageData[];
  temperature?: number;
  topP?: number;
  topK?: number;
}

export interface GenerateImageResponse {
  imageData: ImageData;
}

export interface GenerateContentRequest {
  prompt: string;
  images: ImageData[];
  model?: string;
  temperature?: number;
  topP?: number;
  topK?: number;
}

/**
 * Gemini 图片生成客户端
 */
export class GeminiClient {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * 生成图片
   */
  async generateImage(
    request: GenerateImageRequest
  ): Promise<GenerateImageResponse> {
    const {
      prompt,
      images,
      temperature = 0.4,
      topP = 0.9,
      topK = 20,
    } = request;

    // 构建请求的 parts 数组
    const parts: any[] = [{ text: prompt }];

    // 添加所有图片
    for (const image of images) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    console.log(`Calling Gemini API with ${images.length} images...`);

    // 调用 Gemini 生成图片
    const response = await this.ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: [{ parts }],
      config: {
        temperature,
        topP,
        topK,
      },
    });

    // 验证响应
    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No content parts in response");
    }

    // 查找生成的图片数据
    const generatedImage = this.extractImageFromResponse(
      response.candidates[0].content.parts
    );

    if (!generatedImage) {
      throw new Error("No image data found in AI response");
    }

    return { imageData: generatedImage };
  }

  /**
   * 生成文本内容 (可用于分析、描述等)
   */
  async generateContent(request: GenerateContentRequest): Promise<string> {
    const {
      prompt,
      images,
      model = "gemini-2.0-flash-exp",
      temperature = 0.2,
      topP = 0.9,
      topK = 20,
    } = request;

    const parts: any[] = [{ text: prompt }];
    for (const image of images) {
      parts.push({
        inlineData: {
          mimeType: image.mimeType,
          data: image.data,
        },
      });
    }

    console.log(`Calling Gemini content API with ${images.length} images...`);

    const response = await this.ai.models.generateContent({
      model: model,
      contents: [{ parts }],
      config: {
        temperature,
        topP,
        topK,
      },
    });

    if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
      console.error(
        "No text part in Gemini content response:",
        JSON.stringify(response, null, 2)
      );
      throw new Error("No text content found in AI response");
    }

    return response.candidates[0].content.parts[0].text;
  }

  /**
   * 从响应中提取图片数据
   */
  private extractImageFromResponse(parts: any[]): ImageData | null {
    for (const part of parts) {
      if (part.inlineData?.data) {
        return {
          data: part.inlineData.data,
          mimeType: part.inlineData.mimeType || "image/png",
        };
      }
    }
    return null;
  }
}
