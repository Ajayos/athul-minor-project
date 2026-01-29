import { useEffect, useRef, useState } from "react";
import { useTheme, styled } from '@mui/material';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import Avatar from '@mui/material/Avatar';
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import TwoWheelerIcon from '@mui/icons-material/TwoWheeler';
import EvStationIcon from '@mui/icons-material/EvStation';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import StationDialog from "./StationDialog";
import { StationAPI } from "../../api/station.api";

/* ================= FILTERS ================= */

const FILTERS = [
  { key: "all", label: "All", icon: <SearchIcon /> },
  { key: "2w", label: "2W", icon: <TwoWheelerIcon /> },
  { key: "4w", label: "4W", icon: <DirectionsCarIcon /> },
  { key: "ev", label: "EV", icon: <EvStationIcon /> },
];

/* ================= STYLES ================= */

const Page = styled(Box)({
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
});

const Header = styled(Box)(({ theme }) => ({
  position: "sticky",
  top: 0,
  zIndex: 10,
  backdropFilter: "blur(10px)",
  background:
    theme.palette.mode === "dark"
      ? "rgba(18,18,18,0.85)"
      : "rgba(255,255,255,0.85)",
  padding: theme.spacing(3),
}));

const GridWrap = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
  gap: theme.spacing(3),
}));

const StationCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  borderRadius: 18,
  transition: "all .25s ease",
  border: `1px solid ${theme.palette.divider}`,

  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: theme.shadows[12],
  },
}));

const CardHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  gap: theme.spacing(1.5),
  alignItems: "center",
}));

const Description = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(1.2),
  borderRadius: 10,
  fontSize: 14,
  flexGrow: 1,
  overflowY: "auto",
  background:
    theme.palette.mode === "dark"
      ? "rgba(255,255,255,0.04)"
      : "rgba(0,0,0,0.04)",
}));

const Footer = styled(Box)(({ theme }) => ({
  display: "flex",
  borderTop: `1px solid ${theme.palette.divider}`,
}));

const ActionBtn = styled(Button)({
  flex: 1,
  borderRadius: 0,
  textTransform: "none",
  fontWeight: 600,
});

/* ================= COMPONENT ================= */

export default function StationList() {
  const theme = useTheme();
  const scrollRef = useRef(null);

  const [stations, setStations] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [showTop, setShowTop] = useState(false);
  const [deleteBox, setDeleteBox] = useState(null);
  const [snackbar, setSnackbar] = useState({
    open: false,
    msg: "",
    type: "success",
  });

  const loadStations = async (out) => {
    console.log(out, "out-")
    if(out){
      await StationAPI.create(out)
    }

    const res = await StationAPI.getAll();
    setStations(res.data || []);
  };

  const removeStation = async () => {
    try {
      await StationAPI.remove(deleteBox._id);
      setSnackbar({
        open: true,
        msg: "Station deleted successfully",
        type: "success",
      });
      setDeleteBox(null);
      loadStations();
    } catch (error) {
      setSnackbar({
        open: true,
        msg: "Failed to delete station",
        type: "error",
      });
    }
  }

  useEffect(() => {
    loadStations();
  }, []);

  useEffect(() => {
    let data = [...stations];

    if (search) {
      data = data.filter(
        (s) =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          s.place?.toLowerCase().includes(search.toLowerCase()),
      );
    }

    if (filter === "2w") data = data.filter((s) => s.twoW?.enabled);
    if (filter === "4w") data = data.filter((s) => s.fourW?.enabled);
    if (filter === "ev") data = data.filter((s) => s.twoW?.ev || s.fourW?.ev);

    setFiltered(data);
  }, [stations, search, filter]);

  return (
    <Page>
      {/* ================= HEADER ================= */}
      <Header>
        <Box
          display="flex"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Typography variant="h4" fontWeight={800}>
            🚗 Parking Centers
          </Typography>

          <Box display="flex" gap={1}>
            <Tooltip title="Refresh">
              <IconButton onClick={loadStations}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Button
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setOpen(true)}
            >
              Add Center
            </Button>
          </Box>
        </Box>

        <Box
          mt={2}
          display="flex"
          gap={1.5}
          alignItems="center"
          flexWrap="wrap"
        >
          <TextField
            size="small"
            placeholder="Search station or place…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <SearchIcon fontSize="small" />,
            }}
          />

          {FILTERS.map((f) => (
            <Chip
              key={f.key}
              icon={f.icon}
              label={f.label}
              clickable
              color={filter === f.key ? "primary" : "default"}
              onClick={() => setFilter(f.key)}
            />
          ))}
        </Box>
      </Header>

      <Divider />

      {/* ================= CONTENT ================= */}
      <Box ref={scrollRef} p={3} flex={1} overflow="auto">
        <GridWrap>
          {filtered.map((s) => (
            <StationCard key={s._id}>
              <CardContent sx={{ flexGrow: 1 }}>
                <CardHeader>
                  <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                    <DirectionsCarIcon />
                  </Avatar>
                  <Box minWidth={0}>
                    <Typography fontWeight={700} noWrap>
                      {s.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      <LocationOnIcon fontSize="small" /> {s.place}
                    </Typography>
                  </Box>
                </CardHeader>

                <Description>{s.description || "—"}</Description>

                <Box mt={1} display="flex" gap={0.5} flexWrap="wrap">
                  {s.twoW?.enabled && <Chip size="small" label="2W" />}
                  {s.fourW?.enabled && <Chip size="small" label="4W" />}
                  {(s.twoW?.ev || s.fourW?.ev) && (
                    <Chip size="small" icon={<EvStationIcon />} label="EV" />
                  )}
                </Box>
              </CardContent>

              <Footer>
                <ActionBtn
                  onClick={() => {
                    setEditData(s);
                    setOpen(true);
                  }}
                >
                  <EditIcon fontSize="small" /> Edit
                </ActionBtn>
                <ActionBtn color="error" onClick={() => setDeleteBox(s)}>
                  <DeleteIcon fontSize="small" /> Delete
                </ActionBtn>
              </Footer>
            </StationCard>
          ))}
        </GridWrap>
      </Box>

      {/* ================= FLOAT BUTTON ================= */}
      <Zoom in={showTop}>
        <Fab
          color="primary"
          size="small"
          sx={{ position: "fixed", bottom: 24, right: 24 }}
          onClick={() =>
            scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
          }
        >
          <KeyboardArrowUpIcon />
        </Fab>
      </Zoom>

      {/* ================= DIALOGS ================= */}
      <StationDialog
        open={open}
        editData={editData}
        onClose={() => {
          setOpen(false);
          setEditData(null);
        }}
        onSave={loadStations}
      />

      <Dialog open={!!deleteBox} onClose={() => setDeleteBox(null)}>
        <DialogTitle>Delete Station</DialogTitle>
        <DialogContent>
          <Alert severity="warning">
            Delete <strong>{deleteBox?.name}</strong> permanently?
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteBox(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={removeStation}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.type}>{snackbar.msg}</Alert>
      </Snackbar>
    </Page>
  );
}
