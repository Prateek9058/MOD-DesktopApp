import React, { useState, useEffect, useRef } from "react";
import { Card, Typography, Grid, Chip, useTheme } from "@mui/material";
import { Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

const Graph = ({ serialData }) => {
  const MAX_POINTS = 120;
  const pointCounter = useRef(0);
  const theme = useTheme();
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [
      {
        label: "Humidity",
        data: [],
        borderColor: "rgba(153,102,255,1)",
        backgroundColor: "rgba(153,102,255,0.2)",
        borderWidth: 2,
        tension: 0.1,
      },
    ],
  });

  useEffect(() => {
    if (serialData && serialData?.humidity !== undefined) {
      const timeLabel = new Date().toLocaleTimeString();
      pointCounter.current += 1;

      setChartData((prev) => {
        let newLabels = [...prev?.labels, timeLabel];
        let newData = [...prev?.datasets[0]?.data, serialData?.humidity];

        // If 120 points reached, reset the chart
        if (pointCounter.current >= MAX_POINTS) {
          pointCounter.current = 0;
          newLabels = [];
          newData = [];
        }

        return {
          ...prev,
          labels: newLabels,
          datasets: [
            {
              ...prev?.datasets[0],
              data: newData,
            },
          ],
        };
      });
    } else {
      pointCounter.current = 0;
      setChartData((prev) => ({
        ...prev,
        labels: [],
        datasets: [
          {
            ...prev.datasets[0],
            data: [],
          },
        ],
      }));
    }
  }, [serialData]);

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
      <Grid container mb={2} justifyContent="space-between" alignItems="center">
        <Typography variant="h6">Humidity Monitoring</Typography>
        <Chip
          label={`${serialData?.humidity ?? "--"}%`}
          sx={{
            backgroundColor: "rgba(153,102,255,1)",
            color: "#fff",
            minWidth: 100,
            fontWeight: 700,
            fontSize: "1rem",
          }}
        />
      </Grid>
      <div style={{ flexGrow: 1, minHeight: "380px" }}>
        <Line data={chartData} options={options} />
      </div>
    </Card>
  );
};

export default Graph;
