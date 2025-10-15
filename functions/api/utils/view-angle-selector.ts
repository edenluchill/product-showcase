import { ViewAngle } from "./prompt-generator";

/**
 * 视角选择模块
 * 根据参考图的视角智能选择对应的产品图
 */

export interface ProductImages {
  front: File;
  back?: File;
}

export interface ViewAngleSelection {
  selectedImage: File;
  viewAngle: ViewAngle;
  reason: string;
}

/**
 * 根据参考图的视角选择对应的产品图
 *
 * @param referenceViewAngle 参考图的视角
 * @param productImages 可用的产品图
 * @returns 选择结果，包含选中的图片和视角
 */
export function selectProductImageByViewAngle(
  referenceViewAngle: string | null,
  productImages: ProductImages
): ViewAngleSelection {
  // 参考图是背面 -> 使用背面产品图（如果有的话）
  if (referenceViewAngle === "back" && productImages.back) {
    return {
      selectedImage: productImages.back,
      viewAngle: "back",
      reason: "Reference is BACK view - using ONLY back product image",
    };
  }

  // 参考图是侧面 -> 使用正面产品图
  if (referenceViewAngle === "side") {
    return {
      selectedImage: productImages.front,
      viewAngle: "side",
      reason: "Reference is SIDE view - using front product image",
    };
  }

  // 默认：参考图是正面或未指定 -> 使用正面产品图
  return {
    selectedImage: productImages.front,
    viewAngle: "front",
    reason: "Reference is FRONT view - using ONLY front product image",
  };
}
