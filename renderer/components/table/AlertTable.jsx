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

const Table = ({ data, loading, ports }) => {
  dayjs.extend(localizedFormat);
  const columns = [
    "Device Id",
    "Alert Type",
    "Threshold",
    "Value",
    "Severity",
    "Date ",
    "Time",
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
        minWidth: "80px",
      }}
    />
  );
  const renderPowerStatus1 = (status) => (
    <Chip
      label={status}
      sx={{
        backgroundColor: "#FF0000",
        color: "#fff",
        fontWeight: 600,
        minWidth: "80px",
      }}
    />
  );
  const setColor = (severity) => {
    switch (severity) {
      case "low":
        return "green";
      case "medium":
        return "orange";
      case "high":
        return "red";
      case "critical":
        return "darkred";
      default:
        return "gray";
    }
  };

  const getFormattedData = (data) => {
    return data?.map((item, index) => ({
      deviceMac: item?.deviceMac ?? "--",
      type: item?.type ? item?.type : "--",
      threshold: renderPowerStatus(item?.threshold) ?? "--",
      value: renderPowerStatus1(item?.value) ?? "--",
      severity: (
        <>
          <Typography color={setColor(item?.severity)}>
            {item?.severity ?? "--"}
          </Typography>
        </>
      ),
      timestamp: item?.timestamp
        ? dayjs(item?.timestamp).format("DD/MM/YYYY")
        : "--",
      times: item?.timestamp ? dayjs(item?.timestamp).format("LTS") : "--",
    }));
  };
  const handleExport = (data) => {
    if (!Array.isArray(data) || data?.length === 0) {
      toast.error("No data available to export");
      return;
    }

    const modifiedData = data?.map((row, index) => ({
      deviceMac: row?.deviceMac,
      type: row?.type,
      threshold: row?.threshold,
      value: row?.value,
      severity: row?.severity,
      date: dayjs(row?.timestamp).format("DD/MM/YYYY"),
      time: dayjs(row?.timestamp).format("HH:MM A"),
    }));

    const csvData = [];
    const tableHeading = "Temeperature & HUmidity History Data";
    csvData.push([[], [], tableHeading, [], []]);
    csvData.push([]);

    const headerRow = [
      "Device Id",
      "Alert Type",
      "Threshold",
      "Value",
      "Severity",
      "Date ",
      "Time",
    ];
    csvData.push(headerRow);

    modifiedData.forEach((row) => {
      const rowData = [
        row?.deviceMac,
        row?.type,
        row?.threshold,
        row?.value,
        row?.severity,
        dayjs(row?.date).format("DD/MM/YYYY"),
        dayjs(row?.time).format("HH:MM A"),
      ];
      csvData.push(rowData);
    });
    const csvString = Papa.unparse(csvData);
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });
    saveAs(blob, "TemperatureHumidityAlerts.csv");
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
          <Typography variant="h5">Alerts </Typography>
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
        ActionSkeletonLength={0}
        rowsPerPage={rowsPerPage}
        handleChangePage={handleChangePage}
        setRowsPerPage={setRowsPerPage}
        handleChangeRowsPerPage={handleChangeRowsPerPage}
      />
    </Grid>
  );
};

export default Table;
