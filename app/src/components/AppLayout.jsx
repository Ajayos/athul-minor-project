import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

const ScrollLayout = styled(Box)(({ theme }) => ({
  width: "100vw",
  height: "100vh",
  overflowY: "auto",
  overflowX: "hidden",

  /* scrollbar styling */
  scrollbarWidth: "thin",
  scrollbarColor: `${theme.palette.primary.main} ${theme.palette.background.default}`,

  "&::-webkit-scrollbar": {
    width: 10,
  },
  "&::-webkit-scrollbar-track": {
    background: theme.palette.background.default,
  },
  "&::-webkit-scrollbar-thumb": {
    backgroundColor: theme.palette.primary.main,
    borderRadius: 8,
    border: `2px solid ${theme.palette.background.default}`,
  },
  "&::-webkit-scrollbar-thumb:hover": {
    backgroundColor: theme.palette.primary.dark,
  },
}));

export default function AppLayout({ children }) {
  return <ScrollLayout>{children}</ScrollLayout>;
}
