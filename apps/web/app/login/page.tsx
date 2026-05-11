"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Box,
  Button,
  TextField,
  Typography,
  Divider,
  IconButton,
  InputAdornment,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useRouter } from "next/navigation";
import { login } from "@/lib/api/auth";
import { isApiError } from "@/lib/api/client";
import {
  buildInstitutionalEmail,
  INSTITUTIONAL_EMAIL_DOMAIN,
} from "@/lib/institutional-email";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registeredBanner, setRegisteredBanner] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("registered") !== "1") return;

    const id = window.setTimeout(() => {
      setRegisteredBanner(true);
      router.replace("/login", { scroll: false });
    }, 0);
    return () => window.clearTimeout(id);
  }, [router]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleLogin = async () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const institutionalEmail = buildInstitutionalEmail(username);

    setIsSubmitting(true);
    setErrors({});
    try {
      await login({ institutionalEmail, password });

      const params = new URLSearchParams(window.location.search);
      const callbackUrl = params.get("callbackUrl");
      const dest =
        callbackUrl &&
        callbackUrl.startsWith("/") &&
        !callbackUrl.startsWith("//") &&
        !callbackUrl.startsWith("/login")
          ? callbackUrl
          : "/";
      // Full navigation so the new page load always includes the session cookie set by the BFF
      // (avoids client-router timing issues after `Set-Cookie` on the login XHR).
      window.location.assign(dest);
    } catch (e: unknown) {
      const message = isApiError(e)
        ? e.message
        : "Network error. Please try again.";
      setErrors({ password: message });
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
          width: { xs: "90%", sm: 420 },
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
          Welcome
        </Typography>

        {registeredBanner ? (
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "success.main",
              mb: 2,
            }}
          >
            Account created. You can sign in below.
          </Typography>
        ) : null}

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <TextField
            label="Username"
            fullWidth
            placeholder="e.g. juan.perez"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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

          <TextField
            label="Password"
            fullWidth
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      type="button"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                      onClick={() => setShowPassword(!showPassword)}
                    >
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
        </Box>

        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          disabled={isSubmitting}
          sx={{
            textTransform: "none",
            mt: 3,
            borderRadius: "10px",
            py: 1.2,
            backgroundColor: "rgb(24, 62, 157)",
            "&:hover": { backgroundColor: "rgb(29, 54, 120)" },
          }}
        >
          {isSubmitting ? "Signing in…" : "Sign In"}
        </Button>

        <Divider sx={{ my: 2, borderColor: "rgb(189, 197, 217)" }} />

        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" sx={{ color: "rgb(131, 148, 189)" }}>
            Don&apos;t have an account?{" "}
            <Link
              href="/register"
              style={{
                color: "rgb(24, 62, 157)",
                fontWeight: 700,
                textDecoration: "none",
              }}
            >
              Register here
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}
