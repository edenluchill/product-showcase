import { GoogleGenAI } from "@google/genai";
import { PagesFunction, ProductAnalysis } from "../../src/lib/types";

interface Env {
  GEMINI_API_KEY: string;
}

// 将文件转换为 base64
async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// 获取文件的 MIME 类型
function getMimeType(file: File): string {
  return file.type || "image/png";
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    if (!env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const formData = await request.formData();
    const productImage = formData.get("productImage") as File;

    if (!productImage) {
      return new Response(JSON.stringify({ error: "Missing product image" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ai = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    const productImageBase64 = await fileToBase64(productImage);
    const productMimeType = getMimeType(productImage);

    // 使用 Gemini Vision 分析产品
    const prompt = `Analyze this product image in detail and return a JSON object with the following structure:

{
  "category": "main product category in Chinese (e.g., '女士牛仔裤', '男士T恤', '运动鞋')",
  "subCategory": "specific style in Chinese (e.g., '宽松直筒', '修身款', '高帮')",
  "features": ["key visual features in Chinese, e.g., '高腰', '浅蓝色', '破洞', '做旧'"],
  "searchKeywords": ["English keywords for searching similar products, e.g., 'womens', 'loose', 'jeans', 'high-waisted'"],
  "confidence": 0.95
}

IMPORTANT:
1. category and subCategory should be in Chinese
2. features should be in Chinese  
3. searchKeywords should be in English (for searching on Temu/Amazon)
4. confidence should be between 0 and 1

Return ONLY the JSON object, no additional text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: productMimeType,
                data: productImageBase64,
              },
            },
          ],
        },
      ],
    });

    if (!response.candidates?.[0]?.content?.parts?.[0]?.text) {
      return new Response(JSON.stringify({ error: "No response from AI" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const responseText = response.candidates[0].content.parts[0].text;

    // 尝试解析JSON响应
    let analysis: ProductAnalysis;
    try {
      // 提取JSON（可能被markdown包裹）
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      analysis = JSON.parse(jsonMatch[0]);
    } catch (error) {
      console.error("Failed to parse AI response:", responseText);
      return new Response(
        JSON.stringify({
          error: "Failed to parse AI response",
          rawResponse: responseText,
        }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        analysis,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-product:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
