export type productType = {
  id: number;
  name: string;
  price: number;
  description: string;
  stock: number;
  rating: number;
  condition: "new" | "used";
  image: string;
};

export type ProductCardProps = {
  product: productType;
};
