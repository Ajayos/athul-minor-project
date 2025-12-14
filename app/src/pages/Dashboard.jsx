import { Typography, Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <Box p={4}>
      <Typography variant="h4">Dashboard</Typography>
      <Typography>Welcome to Vehicle Parking System</Typography>

      <Button
        variant="outlined"
        sx={{ mt: 2 }}
        onClick={() => navigate("/login")}
      >
        Logout (Demo)
      </Button>
    </Box>
  );
}
