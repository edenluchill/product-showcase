import { GoogleGenAI } from "@google/genai";
import { MemoryStorage } from "../../src/lib/storage";
import { PagesFunction, ImageStyle } from "../../src/lib/types";

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

// 根据风格生成prompt
function buildPromptFromStyle(style: ImageStyle, index: number): string {
  return `Generate a professional product photography image (Image ${index}) with these EXACT specifications:

📐 CAMERA ANGLE: ${style.angle}
📷 SHOT TYPE: ${style.shot}

👤 MODEL POSE: ${style.pose}

🎨 BACKGROUND: ${style.background}

💡 LIGHTING: ${style.lighting}

${style.focusArea ? `🔍 FOCUS AREA: ${style.focusArea}` : ""}
${
  style.props && style.props.length > 0
    ? `🎭 PROPS: ${style.props.join(", ")}`
    : ""
}
${style.specialNotes ? `📝 SPECIAL NOTES: ${style.specialNotes}` : ""}

⚠️ CRITICAL REQUIREMENTS:
- The model MUST wear the provided product
- Match the EXACT angle, pose, background, and lighting described above
- Maintain professional, high-quality commercial photography standards
- Ensure color accuracy for e-commerce
- The final image must be publication-ready

Generate the image matching this style EXACTLY.`;
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
    const modelImage = formData.get("modelImage") as File;
    const productImage = formData.get("productImage") as File;
    const styleJson = formData.get("style") as string;
    const index = formData.get("index") as string;

    if (!modelImage || !productImage || !styleJson) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const style: ImageStyle = JSON.parse(styleJson);
    const imageIndex = parseInt(index || "1");

    const ai = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    const modelImageBase64 = await fileToBase64(modelImage);
    const productImageBase64 = await fileToBase64(productImage);
    const modelMimeType = getMimeType(modelImage);
    const productMimeType = getMimeType(productImage);

    // 生成prompt
    const promptText = buildPromptFromStyle(style, imageIndex);

    // 生成图片
    const prompt = [
      { text: promptText },
      {
        inlineData: {
          mimeType: modelMimeType,
          data: modelImageBase64,
        },
      },
      {
        inlineData: {
          mimeType: productMimeType,
          data: productImageBase64,
        },
      },
    ];

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
    });

    if (!response.candidates?.[0]?.content?.parts) {
      throw new Error("No image data returned from API");
    }

    // 遍历响应的 parts 查找图片数据
    let imageData: string | null = null;
    let mimeType = "image/png";

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData?.data) {
        imageData = part.inlineData.data;
        mimeType = part.inlineData.mimeType || "image/png";
        break;
      }
    }

    if (!imageData) {
      throw new Error("No image data in response");
    }

    // 将 base64 转换为 ArrayBuffer
    const binaryString = atob(imageData);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }

    // 保存图片
    const storage = MemoryStorage.getInstance();
    const imageId = await storage.saveImage(bytes.buffer, mimeType);
    const imageUrl = storage.getImageUrl(imageId);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl,
        index: imageIndex,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-single:", error);
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
