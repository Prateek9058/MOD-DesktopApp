import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import {
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  OutlinedInput,
  useTheme,
  Grid,
} from "@mui/material";
import { FaVolumeMute } from "react-icons/fa";
import { styled } from "@mui/material";
import { FaUsb } from "react-icons/fa";
import Image from "next/image";

const SelectFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 300,
  marginRight: "16px",
  "& .MuiInputLabel-root": {
    color: "#fff",
  },
  "& .MuiInputLabel-root.Mui-focused": {
    color: "#fff",
  },
  "& .MuiOutlinedInput-root": {
    color: "#fff",
    "& fieldset": {
      borderColor: "#fff",
    },
    "&:hover fieldset": {
      borderColor: "#fff",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#fff",
    },
  },
  "& .MuiSelect-icon": {
    color: "#fff",
  },
}));
export default function ButtonAppBar({
  ports,
  handleOpenDialog,
  isAlarmOn,
  toggleAlarm,
  handleChangeComp,
  selectedCom,
  setSelectedCom,
}) {
  const theme = useTheme();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="fixed">
        <Toolbar>
          <Grid
            container
            justifyContent={"space-between"}
            alignItems={"center"}
            p={0.5}
            spacing={2}
          >
            <Grid item display={"flex"} alignItems={"center"}>
              <Image
                src={"/images/indiaLogo.png"}
                height={80}
                width={50}
                alt="logo"
              />
              <Box sx={{ ml: 2 }}>
                <Typography
                  component="div"
                  sx={{ flexGrow: 1, fontSize: "10px" }}
                >
                  GOVERNMENT OF INDIA
                </Typography>
                <Typography
                  variant="subtitle1"
                  component="div"
                  sx={{ flexGrow: 1 }}
                >
                  DEPARTMENT OF DEFENCE PRODUCTION
                </Typography>
                <Typography
                  variant="subtitle2"
                  component="div"
                  sx={{ flexGrow: 1, fontSize: "12px" }}
                >
                  Temperarture & Humidity Monitoring
                </Typography>
              </Box>
            </Grid>
            <Grid item display={"flex"}>
              <SelectFormControl size="small">
                <InputLabel id="demo-simple-select-label">
                  {" "}
                  Select Device
                </InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={selectedCom}
                  label="Select Device"
                  size="small"
                  onChange={handleChangeComp}
                  input={
                    <OutlinedInput
                      label="Select Device"
                      startAdornment={
                        <InputAdornment position="start">
                          <FaUsb color="#fff" size="20px" />
                        </InputAdornment>
                      }
                    />
                  }
                >
                  <MenuItem value="">
                    <em>Select Device</em>
                  </MenuItem>
                  {ports?.map((item, index) => (
                    <MenuItem value={item?.path} key={index}>
                      {item?.friendlyName}
                    </MenuItem>
                  ))}
                </Select>
              </SelectFormControl>
              <Button
                color="inherit"
                variant="outlined"
                sx={{ mr: 2 }}
                onClick={handleOpenDialog}
              >
                set device-config
              </Button>
              <Button
                variant="outlined"
                onClick={toggleAlarm}
                startIcon={<FaVolumeMute />}
                sx={{
                  color: isAlarmOn ? theme.palette.error.main : "white",
                  borderColor: isAlarmOn ? theme.palette.error.main : "white",
                  "&:hover": {
                    borderColor: isAlarmOn ? theme.palette.error.main : "white",
                    color: isAlarmOn ? theme.palette.error.main : "white",
                  },
                }}
              >
                Turn Off Alarm
              </Button>
            </Grid>
          </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  );
}
