import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [phone, setPhone] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleType, setVehicleType] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!phone || !vehicleNumber || !vehicleType || !password) {
      setError("All fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const res = await api.post("/auth/register", {
        phone,
        vehicleNumber,
        vehicleType,
        password,
      });

      console.log("REGISTER RESPONSE:", res.data);

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
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
        elevation={10}
        sx={{
          width: "100%",
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
        }}
      >
        <Typography variant="h5" fontWeight="bold" textAlign="center" mb={1}>
          🚗 ParkHub Register
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          textAlign="center"
          mb={3}
        >
          Create your parking account
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
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
          />

          <TextField
            label="Vehicle Number"
            fullWidth
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
            disabled={loading}
          />

          <TextField
            select
            label="Vehicle Type"
            fullWidth
            value={vehicleType}
            onChange={(e) => setVehicleType(e.target.value)}
            disabled={loading}
          >
            <MenuItem value="2W">2 Wheeler</MenuItem>
            <MenuItem value="4W">4 Wheeler</MenuItem>
          </TextField>

          <TextField
            label="Password"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
          />

          <Button
            variant="contained"
            size="large"
            disabled={loading}
            onClick={handleRegister}
            sx={{
              mt: 1,
              py: 1.2,
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            }}
          >
            {loading ? "Creating Account..." : "Register"}
          </Button>

          <Button
            variant="text"
            onClick={() => navigate("/login")}
            sx={{ textTransform: "none" }}
          >
            Already have an account? Login
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
