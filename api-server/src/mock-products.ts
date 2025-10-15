/**
 * Mock 产品数据
 * 用于开发和测试，无需实际爬取
 */

export interface MockProduct {
  title: string;
  price: number;
  originalPrice?: number;
  discount?: string;
  currency: string;
  sales: number;
  rating: number;
  reviews: number;
  url: string;
  images: string[];
  seller?: {
    name: string;
    followers?: string;
    totalSold?: string;
    rating?: number;
    logo?: string;
  };
  material?: string;
  composition?: string;
  details?: string;
  colors?: Array<{ name: string; image: string; isHot?: boolean }>;
  sizes?: string[];
  sizeInfo?: {
    fit: string;
    distribution: { small: number; trueToSize: number; large: number };
  };
  badges?: string[];
  reviewTags?: string[];
  category?: string;
  gender?: string;
}

export const MOCK_BESTSELLERS: MockProduct[] = [
  // 产品 1: 男士紧身牛仔裤
  {
    title:
      "Men's Skinny Jeans - Stretch Work Pants with Slim Fit, All-Season Stretch Denim for Casual & Formal Outfits",
    price: 22.09,
    originalPrice: 40.76,
    discount: "-45%",
    currency: "CAD",
    sales: 100000,
    rating: 4.8,
    reviews: 5440,
    url: "https://www.temu.com/ca/mens-skinny-jeans-stretch-work-pants.html",
    images: [
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/6a7d2fcc939cef93b237db4674ee1312.jpg",
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/f47ac0526b8581f0462a60fd8a88b2b1.jpg",
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/1bff2c742bb96ea5664914913d85d17a.jpg",
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/fd7af2f31abfc61067092bffbc0105cb.jpg",
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/6f740335c0911987bcbe8ab8675bcda1.jpg",
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/c4680cf8e93ac36d79f8dd091a54b5e6.jpg",
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/2d89acf509625539d9bee6fe42c4469d.jpg",
    ],
    seller: {
      name: "LSJEANS",
      followers: "801",
      totalSold: "100K+",
      rating: 4.8,
      logo: "https://img.kwcdn.com/supplier-public-tag/1e1918b6ef8/1c6d424a-76f4-4ebe-a15d-442aabaa26d5_300x300.jpeg",
    },
    material: "Denim",
    composition: "70% Cotton, 23% Polyester, 5% Viscose, 2% Spandex",
    colors: [
      {
        name: "Light Blue",
        image:
          "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/6a7d2fcc939cef93b237db4674ee1312.jpg",
      },
      {
        name: "Black",
        image:
          "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/1385aedf216d134e5be6b3c90a762a0c.jpg",
        isHot: true,
      },
    ],
    sizes: ["S", "M", "L", "XL", "XXL"],
    sizeInfo: {
      fit: "True to size",
      distribution: { small: 2, trueToSize: 95, large: 3 },
    },
    badges: ["#1 Top Rated in Men's Jeans"],
    reviewTags: ["Comfortable(182)", "Perfect Fit(158)", "True To Size(86)"],
    category: "Men's Jeans",
    gender: "men",
  },

  // 产品 2: 女士破洞牛仔裤
  {
    title:
      "Ripped High Strech Distressed Jeans, Zipper Button Closure Solid Color Slim Fit Denim Pants, Women's Denim Jeans & Clothing",
    price: 22.29,
    originalPrice: 56.72,
    discount: "-60%",
    currency: "CAD",
    sales: 100000,
    rating: 4.6,
    reviews: 3256,
    url: "https://www.temu.com/ca/womens-ripped-distressed-jeans.html",
    images: [
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/6738ec9d430c16383b73839f0a705370.jpg",
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/ffb8597ade217af69903bd17f600036a.jpg",
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/ad7139b9c98f8e1441843a39ae7cb149.jpg",
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/867d9e7dcd2297b7e0af54207d988c39.jpg",
      "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/825478726ac7a32e8d5164b1f99e45d4.jpg",
    ],
    seller: {
      name: "Pants cool home",
      followers: "2.5K+",
      totalSold: "100K+",
      rating: 4.7,
      logo: "https://img.kwcdn.com/supplier-public-tag/c6f156e3-19a0-4f36-9941-059e7967805d",
    },
    material: "Denim",
    composition: "65% Cotton, 35% Polyester",
    details: "Chain",
    colors: [
      {
        name: "Black",
        image:
          "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/160943f2b70386504d6871ee7aa1d0ea.jpg",
      },
      {
        name: "White",
        image:
          "https://img.kwcdn.com/product/Fancyalgo/VirtualModelMatting/6738ec9d430c16383b73839f0a705370.jpg",
        isHot: true,
      },
    ],
    sizes: ["XS", "S", "M", "L", "XL", "XXL"],
    sizeInfo: {
      fit: "True to size",
      distribution: { small: 5, trueToSize: 88, large: 7 },
    },
    badges: ["#9 Most Repurchased in Women's Jeans", "Almost sold out"],
    reviewTags: ["Fashionable(119)", "Cute(150)", "Would Buy Again(73)"],
    category: "Women's Jeans",
    gender: "women",
  },
];
