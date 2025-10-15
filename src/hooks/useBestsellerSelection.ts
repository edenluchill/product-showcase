import { Bestseller } from "@/lib/types";
import { useState } from "react";

export function useBestsellerSelection() {
  const [bestsellers, setBestsellers] = useState<Bestseller[]>([]);
  const [selectedBestseller, setSelectedBestseller] =
    useState<Bestseller | null>(null);

  const reset = () => {
    setBestsellers([]);
    setSelectedBestseller(null);
  };

  return {
    bestsellers,
    selectedBestseller,
    setBestsellers,
    setSelectedBestseller,
    reset,
  };
}
