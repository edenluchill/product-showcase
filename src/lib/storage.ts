// functions/lib/storage.ts
export interface StorageAdapter {
  saveImage(imageBuffer: ArrayBuffer, mimeType: string): Promise<string>;
  getImageUrl(imageId: string): string;
}

// 临时内存存储（仅用于开发测试）
export class MemoryStorage implements StorageAdapter {
  private static instance: MemoryStorage | null = null;
  private storage = new Map<
    string,
    { buffer: ArrayBuffer; mimeType: string }
  >();

  // 私有构造函数，防止外部直接 new
  private constructor() {}

  // 获取单例实例
  static getInstance(): MemoryStorage {
    if (!MemoryStorage.instance) {
      MemoryStorage.instance = new MemoryStorage();
    }
    return MemoryStorage.instance;
  }

  async saveImage(imageBuffer: ArrayBuffer, mimeType: string): Promise<string> {
    const uuid = crypto.randomUUID();
    const extension = mimeType.split("/")[1] || "png";
    const filename = `${uuid}.${extension}`;

    this.storage.set(filename, { buffer: imageBuffer, mimeType });
    return filename;
  }

  getImageUrl(imageId: string): string {
    return `/api/images/${imageId}`;
  }

  getImage(imageId: string) {
    return this.storage.get(imageId);
  }
}

// 工厂函数 - 返回单例实例
export function createStorage(
  env: any,
  type: "r2" | "memory" = "memory"
): StorageAdapter {
  // if (type === "r2" && env.IMAGES_BUCKET) {
  //   return new R2Storage(env.IMAGES_BUCKET, env.PUBLIC_URL);
  // }
  return MemoryStorage.getInstance();
}
