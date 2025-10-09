import { MemoryStorage } from "../../../src/lib/storage";
import { PagesFunction } from "../../../src/lib/types";

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const { params } = context;
    const imageId = params.id as string;

    // 验证文件名安全性
    if (!imageId || imageId.includes("..") || imageId.includes("/")) {
      return new Response("Invalid image ID", { status: 400 });
    }

    // 使用单例实例
    const storage = MemoryStorage.getInstance();
    const imageData = storage.getImage(imageId);

    if (!imageData) {
      return new Response("Image not found", { status: 404 });
    }

    return new Response(imageData.buffer, {
      headers: {
        "Content-Type": imageData.mimeType,
        "Cache-Control": "public, max-age=31536000",
      },
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
