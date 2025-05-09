"use client";
import React from "react";
import { Grid, Typography, Button, Chip } from "@mui/material";
import CustomTable from "../customTable/index";
import { RiFileExcel2Line } from "react-icons/ri";
import Papa from "papaparse";
import { saveAs } from "file-saver";
import { toast } from "react-toastify";
import localizedFormat from "dayjs/plugin/localizedFormat";
import dayjs from "dayjs";

const Table = ({ data, loading }) => {
  dayjs.extend(localizedFormat);
  const columns = [
    "Device Id",
    "Temperature(°C)",
    "Humidity(%)",
    "Battery (%)",
    "Date & Time",
  ];

  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(10);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  const count = data?.length;

  const renderPowerStatus = (status) => (
    <Chip
      label={status}
      sx={{
        backgroundColor: "#2D9CDB",
        color: "#fff",
        fontWeight: 600,
      }}
    />
  );
  const renderPowerStatus1 = (status) => (
    <Chip
      label={status}
      sx={{
        backgroundColor: "#FFBFBF",
        color: "red",
        fontWeight: 600,
      }}
    />
  );

  const getFormattedData = (data) => {
    return data?.map((item, index) => ({
      device_id: item.device_id ? item.device_id : "--",
      Temp: item?.temperature
        ? renderPowerStatus(`${item?.temperature} °C`)
        : "--",
      Humi: item?.humidity ? renderPowerStatus1(`${item?.humidity} %`) : "--",
      battery: item?.battery ? `${item?.battery} %` : "0%",
      time: item?.timestamp ? dayjs(item?.timestamp).format("lll") : "--",
    }));
  };
  const handleExport = (data) => {
    if (!Array.isArray(data) || data?.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const modifiedData = data?.map((row, index) => ({
      DeviceId: row?.device_id,
      temperature: `${row?.temperature} °C`,
      humidity: `${row?.humidity} %`,
      battery: `${row?.battery} %`,
      time: row?.timestamp ? dayjs(row?.timestamp).format("lll") : "--",
    }));

    const csvData = [];
    const tableHeading = "Temeperature & HUmidity History Data";
    csvData.push([[], [], tableHeading, [], []]);
    csvData.push([]);

    const headerRow = [
      "Device Id",
      "Temperature(°C)",
      "Humidity(%)",
      "Battery (%)",
      "Date & Time",
    ];
    csvData.push(headerRow);

    modifiedData.forEach((row) => {
      const rowData = [
        row?.DeviceId,
        row?.temperature,
        row?.humidity,
        row?.battery,
        dayjs(row?.time).format("lll"),
      ];
      csvData.push(rowData);
    });
    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "TemperatureHumidityHistory.csv");
    toast.success("Download Excel Succefully");
  };
  return (
    <Grid container mt={2}>
      <Grid
        container
        justifyContent="space-between"
        alignItems="center"
        p={2}
        sx={{
          borderRadius: "16px 16px 0px 0px",
          backgroundColor: "#fff",
        }}
      >
        <Grid item>
          <Typography variant="h5">
            Temperature and Humidity History{" "}
          </Typography>
        </Grid>
        <Grid item className="customSearch">
          <Grid container spacing={2}>
            <Grid item>
              <Button
                variant="outlined"
                startIcon={<RiFileExcel2Line />}
                sx={{ color: "black" }}
                onClick={() => {
                  handleExport(data);
                }}
              >
                Download Excel
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <CustomTable
        loading={loading}
        page={page}
        rows={getFormattedData(data)}
        count={count}
        columns={columns}
        setPage={setPage}
        rowsPerPage={rowsPerPage}
        ActionSkeletonLength={0}
        handleChangePage={handleChangePage}
        setRowsPerPage={setRowsPerPage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Grid>
  );
};

export default Table;
