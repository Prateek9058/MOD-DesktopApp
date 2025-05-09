import { createTheme } from "@mui/material/styles";

// Create a theme instance.
const theme = createTheme({
  palette: {
    primary: {
      main: "#13406C",
      light: "#567592",
    },
    secondary: {
      main: "#424141",
      dark: "#424141",
    },
    success: {
      main: "#347D00",
      light: "#CCDEBF",
    },
    info: {
      main: "#697077",
    },
    error: {
      main: "#FF0000",
    },
    warning: {
      main: "#ffb22b",
    },
  },
});

export default theme;
