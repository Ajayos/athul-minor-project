import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  Button,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Grid,
  TextField,
  InputAdornment,
  useTheme,
  Stack,
} from "@mui/material";
import {
  DirectionsCar,
  TwoWheeler,
  EvStation,
  LocationOn,
  Search,
} from "@mui/icons-material";
import { useEffect, useMemo, useState } from "react";
import api from "../../api/axios";

/* ---------------- COMPONENT ---------------- */

export default function UserAvailableSlots() {
  const theme = useTheme();

  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [open, setOpen] = useState(false);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [useEV, setUseEV] = useState(false);
  const [booking, setBooking] = useState(false);

  /* ---------------- LOAD STATIONS ---------------- */

  const loadStations = async () => {
    try {
      setLoading(true);
      const res = await api.get("/user/stations/available");
      setStations(res.data.stations || []);
      setError("");
    } catch {
      setError("Failed to load parking stations");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStations();
  }, []);

  /* ---------------- SEARCH ---------------- */

  const filteredStations = useMemo(() => {
    if (!search) return stations;
    const q = search.toLowerCase();
    return stations.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.place?.toLowerCase().includes(q)
    );
  }, [stations, search]);

  /* ---------------- BOOKING ---------------- */

  const openBooking = (station) => {
    setSelectedStation(station);
    setSelectedSlot(null);
    setUseEV(false);
    setOpen(true);
  };

  const confirmBooking = async () => {
    if (!selectedStation || !selectedSlot || booking) return;

    try {
      setBooking(true);
      await api.post("/bookings/start", {
        stationId: selectedStation.stationId,
        slotNumber: selectedSlot,
        ev: useEV,
      });
      setOpen(false);
      loadStations();
    } catch (err) {
      alert(err.response?.data?.message || "Booking failed");
    } finally {
      setBooking(false);
    }
  };

  /* ---------------- SLOT GRID ---------------- */

  const renderSlots = () => {
    const total = selectedStation.totalSlots;
    const booked =
      selectedStation.totalSlots - selectedStation.availableSlots;

    return (
      <Grid container spacing={1} mt={1}>
        {Array.from({ length: total }).map((_, i) => {
          const slot = i + 1;
          const isBooked = slot <= booked;
          const isSelected = slot === selectedSlot;

          return (
            <Grid item xs={3} sm={2} md={2} lg={1.5} key={slot}>
              <Button
                fullWidth
                size="small"
                disabled={isBooked}
                onClick={() => setSelectedSlot(slot)}
                sx={{
                  height: 44,
                  fontWeight: 700,
                  borderRadius: 2,
                  bgcolor: isBooked
                    ? theme.palette.error.light
                    : isSelected
                    ? theme.palette.primary.main
                    : theme.palette.success.light,
                  color: isBooked
                    ? theme.palette.error.contrastText
                    : isSelected
                    ? "#fff"
                    : theme.palette.success.dark,
                  "&:hover": {
                    bgcolor: isSelected
                      ? theme.palette.primary.dark
                      : theme.palette.success.main,
                    color: "#fff",
                  },
                }}
              >
                {isBooked ? "❌" : `S${slot}`}
              </Button>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  /* ---------------- UI ---------------- */

  return (
    <Box minHeight="100vh" p={{ xs: 2, md: 3 }} bgcolor={theme.palette.background.default}>
      <Typography variant="h4" fontWeight={900} mb={2}>
        🅿 Available Parking Slots
      </Typography>

      {/* SEARCH */}
      <TextField
        fullWidth
        placeholder="Search by station or place..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {loading && (
        <Box textAlign="center" mt={6}>
          <CircularProgress />
        </Box>
      )}

      {error && <Alert severity="error">{error}</Alert>}

      {!loading && filteredStations.length === 0 && (
        <Alert severity="info">No stations found.</Alert>
      )}

      {/* STATIONS */}
      <Grid container spacing={3}>
        {filteredStations.map((s) => (
          <Grid item xs={12} sm={6} md={4} lg={3} key={s.stationId}>
            <Card
              sx={{
                borderRadius: 3,
                height: "100%",
                background: `linear-gradient(145deg,
                  ${theme.palette.background.paper},
                  ${theme.palette.primary.light}10
                )`,
                transition: "0.3s",
                "&:hover": {
                  transform: "translateY(-6px)",
                  boxShadow: theme.shadows[8],
                },
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    {s.vehicleType === "2W" ? <TwoWheeler /> : <DirectionsCar />}
                  </Avatar>
                  <Box>
                    <Typography fontWeight={700}>{s.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      <LocationOn fontSize="small" /> {s.place}
                    </Typography>
                  </Box>
                </Stack>

                <Divider sx={{ my: 1.5 }} />

                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip
                    label={`${s.availableSlots}/${s.totalSlots} Slots`}
                    color={s.bookingPossible ? "success" : "error"}
                    size="small"
                  />
                  {s.evSupported && (
                    <Chip
                      icon={<EvStation />}
                      label="EV"
                      color="warning"
                      size="small"
                    />
                  )}
                </Stack>

                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  mt={2}
                >
                  <Chip
                    label={`₹${s.rate}/hr`}
                    color="primary"
                    variant="outlined"
                  />
                  <Button
                    variant="contained"
                    disabled={!s.bookingPossible}
                    onClick={() => openBooking(s)}
                  >
                    Book
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* BOOKING MODAL */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>🚗 Select Parking Slot</DialogTitle>
        <DialogContent>
          {selectedStation && (
            <>
              <Typography fontWeight={700}>{selectedStation.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedStation.place}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Typography fontWeight={600}>Choose a Slot</Typography>
              {renderSlots()}

              <Divider sx={{ my: 2 }} />

              <Typography>
                Base Rate: ₹{selectedStation.rate}/hour
              </Typography>

              {selectedStation.evSupported && (
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={useEV}
                      onChange={(e) => setUseEV(e.target.checked)}
                    />
                  }
                  label={`EV Charger (+₹${selectedStation.evRate}/hr)`}
                />
              )}

              {selectedSlot && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  Total / Hour: ₹
                  {selectedStation.rate +
                    (useEV ? selectedStation.evRate : 0)}
                </Alert>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!selectedSlot || booking}
            onClick={confirmBooking}
          >
            {booking ? "Booking..." : "Confirm Booking"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
