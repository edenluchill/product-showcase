import { PagesFunction } from "../../src/lib/types";
import { GeminiClient } from "./utils/gemini-client";
import {
  base64ToArrayBuffer,
  fileToBase64,
  getMimeType,
  urlToBase64,
} from "./utils/image-utils";
import {
  generatePromptByViewAngleAndVariant,
  PromptVariant,
} from "./utils/prompt-generator";
import { selectProductImageByViewAngle } from "./utils/view-angle-selector";

interface Env {
  GEMINI_API_KEY: string;
  IMAGE_BUCKET: R2Bucket;
}

/**
 * 基于参考图生成新图片
 * 输入：参考图URL + 模特图 + 产品图
 * 输出：一张模仿参考图构图/角度/光线的新图片
 */
export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const { request, env } = context;

    if (!env.GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    if (!env.IMAGE_BUCKET) {
      return new Response(
        JSON.stringify({ error: "R2 IMAGE_BUCKET not configured" }),
        { status: 500, headers: { "Content-Type": "application/json" } }
      );
    }

    const formData = await request.formData();
    const referenceImageUrl = formData.get("referenceImageUrl") as string; // 爆款原图URL
    const referenceViewAngle = formData.get("referenceViewAngle") as
      | string
      | null; // 参考图的视角 (front/back/side/other)
    const modelImage = formData.get("modelImage") as File; // 用户的模特图
    const productImage = formData.get("productImage") as File; // 用户的产品图（正面）
    const productImageBack = formData.get("productImageBack") as File | null; // 用户的产品图（背面，可选）
    const promptVariant =
      (formData.get("promptVariant") as PromptVariant) || "精准还原"; // Prompt 变体策略

    if (!referenceImageUrl || !modelImage || !productImage) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required images: referenceImageUrl, modelImage, productImage",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 初始化 Gemini 客户端
    const geminiClient = new GeminiClient(env.GEMINI_API_KEY);

    // 步骤1: 转换所有图片为 base64
    console.log("Converting reference image from URL...");
    const referenceImageBase64 = await urlToBase64(referenceImageUrl);

    console.log("Converting model image...");
    const modelImageBase64 = await fileToBase64(modelImage);
    const modelMimeType = getMimeType(modelImage);

    // 步骤2: 根据参考图视角选择对应的产品图
    const selection = selectProductImageByViewAngle(referenceViewAngle, {
      front: productImage,
      back: productImageBack || undefined,
    });

    console.log(`✓ ${selection.reason}`);

    // 转换选定的产品图
    console.log("Converting selected product image...");
    const productImageBase64 = await fileToBase64(selection.selectedImage);
    const productMimeType = getMimeType(selection.selectedImage);

    // 步骤3: 生成对应视角和变体的 prompt
    const promptText = generatePromptByViewAngleAndVariant(
      selection.viewAngle,
      promptVariant
    );
    console.log(
      `Using ${selection.viewAngle.toUpperCase()} view with ${promptVariant} strategy`
    );

    // 步骤4: 调用 Gemini API 生成图片
    // 注意：提高 temperature 以避免模型直接复制参考图
    const { imageData } = await geminiClient.generateImage({
      prompt: promptText,
      images: [
        { data: referenceImageBase64, mimeType: "image/jpeg" },
        { data: modelImageBase64, mimeType: modelMimeType },
        { data: productImageBase64, mimeType: productMimeType },
      ],
      temperature: 0.9, // 进一步提高温度，增加创意和多样性
      topP: 1.0, // 使用全部概率质量，增加多样性
      topK: 40, // 增加候选词数量
    });

    // 步骤5: 将生成的图片上传到 R2
    const imageBuffer = base64ToArrayBuffer(imageData.data);
    const imageId = `${crypto.randomUUID()}.png`;

    await env.IMAGE_BUCKET.put(imageId, imageBuffer, {
      httpMetadata: {
        contentType: imageData.mimeType,
        cacheControl: "public, max-age=604800", // 缓存一周
      },
    });

    const publicUrl = `${new URL(request.url).origin}/api/images/${imageId}`;

    console.log("Image uploaded to R2 successfully:", publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: publicUrl,
        mimeType: imageData.mimeType,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-with-reference:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Internal server error",
        stack: error instanceof Error ? error.stack : undefined,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
