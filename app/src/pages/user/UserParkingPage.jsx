import {
  AppBar,
  Toolbar,
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Avatar,
  useTheme,
  styled,
  Button,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import {
  DirectionsCar,
  TwoWheeler,
  EvStation,
  LocationOn,
  Bookmark,
} from "@mui/icons-material";
import LogoutIcon from "@mui/icons-material/Logout";
import { useNavigate } from "react-router-dom";

import { useEffect, useState } from "react";
import { StationAPI } from "../../api/station.api";
import UserAvailableSlots from "./UserAvailableSlots";
import UserBookingHistory from './UserBookingHistory';

/* ---------------- STYLES ---------------- */

const Page = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: `
    linear-gradient(180deg,
      ${theme.palette.primary.light}12,
      ${theme.palette.background.default}
    )
  `,
}));

const GradientAppBar = styled(AppBar)(({ theme }) => ({
  background: `linear-gradient(
    120deg,
    ${theme.palette.primary.main},
    ${theme.palette.secondary.main}
  )`,
}));

const SwitchBar = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginTop: theme.spacing(2),
}));

const StyledToggle = styled(ToggleButton)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 700,
  padding: theme.spacing(1, 3),
  borderRadius: 20,
  border: "none",
  color: theme.palette.text.secondary,

  "&.Mui-selected": {
    background: `linear-gradient(
      135deg,
      ${theme.palette.primary.main},
      ${theme.palette.secondary.main}
    )`,
    color: "#fff",
    boxShadow: theme.shadows[6],
  },
}));

const StationGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: theme.spacing(3),
  marginTop: theme.spacing(3),
}));

const StationCard = styled(Card)(({ theme }) => ({
  borderRadius: 18,
  transition: "all .25s ease",
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: theme.shadows[10],
  },
}));

/* ---------------- COMPONENT ---------------- */

export default function UserParkingPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [view, setView] = useState("stations");
  const [stations, setStations] = useState([]);

  // 🔹 mock user bookings
  const userBookings = ["station_id_1", "station_id_3"];

  useEffect(() => {
    StationAPI.getAll().then((res) => {
      setStations(res.data || []);
    });
  }, []);

  const renderStation = (s, booked = false) => {
    const twoWAvailable = s.twoW?.enabled && Number(s.twoW.slots) > 0;
    const fourWAvailable = s.fourW?.enabled && Number(s.fourW.slots) > 0;
    const isAvailable = twoWAvailable || fourWAvailable;

    return (
      <StationCard key={s._id}>
        <CardContent>
          {/* HEADER */}
          <Box display="flex" gap={1} alignItems="center">
            <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
              <DirectionsCar />
            </Avatar>
            <Box>
              <Typography fontWeight={700}>{s.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                <LocationOn fontSize="small" /> {s.place}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          {/* SLOTS */}
          <Box display="flex" gap={1} flexWrap="wrap">
            {s.twoW?.enabled && (
              <Chip
                icon={<TwoWheeler />}
                label={`${s.twoW.slots} 2W`}
                color={twoWAvailable ? "success" : "error"}
                size="small"
              />
            )}
            {s.fourW?.enabled && (
              <Chip
                icon={<DirectionsCar />}
                label={`${s.fourW.slots} 4W`}
                color={fourWAvailable ? "success" : "error"}
                size="small"
              />
            )}
            {(s.twoW?.ev || s.fourW?.ev) && (
              <Chip
                icon={<EvStation />}
                label="EV"
                color="warning"
                size="small"
              />
            )}
          </Box>

          {/* STATUS */}
          <Box mt={2} display="flex" justifyContent="space-between">
            <Chip
              label={booked ? "Booked" : isAvailable ? "Available" : "Full"}
              color={booked ? "info" : isAvailable ? "success" : "error"}
              variant="outlined"
            />

            {!booked && isAvailable && (
              <Button size="small" variant="contained">
                Book Now
              </Button>
            )}
          </Box>
        </CardContent>
      </StationCard>
    );
  };

  return (
    <Page>
      <GradientAppBar position="sticky">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <Typography fontWeight={900} color="white">
            🚗 Parking Slots
          </Typography>

          {/* LOGOUT BUTTON */}
          <Button
            color="inherit"
            startIcon={<LogoutIcon />}
            sx={{
              fontWeight: 600,
              background: "rgba(255,255,255,0.15)",
              borderRadius: 3,
              px: 2,
              "&:hover": {
                background: "rgba(255,255,255,0.25)",
              },
            }}
            onClick={() => navigate("/logout")}
          >
            Logout
          </Button>
        </Toolbar>
      </GradientAppBar>
      {/* -------- SWITCH BAR -------- */}
      <SwitchBar>
        <ToggleButtonGroup
          value={view}
          exclusive
          onChange={(_, v) => v && setView(v)}
        >
          <StyledToggle value="stations">🚗 All Stations</StyledToggle>
          <StyledToggle value="bookings">🔖 My Bookings</StyledToggle>
        </ToggleButtonGroup>
      </SwitchBar>
      {/* -------- CONTENT -------- */}
      <Box p={3}>
        {view === "stations" && (
          <UserAvailableSlots />
        )}

        {view === "bookings" && (
          <UserBookingHistory />
        )}
      </Box>
    </Page>
  );
}
