import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Stack,
  useTheme,
  ToggleButton,
  ToggleButtonGroup,
  TextField,
  InputAdornment,
  Paper,
} from "@mui/material";
import {
  LocationOn,
  AccessTime,
  DirectionsCar,
  TwoWheeler,
  StopCircle,
  Search,
} from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

export default function UserBookingHistory() {
  const theme = useTheme();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [stoppingId, setStoppingId] = useState(null);

  /* filters */
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");

  /* ---------------- LOAD HISTORY ---------------- */

  const loadHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get("/bookings/history");
      setBookings(res.data || []);
      setError("");
    } catch {
      setError("Failed to load booking history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  /* ---------------- STOP BOOKING ---------------- */

  const stopBooking = async (id) => {
    try {
      setStoppingId(id);
      await api.post(`/bookings/stop/${id}`);
      loadHistory();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to stop booking");
    } finally {
      setStoppingId(null);
    }
  };

  /* ---------------- FILTER + SEARCH ---------------- */

  const filteredBookings = useMemo(() => {
    return bookings
      .filter((b) => {
        if (filter === "ACTIVE") return b.status === "ACTIVE";
        if (filter === "COMPLETED") return b.status === "COMPLETED";
        if (filter === "2W") return b.vehicleType === "2W";
        if (filter === "4W") return b.vehicleType === "4W";
        return true;
      })
      .filter((b) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return (
          b.station?.name?.toLowerCase().includes(q) ||
          b.station?.place?.toLowerCase().includes(q) ||
          b.vehicleType?.toLowerCase().includes(q)
        );
      });
  }, [bookings, filter, search]);

  /* ---------------- HELPERS ---------------- */

  const formatTime = (date) =>
    new Date(date).toLocaleString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "short",
    });

  /* ---------------- UI ---------------- */

  return (
    <Box minHeight="100vh" p={{ xs: 2, md: 3 }} bgcolor={theme.palette.background.default}>
      <Typography variant="h4" fontWeight={900} mb={2}>
        📜 Booking History
      </Typography>

      {/* SEARCH + FILTER BAR */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 3,
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: "center",
        }}
      >
        <TextField
          fullWidth
          placeholder="Search by station, place or vehicle…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />

        <ToggleButtonGroup
          value={filter}
          exclusive
          onChange={(_, v) => v && setFilter(v)}
          size="small"
          sx={{
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <ToggleButton value="ALL">All</ToggleButton>
          <ToggleButton value="ACTIVE">Active</ToggleButton>
          <ToggleButton value="COMPLETED">Completed</ToggleButton>
          <ToggleButton value="2W">
            <TwoWheeler fontSize="small" />
          </ToggleButton>
          <ToggleButton value="4W">
            <DirectionsCar fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      {/* STATES */}
      {loading && (
        <Box textAlign="center" mt={6}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && filteredBookings.length === 0 && (
        <Alert severity="info">
          No bookings found for your search or filter.
        </Alert>
      )}

      {/* BOOKINGS LIST */}
      <Stack spacing={2}>
        {filteredBookings.map((b) => {
          const isActive = b.status === "ACTIVE";

          return (
            <Card
              key={b._id}
              sx={{
                borderRadius: 3,
                borderLeft: `6px solid ${
                  isActive
                    ? theme.palette.success.main
                    : theme.palette.grey[400]
                }`,
              }}
            >
              <CardContent>
                {/* HEADER */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap={1}
                >
                  <Box>
                    <Typography fontWeight={800}>
                      <LocationOn fontSize="small" />{" "}
                      {b.station?.name || "Parking Station"}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {b.station?.place}
                    </Typography>
                  </Box>

                  <Chip
                    label={b.status}
                    color={isActive ? "success" : "default"}
                    variant={isActive ? "filled" : "outlined"}
                  />
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* DETAILS */}
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: "1fr", sm: "1fr 1fr" }}
                  gap={1.5}
                >
                  <Typography variant="body2">
                    {b.vehicleType === "2W" ? (
                      <TwoWheeler fontSize="small" />
                    ) : (
                      <DirectionsCar fontSize="small" />
                    )}{" "}
                    {b.vehicleType} • Slot {b.slotNumber}
                  </Typography>

                  <Typography variant="body2">
                    <AccessTime fontSize="small" />{" "}
                    {formatTime(b.startTime)}
                    {b.endTime && ` → ${formatTime(b.endTime)}`}
                  </Typography>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                {/* PRICE */}
                <Box
                  display="flex"
                  justifyContent="space-between"
                  flexWrap="wrap"
                  gap={1}
                >
                  <Typography>
                    Rate: ₹{b.ratePerHour}/hr {b.ev && "+ EV"}
                  </Typography>

                  <Typography fontWeight={700}>
                    {isActive
                      ? "Running…"
                      : `₹${b.totalAmount} (${b.totalHours} hrs)`}
                  </Typography>
                </Box>

                {/* ACTION */}
                {isActive && (
                  <Box mt={2} textAlign="right">
                    <Button
                      variant="contained"
                      color="error"
                      startIcon={<StopCircle />}
                      disabled={stoppingId === b._id}
                      onClick={() => stopBooking(b._id)}
                    >
                      {stoppingId === b._id
                        ? "Stopping…"
                        : "Stop Parking"}
                    </Button>
                  </Box>
                )}
              </CardContent>
            </Card>
          );
        })}
      </Stack>
    </Box>
  );
}
