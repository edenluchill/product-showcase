import { ImageStyle, PagesFunction } from "../../src/lib/types";
import { GeminiClient } from "./utils/gemini-client";
import {
  base64ToArrayBuffer,
  fileToBase64,
  getMimeType,
  urlToBase64,
} from "./utils/image-utils";
import { selectProductImageByViewAngle } from "./utils/view-angle-selector";

interface Env {
  GEMINI_API_KEY: string;
  IMAGE_BUCKET: R2Bucket;
}

/**
 * Generates a prompt for image creation based on a detailed style analysis.
 * @param style The detailed style analysis of the reference image.
 * @returns A string prompt for the AI to generate a new image.
 */
function createImagePromptFromStyle(style: ImageStyle): string {
  const poseDescription = style.pose.toLowerCase();
  const backgroundDescription = style.background.toLowerCase();
  const lightingDescription = style.lighting.toLowerCase();

  let prompt = `IMPORTANT: The final image must feature the person from the provided model image. Their gender, appearance, and features must be accurately represented.

A ${style.shot || "full-body"} photograph of the model, captured from a ${
    style.angle || "front"
  } angle. `;
  prompt += `The model's pose is based on the following description: "${poseDescription}".
POSE INSTRUCTIONS:
1.  **Core Stance:** You MUST replicate the fundamental body position described (e.g., squatting, kneeling, body orientation, direction faced) with high fidelity. This is the structural foundation of the pose and should be copied.
2.  **Stylistic Adaptation:** You MUST then adapt the secondary, stylistic elements of the pose (like specific hand gestures, head tilt, or facial expression) to be natural and appropriate for the gender of the model in the provided user image. For instance, reinterpret a distinctly feminine hand gesture into a more masculine equivalent if the model is male, while keeping the core stance identical to the reference.
The goal is to keep the reference's structure while ensuring the final pose is believable for the new model. `;
  prompt += `The setting is ${backgroundDescription}, illuminated by ${lightingDescription}. `;

  if (style.props && style.props.length > 0) {
    prompt += `The scene includes the following props: ${style.props.join(
      ", "
    )}. `;
  }

  if (style.specialNotes) {
    prompt += `Key stylistic elements to incorporate are: "${style.specialNotes}". `;
  }

  prompt +=
    "The model is wearing the provided product. It is crucial to accurately represent the product's details, texture, fabric, and how it fits on the model. The final image should be a high-quality, photorealistic product shot, matching the described composition and mood.";

  return prompt;
}

/**
 * 基于分析出的图片风格生成新图片
 * 1. 分析参考图URL，提取姿势、构图、场景等风格
 * 2. 结合新模特、新产品图，根据提取的风格生成新图
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
    const modelImage = formData.get("modelImage") as File; // 用户的模特图
    const productImage = formData.get("productImage") as File; // 用户的产品图（正面）
    const productImageBack = formData.get("productImageBack") as File | null; // 用户的产品图（背面，可选）

    if (!referenceImageUrl || !modelImage || !productImage) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: referenceImageUrl, modelImage, productImage",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 初始化 Gemini 客户端
    const geminiClient = new GeminiClient(env.GEMINI_API_KEY);

    // =============================================
    // 步骤1: 分析参考图风格
    // =============================================
    console.log("Analyzing reference image style...");
    const referenceImageBase64 = await urlToBase64(referenceImageUrl);

    // 调用 Gemini Vision 分析图片风格
    const analysisPrompt = `Analyze this product photography image in extreme detail and return a JSON object. CRITICAL: Your analysis MUST completely ignore the clothing worn by the model. Do not mention the product (e.g., "shirt", "pants", "dress") in any field. Focus ONLY on the requested photographic style elements.

{
  "angle": "front|side|back|detail|overhead|3/4",
  "shot": "full-body|upper-body|half-body|medium-shot|lower-body|close-up|detail",
  "pose": "detailed description of model's pose including body position, hand placement, leg position, head direction, and facial expression",
  "background": "detailed description of background including color, setting, and any elements",
  "lighting": "detailed description of lighting including direction, quality, and mood",
  "focusArea": "if detail shot, what specific area is focused (e.g., 'button', 'pocket', 'stitching'). Can be null.",
  "props": ["array", "of", "props"],
  "specialNotes": "any other important styling elements"
}

INSTRUCTIONS:
1. angle: Choose ONE from: front, side, back, detail, overhead, 3/4
2. shot: Choose ONE from: full-body, upper-body, half-body (waist up), medium-shot (thighs up), lower-body, close-up, detail. Be specific to the framing.
3. pose: Be VERY specific about the exact pose
4. background: Describe color, setting, mood
5. lighting: Describe direction, quality (soft/hard), mood
6. focusArea: Only if it's a detail shot
7. props: List any visible props or accessories
8. specialNotes: Anything special about this photo
9. CRITICAL REMINDER: Do NOT describe the model's clothing at all. Your entire output should only be about the photo's style, pose, and setting.

Return ONLY the JSON object, no additional text.`;

    const analysisResponse = await geminiClient.generateContent({
      prompt: analysisPrompt,
      images: [{ data: referenceImageBase64, mimeType: "image/jpeg" }],
      model: "gemini-2.0-flash-exp", // Use a model good for analysis
    });

    let styleAnalysis: ImageStyle;
    try {
      const jsonMatch = analysisResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response for style analysis.");
      }
      styleAnalysis = JSON.parse(jsonMatch[0]);
      console.log("✓ Style analysis successful:", styleAnalysis);
    } catch (error) {
      console.error(
        "Failed to parse AI style analysis response:",
        analysisResponse
      );
      throw new Error("Failed to parse style analysis from AI.");
    }

    // =============================================
    // 步骤2: 准备图片和生成新 Prompt
    // =============================================
    console.log("Converting user images...");
    const modelImageBase64 = await fileToBase64(modelImage);
    const modelMimeType = getMimeType(modelImage);

    // 根据分析出的视角选择对应的产品图
    const selection = selectProductImageByViewAngle(styleAnalysis.angle, {
      front: productImage,
      back: productImageBack || undefined,
    });
    console.log(`✓ ${selection.reason}`);

    const productImageBase64 = await fileToBase64(selection.selectedImage);
    const productMimeType = getMimeType(selection.selectedImage);

    // 根据风格分析结果生成新的 Prompt
    const generationPrompt = createImagePromptFromStyle(styleAnalysis);
    console.log("Generated prompt for new image:", generationPrompt);

    // =============================================
    // 步骤3: 调用 Gemini API 生成图片
    // =============================================
    const { imageData } = await geminiClient.generateImage({
      prompt: generationPrompt,
      // 注意：这里只传入模特和产品图，不传入参考图
      images: [
        { data: modelImageBase64, mimeType: modelMimeType },
        { data: productImageBase64, mimeType: productMimeType },
      ],
      temperature: 0.7, // 适中的温度以平衡创造性和一致性
      topP: 0.9,
      topK: 30,
    });

    // =============================================
    // 步骤4: 保存并返回结果
    // =============================================
    const imageBuffer = base64ToArrayBuffer(imageData.data);
    const imageId = `${crypto.randomUUID()}.png`;

    await env.IMAGE_BUCKET.put(imageId, imageBuffer, {
      httpMetadata: {
        contentType: imageData.mimeType,
        cacheControl: "public, max-age=604800", // 缓存一周
      },
    });

    const publicUrl = `${new URL(request.url).origin}/api/images/${imageId}`;

    console.log("Image generated and uploaded to R2 successfully:", publicUrl);

    return new Response(
      JSON.stringify({
        success: true,
        imageUrl: publicUrl,
        mimeType: imageData.mimeType,
        styleAnalysis: styleAnalysis, // 同时返回分析结果，方便调试
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate-from-style:", error);
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
