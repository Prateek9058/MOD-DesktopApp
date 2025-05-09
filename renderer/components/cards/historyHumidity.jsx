import React from "react";
import { Grid, Card, Typography, useTheme } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const Graph = ({ data }) => {
  const timeLabels = data?.map((item) => item?.timestamp);
  const HumidityData = data?.map((item) => item?.humidity);
  const theme = useTheme();

  const chartData = {
    labels: timeLabels,
    datasets: [
      {
        label: "Humidity",
        data: HumidityData,
        backgroundColor: "rgba(247, 187, 187, .2)",
        borderColor: "#FF5B5B",
        borderWidth: 3,
        pointStyle: "circle",
        pointRadius: 2,
        pointHoverRadius: 10,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color:
            theme.palette.mode === "dark"
              ? "rgba(255, 255, 255, 0.1)"
              : "rgba(0, 0, 0, 0.1)",
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          maxRotation: 0,
          autoSkip: true,
          maxTicksLimit: 10,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index",
        intersect: false,
      },
    },
    elements: {
      point: {
        radius: 1, // Hide points for cleaner look
        hitRadius: 10, // But keep them clickable
      },
    },
  };

  return (
    <Card sx={{ p: 2 }}>
      <Grid
        container
        mb={2}
        justifyContent={"space-between"}
        alignItems={"center"}
      >
        <Typography variant="h6">Humidity</Typography>
      </Grid>
      <Grid container>
        <Line data={chartData} height={390} options={options} />
      </Grid>
    </Card>
  );
};

export default Graph;
