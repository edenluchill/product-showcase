import { PagesFunction } from "../../../src/lib/types";

interface Env {
  IMAGE_BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  try {
    const { params, env } = context;
    const imageId = params.id as string;

    // 验证文件名安全性
    if (!imageId || imageId.includes("..") || imageId.includes("/")) {
      return new Response("Invalid image ID", { status: 400 });
    }

    if (!env.IMAGE_BUCKET) {
      return new Response("R2 IMAGE_BUCKET not configured", { status: 500 });
    }

    // Diagnostic logging: List all keys in the bucket
    const listed = await env.IMAGE_BUCKET.list();
    const keys = listed.objects.map((obj) => obj.key);
    console.log(`[Diagnostic] Keys in R2 bucket: ${JSON.stringify(keys)}`);
    console.log(`[Diagnostic] Attempting to get key: ${imageId}`);

    const object = await env.IMAGE_BUCKET.get(imageId);

    if (object === null) {
      console.error(`[Error] Key not found: ${imageId}`);
      return new Response("Image not found", { status: 404 });
    }

    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set("etag", object.httpEtag);
    headers.set("Cache-Control", "public, max-age=604800"); // 缓存一周

    return new Response(object.body, {
      headers,
    });
  } catch (error) {
    console.error("Error serving image:", error);
    return new Response("Internal server error", { status: 500 });
  }
};
