import axios from "axios";

/**
 * 图片处理工具模块
 * 提供图片格式转换等功能
 */

/**
 * 将 File 对象转换为 base64 字符串
 */
export async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * 从 URL 获取图片并转换为 base64 字符串
 */
export async function urlToBase64(imageUrl: string): Promise<string> {
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

/**
 * 获取文件的 MIME 类型
 */
export function getMimeType(file: File): string {
  return file.type || "image/png";
}

/**
 * 将 base64 字符串转换为 ArrayBuffer
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}
