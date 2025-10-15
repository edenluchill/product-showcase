import { Bestseller } from "./lib/types";

/**
 * Mock Bestseller 数据
 * 用于开发和测试，无需实际爬取 Temu
 */
export const MOCK_BESTSELLERS_DATA: Bestseller[] = [
  // 产品 1: 男士紧身牛仔裤
  {
    id: "mock-mens-denim-shorts-001",
    platform: "temu",
    productName:
      "Men's Casual Loose-Fit Mid-Length Denim Shorts - Machine Washable Knee-Length Solid Color Non-Stretch Jeans for Summer & Casual Attire, Jeans Shorts, Comfortable Fashion, Classic Five-Pocket Design",
    price: 22.52,
    currency: "CAD",
    sales: 6000,
    rating: 5.0,
    reviews: 34,
    thumbnailUrl:
      "https://img.kwcdn.com/product/fancy/11e3a339-3219-4907-b986-1c848e43d3dc.jpg",
    imageCount: 5,
    productUrl:
      "https://www.temu.com/ca/mens-casual-loose-fit-mid-length-denim-shorts.html",
    images: [
      {
        url: "https://img.kwcdn.com/product/fancy/11e3a339-3219-4907-b986-1c848e43d3dc.jpg",
        index: 0,
        type: "main",
        viewAngle: "front", // 主图 - 正面
      },
      {
        url: "https://img.kwcdn.com/product/fancy/e8ba1fb9-bba8-4b11-b2b0-ef32481327ba.jpg",
        index: 1,
        type: "detail",
        viewAngle: "front", // 细节图 - 正面
      },
      {
        url: "https://img.kwcdn.com/product/fancy/26e8b26a-dd16-48c4-9f83-fed5f9e0059a.jpg",
        index: 2,
        type: "detail",
        viewAngle: "back", // 细节图 - 侧面
      },
      {
        url: "https://img.kwcdn.com/product/fancy/4ec6dc75-941b-42c4-8da2-70b6e0a684a2.jpg",
        index: 3,
        type: "detail",
        viewAngle: "front", // 细节图 - 背面
      },
      {
        url: "https://img.kwcdn.com/product/fancy/8b1eea83-0f07-4a0c-977b-bc2832c7c270.jpg",
        index: 4,
        type: "lifestyle",
        viewAngle: "side", // 生活方式图
      },
    ],
  },

  // 产品 2: 女士破洞牛仔裤
  {
    id: "mock-womens-jeans-001",
    platform: "temu",
    productName:
      "Ripped High Strech Distressed Jeans, Zipper Button Closure Solid Color Slim Fit Denim Pants, Women's Denim Jeans & Clothing",
    price: 22.29,
    currency: "CAD",
    sales: 100000,
    rating: 4.6,
    reviews: 3256,
    thumbnailUrl:
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/6738ec9d430c16383b73839f0a705370.jpg",
    imageCount: 5,
    productUrl: "https://www.temu.com/ca/womens-ripped-distressed-jeans.html",
    images: [
      {
        url: "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/6738ec9d430c16383b73839f0a705370.jpg",
        index: 0,
        type: "main",
        viewAngle: "front",
      },
      {
        url: "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/ffb8597ade217af69903bd17f600036a.jpg",
        index: 1,
        type: "detail",
        viewAngle: "side", // 这张可能是背面
      },
      {
        url: "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/ad7139b9c98f8e1441843a39ae7cb149.jpg",
        index: 2,
        type: "detail",
        viewAngle: "back",
      },
      {
        url: "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/867d9e7dcd2297b7e0af54207d988c39.jpg",
        index: 3,
        type: "lifestyle",
        viewAngle: "other",
      },
      {
        url: "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/825478726ac7a32e8d5164b1f99e45d4.jpg",
        index: 4,
        type: "lifestyle",
        viewAngle: "back",
      },
    ],
  },

  // 产品 3: 女士高弹力复古喇叭牛仔裤
  {
    id: "mock-womens-flare-jeans-001",
    platform: "temu",
    productName:
      "Women'S High-Stretch Retro Flare Jeans - Slim Fit Mid-Rise Bell Bottoms with Slant Pockets, Washed Blue Denim & Built-In Zipper, All-Season Casual Wear, High Waisted Jeans, Comfortable Fashion, Durable Fabric, Versatile Bottoms, Vintage Style, Quality Stitching, Stylish Bottoms, Fashion Women",
    price: 25.56,
    currency: "CAD",
    sales: 85000,
    rating: 4.7,
    reviews: 3191,
    thumbnailUrl:
      "https://img.kwcdn.com/product/fancy/c0db7e2f-4d51-49f2-bf8d-dd48f7c48422.jpg",
    imageCount: 5,
    productUrl:
      "https://www.temu.com/ca/womens-high-stretch-retro-flare-jeans.html",
    images: [
      {
        url: "https://img.kwcdn.com/product/fancy/c0db7e2f-4d51-49f2-bf8d-dd48f7c48422.jpg",
        index: 0,
        type: "main",
        viewAngle: "front",
      },
      {
        url: "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/8a53c7c8f80ba9872279a886474f250e.jpg",
        index: 1,
        type: "detail",
        viewAngle: "side",
      },
      {
        url: "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/638a382bc34fec1266d5f5abd297bd34.jpg",
        index: 2,
        type: "detail",
        viewAngle: "front",
      },
      {
        url: "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/5e001376dac041a6420c66a69006424d.jpg",
        index: 3,
        type: "lifestyle",
        viewAngle: "front",
      },
      {
        url: "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/b59280469ea53935f483cd808e5d8b1b.jpg",
        index: 4,
        type: "lifestyle",
        viewAngle: "front",
      },
    ],
  },

  // 产品 4: 女士复古蓝色宽松阔腿牛仔裤
  {
    id: "mock-womens-wide-leg-jeans-001",
    platform: "temu",
    productName:
      "Women's Vintage Blue Relaxed Fit Wide-Leg Jeans - Geometric Pattern, Water-Washed Denim, Machine Washable All-Season Casual Pants, Everyday Fashion, Highwaisted Denim, Structured Silhouette, Durable Denim Fabric, Versatile Bottoms, Sturdy Construction, Denim Lovers",
    price: 31.83,
    currency: "CAD",
    sales: 87000,
    rating: 4.7,
    reviews: 5557,
    thumbnailUrl:
      "https://img.kwcdn.com/product/fancy/675ea4b4-45f1-4f95-b0d1-6869887f8111.jpg",
    imageCount: 8,
    productUrl:
      "https://www.temu.com/ca/womens-vintage-blue-relaxed-wide-leg-jeans.html",
    images: [
      {
        url: "https://img.kwcdn.com/product/fancy/675ea4b4-45f1-4f95-b0d1-6869887f8111.jpg",
        index: 0,
        type: "main",
        viewAngle: "back",
      },
      {
        url: "https://img.kwcdn.com/product/fancy/dce2382b-845a-447b-9b83-ec850159bf42.jpg",
        index: 1,
        type: "detail",
        viewAngle: "back",
      },
      {
        url: "https://img.kwcdn.com/product/fancy/711b7343-2baa-4362-8e28-9e9c8675d3bf.jpg",
        index: 2,
        type: "detail",
        viewAngle: "front",
      },
      {
        url: "https://img.kwcdn.com/product/fancy/5d4579ec-9619-445c-95ec-992317c2446b.jpg",
        index: 3,
        type: "detail",
        viewAngle: "front",
      },
      {
        url: "https://img.kwcdn.com/product/fancy/2e61f47a-83ac-4c6c-af2c-b59e2f3a7fe0.jpg",
        index: 4,
        type: "lifestyle",
        viewAngle: "front",
      },
      {
        url: "https://img.kwcdn.com/product/fancy/3281a32a-e977-42f4-b660-f8a9b751cd8e.jpg",
        index: 5,
        type: "lifestyle",
        viewAngle: "front",
      },
      {
        url: "https://img.kwcdn.com/product/fancy/b70acd90-f492-48fe-a990-cc0a7995698d.jpg",
        index: 6,
        type: "lifestyle",
        viewAngle: "front",
      },
      {
        url: "https://img.kwcdn.com/product/fancy/2df3851f-35bc-4fc6-a25c-19a8bb195450.jpg",
        index: 7,
        type: "lifestyle",
        viewAngle: "front",
      },
    ],
  },

  // 产品 5: 男士休闲宽松牛仔短裤
];
