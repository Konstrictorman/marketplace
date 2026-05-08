"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import type { ApiError } from "@/lib/api/client";
import { createProduct } from "@/lib/api/products";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace-categories";

const moneyPattern = /^\d+(\.\d{1,2})?$/;

const publishProductSchema = z.object({
  categoryId: z
    .string()
    .min(1, "Selecciona una categoría")
    .uuid("La categoría no es válida"),
  title: z
    .string()
    .trim()
    .min(3, "El título debe tener al menos 3 caracteres")
    .max(120, "Máximo 120 caracteres"),
  description: z
    .string()
    .trim()
    .min(10, "La descripción debe tener al menos 10 caracteres")
    .max(5000, "Máximo 5000 caracteres"),
  price: z
    .string()
    .trim()
    .regex(
      moneyPattern,
      "Usa un precio con hasta dos decimales (ej. 120000 o 39.99)",
    ),
  condition: z.enum(["new", "used", "refurbished"]),
  inventory: z.coerce
    .number()
    .int("Debe ser un entero")
    .min(0, "El inventario no puede ser negativo"),
  status: z.enum(["active", "inactive"]),
});

type FormValues = z.infer<typeof publishProductSchema>;

const defaultValues: FormValues = {
  categoryId: "",
  title: "",
  description: "",
  price: "",
  condition: "new",
  inventory: 0,
  status: "active",
};

function PublishProductFormModal({
  open,
  onClose,
  sellerId,
}: {
  open: boolean;
  onClose: () => void;
  sellerId: string;
}) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(publishProductSchema),
    defaultValues,
  });

  const closeModal = useCallback(() => {
    reset(defaultValues);
    setSubmitError(null);
    onClose();
  }, [onClose, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);
    try {
      await createProduct({
        sellerId,
        categoryId: values.categoryId,
        title: values.title,
        description: values.description,
        price: values.price,
        condition: values.condition,
        inventory: values.inventory,
        status: values.status,
      });
      closeModal();
      router.refresh();
    } catch (e) {
      const err = e as ApiError;
      setSubmitError(err.message ?? "No se pudo crear el producto.");
    }
  });

  return (
    <Modal
      open={open}
      onClose={closeModal}
      aria-labelledby="publish-product-title"
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: { xs: "92%", sm: 520 },
          maxHeight: "90vh",
          overflow: "auto",
          bgcolor: "rgb(254, 254, 254)",
          borderRadius: "16px",
          boxShadow: "0px 8px 40px rgba(76, 98, 153, 0.3)",
          p: 3,
          outline: "none",
        }}
      >
        <Typography
          id="publish-product-title"
          variant="h6"
          component="h2"
          sx={{ fontWeight: 700, color: "rgb(0, 28, 100)", mb: 2 }}
        >
          Publicar nuevo producto
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth error={Boolean(errors.categoryId)}>
            <InputLabel id="category-label">Categoría</InputLabel>
            <Controller
              name="categoryId"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="category-label"
                  label="Categoría"
                  displayEmpty
                >
                  <MenuItem value="" disabled>
                    Selecciona…
                  </MenuItem>
                  {MARKETPLACE_CATEGORIES.map((c) => (
                    <MenuItem key={c.id} value={c.id}>
                      {c.name}
                    </MenuItem>
                  ))}
                </Select>
              )}
            />
            {errors.categoryId?.message ? (
              <FormHelperText>{errors.categoryId.message}</FormHelperText>
            ) : null}
          </FormControl>

          <TextField
            label="Título"
            fullWidth
            {...register("title")}
            error={Boolean(errors.title)}
            helperText={errors.title?.message}
          />

          <TextField
            label="Descripción"
            fullWidth
            multiline
            minRows={4}
            {...register("description")}
            error={Boolean(errors.description)}
            helperText={errors.description?.message}
          />

          <TextField
            label="Precio"
            fullWidth
            placeholder="ej. 120000 o 39.99"
            {...register("price")}
            error={Boolean(errors.price)}
            helperText={errors.price?.message}
          />

          <FormControl fullWidth error={Boolean(errors.condition)}>
            <InputLabel id="condition-label">Condición</InputLabel>
            <Controller
              name="condition"
              control={control}
              render={({ field }) => (
                <Select {...field} labelId="condition-label" label="Condición">
                  <MenuItem value="new">Nuevo</MenuItem>
                  <MenuItem value="used">Usado</MenuItem>
                  <MenuItem value="refurbished">Reacondicionado</MenuItem>
                </Select>
              )}
            />
            {errors.condition?.message ? (
              <FormHelperText>{errors.condition.message}</FormHelperText>
            ) : null}
          </FormControl>

          <TextField
            label="Inventario"
            type="number"
            fullWidth
            inputProps={{ min: 0, step: 1 }}
            {...register("inventory")}
            error={Boolean(errors.inventory)}
            helperText={errors.inventory?.message}
          />

          <FormControl fullWidth error={Boolean(errors.status)}>
            <InputLabel id="status-label">Estado de publicación</InputLabel>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  labelId="status-label"
                  label="Estado de publicación"
                >
                  <MenuItem value="active">Activo</MenuItem>
                  <MenuItem value="inactive">Inactivo</MenuItem>
                </Select>
              )}
            />
            {errors.status?.message ? (
              <FormHelperText>{errors.status.message}</FormHelperText>
            ) : null}
          </FormControl>

          {submitError ? (
            <Typography color="error" variant="body2" role="alert">
              {submitError}
            </Typography>
          ) : null}

          <Box
            sx={{ display: "flex", gap: 1, justifyContent: "flex-end", mt: 1 }}
          >
            <Button
              type="button"
              variant="outlined"
              onClick={closeModal}
              disabled={isSubmitting}
              sx={{ borderRadius: "10px" }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={isSubmitting}
              sx={{
                borderRadius: "10px",
                bgcolor: "rgb(24, 62, 157)",
                "&:hover": { bgcolor: "rgb(29, 54, 120)" },
              }}
            >
              {isSubmitting ? "Publicando…" : "Publicar"}
            </Button>
          </Box>
        </Box>
      </Box>
    </Modal>
  );
}

export function PublishProductButton({ sellerId }: { sellerId: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
      >
        Publicar nuevo producto
      </button>
      <PublishProductFormModal
        open={open}
        onClose={() => setOpen(false)}
        sellerId={sellerId}
      />
    </>
  );
}
