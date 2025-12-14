import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  useTheme,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Card,
  CardContent,
  Chip,
  Divider,
  Fade,
} from "@mui/material";
import { styled } from "@mui/material/styles";

import {
  TwoWheeler,
  DirectionsCar,
  EvStation,
  InfoOutlined,
  SaveOutlined,
  CloseOutlined,
  Refresh,
} from "@mui/icons-material";

/* -------------------- STYLES -------------------- */

const Section = styled(Paper)(({ theme, color }) => ({
  padding: theme.spacing(3),
  borderRadius: 16,
  marginBottom: theme.spacing(3),
  border: `1px solid ${theme.palette.divider}`,
  background: `linear-gradient(
    180deg,
    ${color}10 0%,
    transparent 70%
  )`,
}));

const Grid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    gridTemplateColumns: "1fr 1fr",
  },
}));

const Field = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: 14,
    background:
      theme.palette.mode === "dark"
        ? "rgba(255,255,255,0.04)"
        : "rgba(0,0,0,0.04)",
  },
}));

/* -------------------- DATA -------------------- */

const defaultForm = {
  name: "",
  place: "",
  description: "",
  twoW: { enabled: false, slots: "", rate: "", ev: false, evRate: "" },
  fourW: { enabled: false, slots: "", rate: "", ev: false, evRate: "" },
};

/* -------------------- COMPONENT -------------------- */

export default function StationDialog({ open, onClose, editData, onSave }) {
  const theme = useTheme();
  const [form, setForm] = useState(defaultForm);
  const [tab, setTab] = useState(0);
  const [preview, setPreview] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(editData ? structuredClone(editData) : defaultForm);
      setTab(0);
      setPreview(false);
    }
  }, [open, editData]);

  const update = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const updateNested = (k, f, v) =>
    setForm((p) => ({ ...p, [k]: { ...p[k], [f]: v } }));

  const save = () => {
    onSave(form);
    onClose();
  };

  /* -------------------- PREVIEW -------------------- */

  const Preview = () => (
    <Fade in={preview}>
      <Card
        sx={{
          mt: 2,
          borderRadius: 3,
          background: `linear-gradient(135deg,
            ${theme.palette.primary.main},
            ${theme.palette.primary.dark})`,
          color: "#fff",
        }}
      >
        <CardContent>
          <Typography fontWeight={700}>{form.name || "—"}</Typography>
          <Typography variant="body2">{form.place || "—"}</Typography>

          <Divider sx={{ my: 1, borderColor: "rgba(255,255,255,.3)" }} />

          {form.twoW.enabled && (
            <Chip
              size="small"
              label={`2W • ₹${form.twoW.rate}/hr`}
              sx={{ mr: 1, bgcolor: "rgba(255,255,255,.2)", color: "#fff" }}
            />
          )}
          {form.fourW.enabled && (
            <Chip
              size="small"
              label={`4W • ₹${form.fourW.rate}/hr`}
              sx={{ bgcolor: "rgba(255,255,255,.2)", color: "#fff" }}
            />
          )}
        </CardContent>
      </Card>
    </Fade>
  );

  /* -------------------- CONTENT -------------------- */

  const renderTab = () => {
    if (tab === 0)
      return (
        <>
          <Section color={theme.palette.info.main}>
            <Typography fontWeight={700} mb={2}>
              <InfoOutlined fontSize="small" /> Basic Details
            </Typography>

            <Field
              fullWidth
              label="Parking Name"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
            />

            <Field
              fullWidth
              label="Address"
              value={form.place}
              onChange={(e) => update("place", e.target.value)}
              sx={{ mt: 2 }}
            />

            <Field
              fullWidth
              multiline
              rows={3}
              label="Description"
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              sx={{ mt: 2 }}
            />
          </Section>
          {Preview()}
        </>
      );

    const is2W = tab === 1;
    const key = is2W ? "twoW" : "fourW";
    const icon = is2W ? <TwoWheeler /> : <DirectionsCar />;
    const color = is2W ? theme.palette.success.main : theme.palette.error.main;

    return (
      <Section color={color}>
        <Typography fontWeight={700} mb={1}>
          {icon} {is2W ? "2 Wheeler" : "4 Wheeler"}
        </Typography>

        <FormControlLabel
          control={
            <Checkbox
              checked={form[key].enabled}
              onChange={(e) => updateNested(key, "enabled", e.target.checked)}
            />
          }
          label="Enable Parking"
        />

        {form[key].enabled && (
          <Grid>
            <Field
              label="Slots"
              type="number"
              value={form[key].slots}
              onChange={(e) => updateNested(key, "slots", e.target.value)}
            />
            <Field
              label="Rate / Hr (₹)"
              type="number"
              value={form[key].rate}
              onChange={(e) => updateNested(key, "rate", e.target.value)}
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={form[key].ev}
                  onChange={(e) => updateNested(key, "ev", e.target.checked)}
                />
              }
              label={
                <Box display="flex" gap={1}>
                  <EvStation fontSize="small" />
                  EV Charging
                </Box>
              }
            />

            {form[key].ev && (
              <Field
                label="EV Rate / Hr (₹)"
                type="number"
                value={form[key].evRate}
                onChange={(e) => updateNested(key, "evRate", e.target.value)}
              />
            )}
          </Grid>
        )}
      </Section>
    );
  };

  /* -------------------- RENDER -------------------- */

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="paper"
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      {/* HEADER */}
      <DialogTitle
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 1,
          background: `linear-gradient(90deg,
            ${theme.palette.primary.main},
            ${theme.palette.primary.dark})`,
          color: "#fff",
        }}
      >
        <Box display="flex" justifyContent="space-between">
          <Typography fontWeight={800}>
            {editData ? "Edit" : "Add"} Parking Center
          </Typography>
          <IconButton onClick={onClose} sx={{ color: "#fff" }}>
            <CloseOutlined />
          </IconButton>
        </Box>
      </DialogTitle>

      {/* TABS */}
      <Tabs value={tab} onChange={(_, v) => setTab(v)} centered>
        <Tab label="Basic" icon={<InfoOutlined />} />
        <Tab label="2W" icon={<TwoWheeler />} />
        <Tab label="4W" icon={<DirectionsCar />} />
      </Tabs>

      {/* BODY */}
      <DialogContent dividers>{renderTab()}</DialogContent>

      {/* ACTIONS */}
      <DialogActions sx={{ p: 2 }}>
        <Button startIcon={<Refresh />} onClick={() => setForm(defaultForm)}>
          Reset
        </Button>
        <Box flex={1} />
        <Button onClick={onClose}>Cancel</Button>
        <Button variant="contained" startIcon={<SaveOutlined />} onClick={save}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
