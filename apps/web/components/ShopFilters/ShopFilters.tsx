"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
} from "@mui/material";

type ShopFiltersProps = {
  categories: { id: string; name: string }[];
};

export default function ShopFilters({ categories }: ShopFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [categoryId, setCategoryId] = useState(
    searchParams.get("categoryId") ?? "",
  );
  const [condition, setCondition] = useState(
    searchParams.get("condition") ?? "",
  );
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") ?? "");

  const hasFilters = categoryId || condition || minPrice || maxPrice;

  const buildParams = (overrides: Record<string, string> = {}) => {
    const params = new URLSearchParams();

    const search = searchParams.get("search");
    if (search) params.set("search", search);

    const values = { categoryId, condition, minPrice, maxPrice, ...overrides };
    if (values.categoryId) params.set("categoryId", values.categoryId);
    if (values.condition) params.set("condition", values.condition);
    if (values.minPrice) params.set("minPrice", values.minPrice);
    if (values.maxPrice) params.set("maxPrice", values.maxPrice);

    return params.toString();
  };

  const applyFilters = (overrides: Record<string, string> = {}) => {
    const qs = buildParams(overrides);
    router.push(`/shop${qs ? `?${qs}` : ""}`);
  };

  const clearFilters = () => {
    setCategoryId("");
    setCondition("");
    setMinPrice("");
    setMaxPrice("");
    const search = searchParams.get("search");
    router.push(
      search ? `/shop?search=${encodeURIComponent(search)}` : "/shop",
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        gap: 2,
        alignItems: "center",
        flexWrap: "wrap",
        mb: 3,
        px: 4,
        pt: 3,
      }}
    >
      <FormControl size="small" sx={{ minWidth: 160 }}>
        <InputLabel id="filter-category-label">Categoría</InputLabel>
        <Select
          labelId="filter-category-label"
          value={categoryId}
          label="Categoría"
          onChange={(e) => {
            setCategoryId(e.target.value);
            applyFilters({ categoryId: e.target.value });
          }}
        >
          <MenuItem value="">Todas</MenuItem>
          {categories.map((c) => (
            <MenuItem key={c.id} value={c.id}>
              {c.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl size="small" sx={{ minWidth: 130 }}>
        <InputLabel id="filter-condition-label">Condición</InputLabel>
        <Select
          labelId="filter-condition-label"
          value={condition}
          label="Condición"
          onChange={(e) => {
            setCondition(e.target.value);
            applyFilters({ condition: e.target.value });
          }}
        >
          <MenuItem value="">Todas</MenuItem>
          <MenuItem value="new">Nuevo</MenuItem>
          <MenuItem value="used">Usado</MenuItem>
        </Select>
      </FormControl>

      <TextField
        label="Precio mín."
        size="small"
        type="number"
        value={minPrice}
        onChange={(e) => setMinPrice(e.target.value)}
        onBlur={() => applyFilters()}
        onKeyDown={(e) => {
          if (e.key === "Enter") applyFilters();
        }}
        slotProps={{ htmlInput: { min: 0 } }}
        sx={{ width: 120 }}
      />

      <TextField
        label="Precio máx."
        size="small"
        type="number"
        value={maxPrice}
        onChange={(e) => setMaxPrice(e.target.value)}
        onBlur={() => applyFilters()}
        onKeyDown={(e) => {
          if (e.key === "Enter") applyFilters();
        }}
        slotProps={{ htmlInput: { min: 0 } }}
        sx={{ width: 120 }}
      />

      {hasFilters && (
        <Button
          variant="text"
          size="small"
          onClick={clearFilters}
          sx={{ textTransform: "none", color: "rgb(131, 148, 189)" }}
        >
          Limpiar filtros
        </Button>
      )}
    </Box>
  );
}
