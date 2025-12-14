import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import api from "../api/axios";

export default function ParkingLogin() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!phone || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/login", { phone, password });

      console.log("LOGIN RESPONSE:", res.data);

      const role = res.data?.user?.role;

      if (role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("LOGIN ERROR:", err);
      setError(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      width="100vw"
      height="100vh"
      display="flex"
      alignItems="center"
      justifyContent="center"
      sx={{
        background:
          "linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)",
      }}
    >
      <Paper
        elevation={12}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold" textAlign="center">
          🚗 ParkHub
        </Typography>

        <Typography
          variant="body2"
          textAlign="center"
          color="text.secondary"
          mb={3}
        >
          Smart Parking System
        </Typography>

        {error && (
          <Box
            mb={2}
            p={1.5}
            borderRadius={2}
            bgcolor="#ffe6e6"
            color="#c00"
            fontSize="14px"
          >
            {error}
          </Box>
        )}

        <Box display="flex" flexDirection="column" gap={2}>
          <TextField
            label="Phone Number"
            fullWidth
            value={phone}
            disabled={loading}
            onChange={(e) => setPhone(e.target.value)}
          />

          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            disabled={loading}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="contained"
            size="large"
            disabled={loading}
            onClick={handleLogin}
            sx={{
              mt: 1,
              py: 1.2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {loading ? <CircularProgress size={24} /> : "Login"}
          </Button>

          <Button
            variant="text"
            onClick={() => navigate("/register")}
            sx={{ textTransform: "none" }}
          >
            Don’t have an account? Register
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
