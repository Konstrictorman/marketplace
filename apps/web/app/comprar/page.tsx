"use client";
import { Box, Grid } from "@mui/material";
import ProductCard from "@/components/ProductCard/ProductCard";

const products = [
  {
    id: "1",
    name: "Laptop Dell XPS",
    price: 1299.99,
    description:
      "Potente laptop con procesador Intel Core i7, 16GB RAM y pantalla 4K. Ideal para trabajo y estudio.",
    stock: 5,
    rating: 4.5,
    condition: "new" as "new" | "used",
    image: "https://placehold.co/280x180/001C64/FEFEFE?text=Laptop",
  },
  {
    id: "2",
    name: "iPhone 13",
    price: 799.99,
    description:
      "Smartphone Apple con cámara de 12MP, chip A15 Bionic y batería de larga duración.",
    stock: 3,
    rating: 4.0,
    condition: "used" as "new" | "used",
    image: "https://placehold.co/280x180/183E9D/FEFEFE?text=iPhone",
  },
  {
    id: "3",
    name: "Silla Ergonómica",
    price: 349.99,
    description:
      "Silla de oficina con soporte lumbar ajustable, apoyabrazos y altura regulable. Perfecta para largas jornadas.",
    stock: 8,
    rating: 5.0,
    condition: "new" as "new" | "used",
    image: "https://placehold.co/280x180/1D3678/FEFEFE?text=Silla",
  },
  {
    id: "4",
    name: 'Monitor LG 27"',
    price: 429.99,
    description:
      "Monitor IPS 4K con 144Hz, tiempo de respuesta de 1ms y compatibilidad con HDR10.",
    stock: 0,
    rating: 4.5,
    condition: "new" as "new" | "used",
    image: "https://placehold.co/280x180/4C6299/FEFEFE?text=Monitor",
  },
  {
    id: "5",
    name: "Teclado Mecánico",
    price: 89.99,
    description:
      "Teclado mecánico con switches Cherry MX Red, retroiluminación RGB y diseño compacto TKL.",
    stock: 12,
    rating: 3.5,
    condition: "used" as "new" | "used",
    image: "https://placehold.co/280x180/001C64/FEFEFE?text=Teclado",
  },
  {
    id: "6",
    name: "Audífonos Sony WH",
    price: 199.99,
    description:
      "Audífonos inalámbricos con cancelación de ruido activa, 30 horas de batería y sonido Hi-Res.",
    stock: 6,
    rating: 4.0,
    condition: "new" as "new" | "used",
    image: "https://placehold.co/280x180/183E9D/FEFEFE?text=Audifonos",
  },
];

export default function Shop() {
  return (
    <Box
      sx={{
        p: 4,
        backgroundColor: "rgb(179, 179, 179)",
        flex: 1,
      }}
    >
      <Grid container spacing={3} sx={{ justifyContent: "flex-start" }}>
        {products.map((product) => (
          <Grid key={product.id}>
            <ProductCard product={product} />
          </Grid>
        ))}
        {/* Product cards will go here */}
      </Grid>
    </Box>
  );
}
