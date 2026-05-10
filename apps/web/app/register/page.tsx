"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
  IconButton,
  InputAdornment,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { createUser } from "@/lib/api/users";
import { isApiError } from "@/lib/api/client";
import {
  buildInstitutionalEmail,
  INSTITUTIONAL_EMAIL_DOMAIN,
} from "@/lib/institutional-email";

const CAREERS = [
  "Administración de Empresas",
  "Arquitectura",
  "Comunicación Social",
  "Derecho",
  "Enfermería",
  "Ingeniería Civil",
  "Ingeniería de Sistemas",
  "Ingeniería Industrial",
  "Medicina",
  "Psicología",
];

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    username: "",
    career: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.username.trim()) newErrors.username = "Username is required";
    else {
      const built = buildInstitutionalEmail(form.username);
      if (!built.endsWith(INSTITUTIONAL_EMAIL_DOMAIN)) {
        newErrors.username = `Use your UniSabana username or a full ${INSTITUTIONAL_EMAIL_DOMAIN} address`;
      }
    }
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!form.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const institutionalEmail = buildInstitutionalEmail(form.username);
    const careerTrimmed = form.career.trim();
    const body = {
      institutionalEmail,
      password: form.password,
      name: form.fullName.trim(),
      ...(careerTrimmed ? { career: careerTrimmed } : { career: null }),
    };

    setIsSubmitting(true);
    setErrors({});
    try {
      await createUser(body);
      router.replace("/login?registered=1");
    } catch (e: unknown) {
      const message = isApiError(e)
        ? e.message
        : "Network error. Please try again.";
      setErrors({ _form: message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgb(239, 241, 244)",
        py: 8,
      }}
    >
      <Box
        sx={{
          width: { xs: "90%", sm: 480 },
          backgroundColor: "rgb(254, 254, 254)",
          borderRadius: "16px",
          boxShadow: "0px 8px 40px rgba(76, 98, 153, 0.2)",
          p: 4,
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            color: "rgb(0, 28, 100)",
            mb: 0.5,
            textAlign: "center",
          }}
        >
          Create account
        </Typography>

        <Typography
          variant="body2"
          sx={{ textAlign: "center", color: "rgb(131, 148, 189)", mb: 3 }}
        >
          Already have an account?{" "}
          <Link
            href="/login"
            style={{
              color: "rgb(24, 62, 157)",
              fontWeight: 700,
              textDecoration: "none",
            }}
          >
            Sign in
          </Link>
        </Typography>

        {errors._form ? (
          <Typography
            variant="body2"
            sx={{ color: "error.main", mb: 2, textAlign: "center" }}
          >
            {errors._form}
          </Typography>
        ) : null}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Full name"
            fullWidth
            value={form.fullName}
            onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            error={!!errors.fullName}
            helperText={errors.fullName}
          />

          <TextField
            label="Username"
            fullWidth
            placeholder="e.g. juan.perez"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value })}
            error={!!errors.username}
            helperText={errors.username}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography
                      variant="body2"
                      sx={{ color: "rgb(131, 148, 189)" }}
                    >
                      {INSTITUTIONAL_EMAIL_DOMAIN}
                    </Typography>
                  </InputAdornment>
                ),
              },
            }}
          />

          <FormControl fullWidth>
            <InputLabel>Career (optional)</InputLabel>
            <Select
              value={form.career}
              label="Career (optional)"
              onChange={(e) =>
                setForm({ ...form, career: e.target.value as string })
              }
            >
              <MenuItem value="">
                <em>Prefer not to say</em>
              </MenuItem>
              {CAREERS.map((career) => (
                <MenuItem key={career} value={career}>
                  {career}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="Password"
            fullWidth
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            error={!!errors.password}
            helperText={errors.password}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? (
                        <VisibilityOffIcon />
                      ) : (
                        <VisibilityIcon />
                      )}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          <TextField
            label="Confirm password"
            fullWidth
            type={showConfirm ? "text" : "password"}
            value={form.confirmPassword}
            onChange={(e) =>
              setForm({ ...form, confirmPassword: e.target.value })
            }
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                      {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />
        </Box>

        <Button
          variant="contained"
          fullWidth
          disabled={isSubmitting}
          onClick={() => void handleSubmit()}
          sx={{
            textTransform: "none",
            mt: 3,
            borderRadius: "10px",
            py: 1.2,
            backgroundColor: "rgb(24, 62, 157)",
            "&:hover": { backgroundColor: "rgb(29, 54, 120)" },
          }}
        >
          {isSubmitting ? "Creating account…" : "Register"}
        </Button>
      </Box>
    </Box>
  );
}
