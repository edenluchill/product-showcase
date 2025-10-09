import { GoogleGenAI } from "@google/genai";
import { MemoryStorage } from "../../src/lib/storage";
import {
  PagesFunction,
  ImageStyle,
  GeneratedImageSet,
} from "../../src/lib/types";

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

// 根据风格分析生成详细prompt
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
- The model MUST wear the provided product (clothing/accessory)
- Match the EXACT angle, pose, background, and lighting described above
- If this is a detail shot, focus on the specified area
- Maintain professional, high-quality commercial photography standards
- Ensure color accuracy for e-commerce
- The final image must be publication-ready for online retail platforms

Generate the image matching this style EXACTLY.`;
}

// 图片生成核心逻辑
async function generateProductImage(
  ai: GoogleGenAI,
  modelImageBase64: string,
  modelMimeType: string,
  productImageBase64: string,
  productMimeType: string,
  promptText: string
): Promise<{ imageBuffer: ArrayBuffer; mimeType: string } | null> {
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
    return null;
  }

  // 遍历响应的 parts 查找图片数据
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData?.data) {
      const imageData = part.inlineData.data;
      const mimeType = part.inlineData.mimeType || "image/png";

      // 将 base64 转换为 ArrayBuffer
      const binaryString = atob(imageData);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      return {
        imageBuffer: bytes.buffer,
        mimeType: mimeType,
      };
    }
  }

  return null;
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
    const stylesJson = formData.get("styles") as string;

    if (!modelImage || !productImage || !stylesJson) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const styles: ImageStyle[] = JSON.parse(stylesJson);

    if (!styles || styles.length === 0) {
      return new Response(JSON.stringify({ error: "No styles provided" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const ai = new GoogleGenAI({
      apiKey: env.GEMINI_API_KEY,
    });

    const modelImageBase64 = await fileToBase64(modelImage);
    const productImageBase64 = await fileToBase64(productImage);
    const modelMimeType = getMimeType(modelImage);
    const productMimeType = getMimeType(productImage);

    // 初始化存储适配器
    const storage = MemoryStorage.getInstance();

    const generatedImages: GeneratedImageSet["images"] = [];
    let successCount = 0;
    let failedCount = 0;

    // 批量生成图片
    for (let i = 0; i < styles.length; i++) {
      const style = styles[i];

      try {
        console.log(`生成第 ${i + 1}/${styles.length} 张图片...`);

        const promptText = buildPromptFromStyle(style, i + 1);

        const result = await generateProductImage(
          ai,
          modelImageBase64,
          modelMimeType,
          productImageBase64,
          productMimeType,
          promptText
        );

        if (result) {
          const imageId = await storage.saveImage(
            result.imageBuffer,
            result.mimeType
          );
          const imageUrl = storage.getImageUrl(imageId);

          generatedImages.push({
            index: i + 1,
            url: imageUrl,
            status: "success",
            style: style,
          });

          successCount++;
        } else {
          throw new Error("No image data returned from API");
        }
      } catch (error) {
        console.error(`生成第 ${i + 1} 张图片失败:`, error);
        failedCount++;

        generatedImages.push({
          index: i + 1,
          url: "",
          status: "failed",
          style: style,
          error: error instanceof Error ? error.message : "Generation failed",
        });
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        result: {
          images: generatedImages,
          totalCount: styles.length,
          successCount,
          failedCount,
        },
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-batch:", error);
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
