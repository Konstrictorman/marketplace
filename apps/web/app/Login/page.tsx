"use client";
import { useState } from "react";
import {
  Box, Button, TextField, Typography,
  Divider, Modal, MenuItem, Select,
  InputLabel, FormControl, IconButton,
  InputAdornment
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { useRouter } from "next/navigation"

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

const RegisterModal = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    career: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!form.email.trim()) newErrors.email = "Email is required";
    else if (!form.email.endsWith("@unisabana.edu.co"))
      newErrors.email = "Must be an institutional email (@unisabana.edu.co)";
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    if (!form.confirmPassword) newErrors.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";
    return newErrors;
  };



  const handleSubmit = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    // TODO: connect to backend
    console.log("Register:", form);
    onClose();
  };


  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: { xs: '90%', sm: 480 },
        bgcolor: 'rgb(254, 254, 254)',
        borderRadius: '16px',
        boxShadow: '0px 8px 40px rgba(76, 98, 153, 0.3)',
        p: 4,
        outline: 'none',
        maxHeight: '90vh',
        overflow: 'auto',
      }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: 'rgb(0, 28, 100)', mb: 3 }}>
          Create Account
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Full Name */}
          <TextField
            label="Full Name"
            fullWidth
            value={form.fullName}
            onChange={e => setForm({ ...form, fullName: e.target.value })}
            error={!!errors.fullName}
            helperText={errors.fullName}
          />

          {/* Institutional Email */}
          <TextField
            label="Institutional Email"
            fullWidth
            placeholder="username@unisabana.edu.co"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
            error={!!errors.email}
            helperText={errors.email || "Must be your @unisabana.edu.co email"}
          />

          {/* Career (optional) */}
          <FormControl fullWidth>
            <InputLabel>Career (optional)</InputLabel>
            <Select
              value={form.career}
              label="Career (optional)"
              onChange={e => setForm({ ...form, career: e.target.value })}
            >
              <MenuItem value=""><em>Prefer not to say</em></MenuItem>
              {CAREERS.map(career => (
                <MenuItem key={career} value={career}>{career}</MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Password */}
          <TextField
            label="Password"
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={form.password}
            onChange={e => setForm({ ...form, password: e.target.value })}
            error={!!errors.password}
            helperText={errors.password}
            slotProps={{
              input:{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }
            }}
          />

          {/* Confirm Password */}
          <TextField
            label="Confirm Password"
            fullWidth
            type={showConfirm ? 'text' : 'password'}
            value={form.confirmPassword}
            onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
            error={!!errors.confirmPassword}
            helperText={errors.confirmPassword}
            slotProps={{
              input:{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }
            }}
          />

        </Box>

        <Box sx={{ display: 'flex', gap: 1, mt: 3 }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={onClose}
            sx={{
              borderRadius: '10px',
              borderColor: 'rgb(24, 62, 157)',
              color: 'rgb(24, 62, 157)',
              '&:hover': {
                borderColor: 'rgb(29, 54, 120)',
                backgroundColor: 'rgba(24, 62, 157, 0.05)',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            fullWidth
            onClick={handleSubmit}
            sx={{
              borderRadius: '10px',
              backgroundColor: 'rgb(24, 62, 157)',
              '&:hover': { backgroundColor: 'rgb(29, 54, 120)' }
            }}
          >
            Register
          </Button>
        </Box>

      </Box>
    </Modal>
  );
};

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const FAKE_USERS = [
    {username: "juan.perez", password: "password123"},
    {username: "maria.garcia", password: "password123"},
  ];

  const router = useRouter();

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!username.trim()) newErrors.username = "Username is required";
    if (!password) newErrors.password = "Password is required";
    return newErrors;
  };

  const handleLogin = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    const user = FAKE_USERS.find(
      u => u.username === username && u.password === password
    );
    if (!user) {
      setErrors({ password: "Invalid username or password"});
      return;
    }
    router.push("/");
  };


  return (
    <Box sx={{
      flex: 1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgb(239, 241, 244)',
      py: 8,
    }}>

      <Box sx={{
        width: { xs: '90%', sm: 420 },
        backgroundColor: 'rgb(254, 254, 254)',
        borderRadius: '16px',
        boxShadow: '0px 8px 40px rgba(76, 98, 153, 0.2)',
        p: 4,
      }}>

        {/* Title */}
        <Typography variant="h5" sx={{
          fontWeight: 'bold',
          color: 'rgb(0, 28, 100)',
          mb: 0.5,
          textAlign: 'center',
        }}>
          Welcome back
        </Typography>
        <Typography variant="body2" sx={{
          color: 'rgb(131, 148, 189)',
          textAlign: 'center',
          mb: 3,
        }}>
          Sign in with your Unisabana credentials
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* Username */}
          <TextField
            label="Username"
            fullWidth
            placeholder="e.g. juan.perez"
            value={username}
            onChange={e => setUsername(e.target.value)}
            error={!!errors.username}
            helperText={errors.username || "@unisabana.edu.co will be added automatically"}
            slotProps={{
              input:{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography variant="body2" sx={{ color: 'rgb(131, 148, 189)' }}>
                    @unisabana.edu.co
                  </Typography>
                </InputAdornment>
              )
            }
            }}
          />

          {/* Password */}
          <TextField
            label="Password"
            fullWidth
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            error={!!errors.password}
            helperText={errors.password}
            slotProps={{
              input:{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </InputAdornment>
              )
            }
            }}
          />

        </Box>

        {/* Login button */}
        <Button
          variant="contained"
          fullWidth
          onClick={handleLogin}
          sx={{
            mt: 3,
            borderRadius: '10px',
            py: 1.2,
            backgroundColor: 'rgb(24, 62, 157)',
            '&:hover': { backgroundColor: 'rgb(29, 54, 120)' }
          }}
        >
          Sign In
        </Button>

        <Divider sx={{ my: 2, borderColor: 'rgb(189, 197, 217)' }} />

        {/* Register link */}
        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" sx={{ color: 'rgb(131, 148, 189)' }}>
            Dont have an account?{' '}
            <Typography
              component="span"
              variant="body2"
              onClick={() => setRegisterOpen(true)}
              sx={{
                color: 'rgb(24, 62, 157)',
                fontWeight: 'bold',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
            >
              Register here
            </Typography>
          </Typography>
        </Box>

      </Box>

      <RegisterModal
        open={registerOpen}
        onClose={() => setRegisterOpen(false)}
      />

    </Box>
  );
}