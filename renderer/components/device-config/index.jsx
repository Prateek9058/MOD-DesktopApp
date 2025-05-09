import React, { useEffect } from "react";
import Grid from "@mui/material/Grid";
import CommonDialog from "../Dialog/common-dialog";
import {
  Typography,
  TextField,
  DialogContent,
  DialogActions,
  Button,
  InputAdornment,
} from "@mui/material";
import dayjs from "dayjs";
import { useForm } from "react-hook-form";

const AddCouponsType1 = ({
  open,
  setOpen,
  SetCurrentTime,
  onSubmit,
  defaultThreshold,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm();
  const handleClose = () => {
    setOpen(false);
  };
  useEffect(() => {
    if (defaultThreshold && open) {
      setValue("datainterval", defaultThreshold?.defaultDataFrequency);
      setValue("samplingfrequency", defaultThreshold?.defaultSamplingFrequency);
      setValue("defaultTempThreshold", defaultThreshold?.defaultTempThreshold);
      setValue(
        "defaultHumidityThreshold",
        defaultThreshold?.defaultHumidityThreshold
      );
    }
  }, [open]);

  const handleClick = () => {
    try {
      const payload = {
        date: dayjs().format("DD/MM/YYYY"),
        time: dayjs().format("HH-mm-ss"),
      };
      SetCurrentTime(`${JSON.stringify(payload)}\n\r`);
    } catch (error) {}
  };

  return (
    <CommonDialog
      title="Device-Config"
      onClose={handleClose}
      message={"Are you sure want to cancel ?"}
      open={open}
      maxWidth="sm"
      titleConfirm={"Confirmation"}
      fullWidth
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Typography variant="subtitle1">Data Interval</Typography>
              <TextField
                placeholder="Enter data interval"
                fullWidth
                {...register("datainterval", {
                  required: "data interval is required",
                  min: {
                    value: 5,
                    message: "Minimum value is 5 seconds",
                  },
                  max: {
                    value: 300,
                    message: "Maximum value is 300 seconds",
                  },
                })}
                type="number"
                name={"datainterval"}
                error={!!errors.datainterval}
                helperText={errors.datainterval?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">sec</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1">Sampling Frequency</Typography>
              <TextField
                fullWidth
                placeholder="Enter Sampling frequency"
                {...register("samplingfrequency", {
                  required: "Sampling frequency is required",
                })}
                type="number"
                name={"samplingfrequency"}
                error={!!errors.samplingfrequency}
                helperText={errors.samplingfrequency?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">HZ</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1">
                Default Temperature Threshold
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter Temperature Threshold"
                {...register("defaultTempThreshold", {
                  required: "Temperature Threshold is required",
                })}
                type="number"
                name={"defaultTempThreshold"}
                error={!!errors.defaultTempThreshold}
                helperText={errors.defaultTempThreshold?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">°C</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={6}>
              <Typography variant="subtitle1">
                Default Humidity Threshold
              </Typography>
              <TextField
                fullWidth
                placeholder="Enter Humidity Threshold"
                {...register("defaultHumidityThreshold", {
                  required: "Humidity Threshold is required",
                })}
                type="number"
                name={"defaultHumidityThreshold"}
                error={!!errors.defaultHumidityThreshold}
                helperText={errors.defaultHumidityThreshold?.message}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">%</InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1">Set Current Time</Typography>
              <Button variant="contained" fullWidth onClick={handleClick}>
                Set current time
              </Button>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            variant="outlined"
            sx={{ color: "inherit" }}
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button variant="contained" type="submit">
            Submit
          </Button>
        </DialogActions>
      </form>
    </CommonDialog>
  );
};

export default AddCouponsType1;
