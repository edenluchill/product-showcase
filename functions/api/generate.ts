import { GoogleGenAI } from "@google/genai";
import { MemoryStorage } from "../../src/lib/storage";
import { PagesFunction, TrendingTemplate } from "../../src/lib/types";
import { TRENDING_TEMPLATES } from "../../src/lib/templates";

interface Env {
  GEMINI_API_KEY: string;
}

// 基于模板生成详细的AI prompt
function generatePromptFromTemplate(template: TrendingTemplate): string {
  const { generationPrompts } = template;

  return `Generate a professional product photography image following this exact style:

COMPOSITION: ${generationPrompts.composition}

MODEL POSE: ${generationPrompts.pose}

LIGHTING SETUP: ${generationPrompts.lighting}

CAMERA ANGLE: ${generationPrompts.angle}

OVERALL STYLE: ${generationPrompts.style}

CRITICAL REQUIREMENTS:
- The model MUST wear the provided product (clothing/accessory)
- Maintain the exact composition, pose, lighting, and angle described above
- Ensure professional, high-quality commercial photography standards
- Focus on showcasing the product clearly while maintaining the specified style
- Color accuracy is critical for e-commerce
- Final image should be publication-ready for online retail platforms

Generate the image exactly matching this trending template style that has proven successful in international markets.`;
}

// 默认提示词模板（当用户不选择模板时使用）
const DEFAULT_PROMPTS = [
  {
    description: "正面穿着展示",
    prompt:
      "Create a professional full-body front view fashion photo where the model is wearing the product. Use professional studio lighting, clean white background, model in a natural standing pose showcasing the product clearly.",
  },
  {
    description: "侧面穿着展示",
    prompt:
      "Create a professional full-body side view fashion photo where the model is wearing the product. Use professional studio lighting, clean white background, model in a dynamic pose showing the product's fit and silhouette from the side angle.",
  },
  {
    description: "产品细节特写",
    prompt:
      "Create a close-up detail shot highlighting the product's key features - fabric texture, stitching, buttons, zippers, or unique design elements. Use high-quality product photography with soft lighting.",
  },
  {
    description: "产品材质展示",
    prompt:
      "Create a detailed view highlighting the product's material quality and craftsmanship. Focus on texture, weave pattern, and premium details. Use professional product photography lighting.",
  },
  {
    description: "产品整体视图",
    prompt:
      "Create a flat lay or 3D view of the complete product showing its full design. Clean presentation on white background, displaying the product's shape, cut, and overall design aesthetic.",
  },
];

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

// 图片生成核心逻辑封装
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
    const templateId = formData.get("templateId") as string | null;

    if (!modelImage || !productImage) {
      return new Response(JSON.stringify({ error: "Missing images" }), {
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

    const generatedImages: Array<{
      url: string;
      prompt: string;
      description: string;
      templateInfo?: {
        id: string;
        name: string;
      };
    }> = [];

    // 如果用户选择了爆款模板，使用模板生成
    if (templateId) {
      const template = TRENDING_TEMPLATES.find((t) => t.id === templateId);

      if (!template) {
        return new Response(JSON.stringify({ error: "Template not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.log(`Using trending template: ${template.name}`);

      try {
        const promptText = generatePromptFromTemplate(template);

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
            url: imageUrl,
            prompt: template.name,
            description: template.description,
            templateInfo: {
              id: template.id,
              name: template.name,
            },
          });
        } else {
          throw new Error("No image data returned from API");
        }
      } catch (error) {
        console.error(
          `Error generating with template: ${template.name}`,
          error
        );
        generatedImages.push({
          url: `data:image/svg+xml,${encodeURIComponent(
            createPlaceholderSVG(template.name)
          )}`,
          prompt: template.name,
          description: "生成失败，请重试",
          templateInfo: {
            id: template.id,
            name: template.name,
          },
        });
      }
    } else {
      // 使用默认的多样化生成
      for (const promptTemplate of DEFAULT_PROMPTS) {
        try {
          const result = await generateProductImage(
            ai,
            modelImageBase64,
            modelMimeType,
            productImageBase64,
            productMimeType,
            promptTemplate.prompt
          );

          if (result) {
            const imageId = await storage.saveImage(
              result.imageBuffer,
              result.mimeType
            );
            const imageUrl = storage.getImageUrl(imageId);

            generatedImages.push({
              url: imageUrl,
              prompt: promptTemplate.description,
              description: promptTemplate.prompt,
            });
          } else {
            throw new Error("No image data returned from API");
          }
        } catch (error) {
          console.error(
            `Error generating for prompt: ${promptTemplate.description}`,
            error
          );
          // 使用占位符
          generatedImages.push({
            url: `data:image/svg+xml,${encodeURIComponent(
              createPlaceholderSVG(promptTemplate.description)
            )}`,
            prompt: promptTemplate.description,
            description: "生成失败，请重试",
          });
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        images: generatedImages,
        usedTemplate: templateId || null,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in generate function:", error);
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

// 创建占位符 SVG
function createPlaceholderSVG(text: string): string {
  return `
    <svg width="400" height="600" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="600" fill="#f1f5f9"/>
      <text x="200" y="280" font-family="Arial, sans-serif" font-size="16" fill="#64748b" text-anchor="middle">
        AI 生成的图片
      </text>
      <text x="200" y="320" font-family="Arial, sans-serif" font-size="14" fill="#94a3b8" text-anchor="middle">
        ${text}
      </text>
      <text x="200" y="360" font-family="Arial, sans-serif" font-size="12" fill="#cbd5e1" text-anchor="middle">
        (占位符 - 实际应使用图片生成 API)
      </text>
    </svg>
  `;
}
