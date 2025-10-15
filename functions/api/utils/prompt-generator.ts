/**
 * Prompt 生成模块
 * 根据不同的视角生成对应的 AI 提示词
 */

export type ViewAngle = "front" | "back" | "side";
export type PromptVariant = "精准还原" | "风格优化" | "创意混合";

/**
 * 根据视角生成对应的 prompt
 */
export function generatePromptByViewAngle(viewAngle: ViewAngle): string {
  const basePrompt = {
    intro: `CRITICAL INSTRUCTION: DO NOT copy or reuse the reference image directly. You MUST create a completely NEW photo.

You are a professional e-commerce product photographer. Your task is to create a BRAND NEW photo by COMBINING elements from these 3 separate images:

INPUT IMAGES (3 different sources):
1. REFERENCE IMAGE (first) - Study ONLY its composition, pose, camera angle, lighting, and background style. DO NOT use this person or clothing.
2. NEW MODEL (second) - This is the ACTUAL person who MUST appear in your final photo
3. NEW PRODUCT (third) - This is the ACTUAL clothing item that MUST be worn in your final photo

YOUR TASK:
CREATE a completely new photo that:
- Uses the FACE, BODY, SKIN TONE, and FEATURES from the NEW MODEL (image 2) - NOT from reference
- Shows the NEW PRODUCT from image 3 being worn - NOT the clothing from reference
- KEEPS the exact same: {view} view angle, pose, body position, lighting setup, background style, and overall composition from the reference image

CRITICAL REQUIREMENTS (MUST FOLLOW):
✓ DO USE: The NEW MODEL's face, body, and appearance from image 2
✓ DO USE: The NEW PRODUCT's design, colors, patterns from image 3
✓ DO USE: The reference's {view} VIEW camera angle and pose precisely
✗ DO NOT: Copy or reuse the reference image's person
✗ DO NOT: Copy or reuse the reference image's clothing
- The model's face and body must be from image 2, not from reference
- The clothing design must be from image 3, not from reference
- Match the reference's {view_upper} VIEW camera angle precisely
- Replicate the reference's pose and body positioning exactly
- Keep the NEW PRODUCT's colors, patterns, and design details accurate
- Maintain professional e-commerce photo quality`,
    back: "\n- The model should be facing AWAY from camera (back view)",
    side: "\n- The model should be shown from the SIDE",
    front: "\n- The model should be facing the CAMERA (front view)",
    outro: `

VERIFICATION: Before generating, confirm:
1. Am I using the NEW MODEL from image 2? (not reference person)
2. Am I showing the NEW PRODUCT from image 3? (not reference clothing)
3. Am I only copying the pose/angle/lighting from reference?

Generate ONE cohesive, professional product photo showing the NEW MODEL wearing the NEW PRODUCT.`,
  };

  const viewSpecificLine = basePrompt[viewAngle];
  const viewUpper = viewAngle.toUpperCase();

  return (
    basePrompt.intro
      .replace(/{view}/g, viewAngle)
      .replace(/{view_upper}/g, viewUpper) +
    viewSpecificLine +
    basePrompt.outro
  );
}

/**
 * 获取所有支持的视角
 */
export function getSupportedViewAngles(): ViewAngle[] {
  return ["front", "back", "side"];
}

/**
 * 根据视角和 prompt 变体生成对应的 prompt
 * @param viewAngle 视角
 * @param promptVariant Prompt 变体策略
 */
export function generatePromptByViewAngleAndVariant(
  viewAngle: ViewAngle,
  promptVariant: PromptVariant = "精准还原"
): string {
  const baseIntro = `As a professional e-commerce photographer, your task is to create a new product photo by combining elements from three source images.

**Source Images:**
1.  **Reference Image:** Provides the artistic direction. Use it **only** to understand the composition, camera angle, model's pose, lighting, and background style.
2.  **Model Image:** Contains the **actual person** who must appear in the final photo.
3.  **Product Image:** Contains the **actual clothing** that the model must wear.

**Your Goal:**
Generate a completely new photograph that features the **model** from the second image wearing the **product** from the third image, but styled exactly like the **reference image**.`;

  const viewSpecificInstructions = {
    back: "- The model should be facing AWAY from camera (back view)",
    side: "- The model should be shown from the SIDE",
    front: "- The model should be facing the CAMERA (front view)",
  };

  const viewUpper = viewAngle.toUpperCase();
  const viewInstruction = viewSpecificInstructions[viewAngle];

  // 根据不同的 prompt 变体生成不同的策略描述
  let variantInstructions = "";

  switch (promptVariant) {
    case "精准还原":
      variantInstructions = `
STRATEGY: FAITHFUL ADAPTATION
- ADAPT the reference's ${viewUpper} VIEW camera angle.
- EMULATE the reference's pose and body positioning.
- RECREATE the lighting setup, shadows, and highlights from the reference.
- USE a similar background style and environment from the reference.
- MAINTAIN a similar composition and framing.
- The goal is to create a NEW photo that captures the ESSENCE of the reference's structure, but with the new model and product. AVOID a direct copy.`;
      break;

    case "风格优化":
      variantInstructions = `
STRATEGY: STYLE ENHANCEMENT
- Use the reference's ${viewUpper} VIEW as base but enhance lighting quality
- Follow the reference pose but optimize for better product visibility
- Keep similar background style but improve professional polish
- Enhance shadows and highlights for premium feel
- Maintain composition while adding subtle refinements
- Balance between reference accuracy and visual improvement`;
      break;

    case "创意混合":
      variantInstructions = `
STRATEGY: CREATIVE INTERPRETATION
- Inspired by reference's ${viewUpper} VIEW but allow artistic variation
- Capture the essence of reference pose with natural adjustments
- Use reference background theme but add creative elements
- Professional lighting that complements both model and product
- Composition balances reference structure with fresh perspective
- Create premium e-commerce quality with creative freedom`;
      break;
  }

  const commonRequirements = `
**Core Instructions:**
- The final image must feature the model from the Model Image (source 2).
- The model must be wearing the product from the Product Image (source 3).
- The final image's style (pose, angle, lighting, background) must match the Reference Image (source 1).
- ${viewInstruction}

**Crucial Rules to Follow:**
- **Do not** use the person from the reference image.
- **Do not** use the clothing from the reference image.
- **Do not** create a photo that is a direct copy or visually identical to the reference image. The result must be a new, unique photograph.

**Final Check:**
- Is the person from the Model Image?
- Is the clothing from the Product Image?
- Is the style from the Reference Image?

Please generate one high-quality, professional product photograph based on these instructions.`;

  return baseIntro + variantInstructions + commonRequirements;
}
