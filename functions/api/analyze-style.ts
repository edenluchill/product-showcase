import { GoogleGenAI } from "@google/genai";
import axios from "axios";
import { ImageStyle, PagesFunction } from "../../src/lib/types";

interface Env {
  GEMINI_API_KEY: string;
}

// 从URL获取图片并转换为base64
async function urlToBase64(imageUrl: string): Promise<string> {
  try {
    const response = await axios.get(imageUrl, {
      responseType: "arraybuffer",
      timeout: 30000,
    });

    const bytes = new Uint8Array(response.data);
    let binary = "";
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  } catch (error) {
    console.error("Failed to fetch image:", imageUrl, error);
    throw new Error(`Failed to fetch image: ${imageUrl}`);
  }
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

    const body = (await request.json()) as { imageUrl: string };
    const { imageUrl } = body;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: "Missing imageUrl" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ai = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    // 获取图片
    const imageBase64 = await urlToBase64(imageUrl);

    // 使用 Gemini Vision 分析图片风格
    const prompt = `Analyze this product photography image in extreme detail and return a JSON object:

{
  "angle": "front|side|back|detail|overhead|3/4",
  "shot": "full-body|half-body|close-up|detail",
  "pose": "detailed description of model's pose including body position, hand placement, leg position, head direction, and facial expression",
  "background": "detailed description of background including color, setting, and any elements",
  "lighting": "detailed description of lighting including direction, quality, and mood",
  "focusArea": "if detail shot, what specific area is focused (e.g., 'button', 'pocket', 'stitching'). Can be null.",
  "props": ["array", "of", "props"],
  "specialNotes": "any other important styling elements"
}

INSTRUCTIONS:
1. angle: Choose ONE from: front, side, back, detail, overhead, 3/4
2. shot: Choose ONE from: full-body, half-body, close-up, detail
3. pose: Be VERY specific about the exact pose
4. background: Describe color, setting, mood
5. lighting: Describe direction, quality (soft/hard), mood
6. focusArea: Only if it's a detail shot
7. props: List any visible props or accessories
8. specialNotes: Anything special about this photo

Return ONLY the JSON object, no additional text.`;

    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
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
    let styleAnalysis: ImageStyle;
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in response");
      }
      styleAnalysis = JSON.parse(jsonMatch[0]);
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
        style: styleAnalysis,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in analyze-style:", error);
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
