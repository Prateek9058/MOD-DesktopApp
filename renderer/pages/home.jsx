import React from "react";
import { ThemeProvider } from "@emotion/react";
import { baselightTheme } from "../utils/theme/DefaultColors";
import CssBaseline from "@mui/material/CssBaseline";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import MainContainer from "./main";

const Index = () => {
  return (
    <ThemeProvider theme={baselightTheme}>
      <ToastContainer />
      <CssBaseline />
      <MainContainer />
    </ThemeProvider>
  );
};

export default Index;
