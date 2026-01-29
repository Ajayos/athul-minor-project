import { useTheme, styled } from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Avatar from '@mui/material/Avatar';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import Tooltip from '@mui/material/Tooltip';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import LogoutIcon from '@mui/icons-material/Logout';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StationList from "./StationList";
import { StationAPI } from "../../api/station.api";

/* ---------------- STYLES ---------------- */

const GradientAppBar = styled(AppBar)(({ theme }) => ({
  background: `
    linear-gradient(
      120deg,
      ${theme.palette.primary.main},
      ${theme.palette.secondary.main},
      ${theme.palette.primary.dark}
    )
  `,
  boxShadow: theme.shadows[12],
}));

const GlassToolbar = styled(Toolbar)(({ theme }) => ({
  minHeight: 76,
  backdropFilter: "blur(10px)",
  display: "flex",
  justifyContent: "space-between",
}));

const Brand = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1.2),
  padding: theme.spacing(1, 2),
  borderRadius: 20,
  background: "rgba(255,255,255,0.15)",
}));

const NavTabs = styled(Tabs)(({ theme }) => ({
  "& .MuiTabs-indicator": {
    display: "none",
  },
}));

const NavTab = styled(Tab)(({ theme }) => ({
  textTransform: "none",
  fontWeight: 700,
  fontSize: "0.95rem",
  minHeight: 48,
  padding: theme.spacing(1, 2),
  borderRadius: 14,
  color: "rgba(255,255,255,0.85)",

  "&.Mui-selected": {
    color: "#fff",
    background: "rgba(255,255,255,0.25)",
    boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
  },

  "&:hover": {
    background: "rgba(255,255,255,0.18)",
  },
}));

const Page = styled(Box)(({ theme }) => ({
  minHeight: "100vh",
  background: `
    radial-gradient(circle at top,
      ${theme.palette.primary.light}20,
      transparent 40%
    ),
    linear-gradient(
      180deg,
      ${theme.palette.grey[50]},
      ${theme.palette.background.default}
    )
  `,
}));

const Content = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
  },
}));

/* ---------------- USERS PLACEHOLDER ---------------- */

function UsersList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await StationAPI.getAllUser();
        setUsers(res.data || []);
      } catch (err) {
        console.error("Error fetching users:", err);
      }
    };

    fetchUsers();
  }, []);
  return (
    <Box
      sx={{
        p: 4,
        borderRadius: 4,
        background:
          "linear-gradient(135deg, rgba(33,150,243,0.08), rgba(156,39,176,0.08))",
      }}
    >
      <Typography variant="h5" fontWeight={800} mb={2}>
        👥 Users Management
      </Typography>
      <Typography color="text.secondary">
        Replace this with real users list
      </Typography>

      <Box mt={3}>
        {users.length === 0 ? (
          <Typography color="text.secondary">No users found.</Typography>
        ) : (
          users.map((user) => (
            <Box
              key={user.id}
              mb={2}
              p={2}
              borderRadius={2}
              sx={{
                background:
                  "linear-gradient(135deg, rgba(33,150,243,0.05), rgba(156,39,176,0.05))",
              }}
            >
              <Typography fontWeight={700}>
                User ID: {user._id}
              </Typography>
              <Typography>Phone: {user.phone}</Typography>
              <Typography>Vehicle Number: {user.vehicleNumber}</Typography>
              <Typography>Vehicle Type: {user.vehicleType}</Typography>
              <Typography>Role: {user.role}</Typography>
            </Box>
          ))
        )}
      </Box>
    </Box>
  );
}

/* ---------------- COMPONENT ---------------- */

export default function AdminDashboard() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [tab, setTab] = useState(0);
  const [menuEl, setMenuEl] = useState(null);

  return (
    <Page>
      {/* ---------- NAVBAR ---------- */}
      <GradientAppBar position="sticky">
        <GlassToolbar>
          {/* BRAND */}
          <Brand>
            <DashboardIcon sx={{ color: "#fff" }} />
            <Typography color="white" fontWeight={900}>
              Admin Panel
            </Typography>
          </Brand>

          {/* NAVIGATION */}
          <NavTabs value={tab} onChange={(_, v) => setTab(v)}>
            <NavTab
              label={
                <Box display="flex" gap={1} alignItems="center">
                  <DirectionsCarIcon fontSize="small" />
                  Parking
                </Box>
              }
            />
            <NavTab
              label={
                <Box display="flex" gap={1} alignItems="center">
                  <PeopleIcon fontSize="small" />
                  Users
                </Box>
              }
            />
          </NavTabs>

          {/* USER MENU */}
          <Tooltip title="Account">
            <IconButton onClick={(e) => setMenuEl(e.currentTarget)}>
              <Avatar
                sx={{
                  bgcolor: "#fff",
                  color: theme.palette.primary.main,
                  width: 38,
                  height: 38,
                }}
              >
                <PersonIcon fontSize="small" />
              </Avatar>
            </IconButton>
          </Tooltip>

          <Menu
            anchorEl={menuEl}
            open={Boolean(menuEl)}
            onClose={() => setMenuEl(null)}
            PaperProps={{
              sx: {
                borderRadius: 3,
                minWidth: 180,
              },
            }}
          >
            <MenuItem
              onClick={() => {
                setMenuEl(null);
                navigate("/login");
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText primary="Logout" />
            </MenuItem>
          </Menu>
        </GlassToolbar>
      </GradientAppBar>

      {/* ---------- CONTENT ---------- */}
      <Content>
        {tab === 0 && <StationList />}
        {tab === 1 && <UsersList />}
      </Content>
    </Page>
  );
}
