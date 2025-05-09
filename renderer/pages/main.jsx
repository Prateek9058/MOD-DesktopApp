import React, { useEffect, useState, useRef } from "react";
import { Grid, Typography, useTheme, Button } from "@mui/material";
import CustomTableContent from "../components/table/AlertTable";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Header from "../components/Header/index";
import TabList from "../components/customTabs/TabList";
import TabPanelList from "../components/customTabs/TabPanel";
import HistoryCard from "../components/cards/historyCard";
import { HiOutlineRefresh } from "react-icons/hi";
import { FaRegTrashAlt } from "react-icons/fa";
import dayjs from "dayjs";
import DeviceConfigDialog from "../components/device-config";
import TempGraph from "../components/cards/graph";
import HumidityGraph from "../components/cards/humidityGraph";
import CommanDialog from "../components/Dialog/index";
import axios from "axios";
import DateRangePicker from "../components/Date-range-Picker/index";

const FIFTEEN_DAYS_MS = 15 * 24 * 60 * 60 * 1000;
const permissions = { live: true, history: true };
const Index = () => {
  const theme = useTheme();
  const [open, setOpenDialog] = React.useState(false);
  const [ports, setPorts] = useState([]);
  const [value, setValue] = useState(0);
  const [serialData, setSerialData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyArray, setHistoryArray] = useState([]);
  const [deleteHistory, setDeleteHistory] = useState(false);
  const [alertData, setAlertData] = useState(null);
  const [alertHistory, setAlertHistory] = useState([]);
  const [deviceMac, setDeviceMac] = useState(null);
  const [alertLoading, setAlertloading] = useState(false);
  const [defaultThreshold, setDefaultThreshold] = useState(null);
  const [isAlarmOn, setIsAlarmOn] = useState(false);
  const [selectedCom, setSelectedCom] = React.useState("");
  const [filterHistory, setFilteredHistory] = useState([]);
  const [selectedDate, setSelectedDate] = useState({
    startDate: null,
    endDate: null,
  });
  const soundRef = useRef(null);
  const portsRef = useRef([]);
  const connectedRef = useRef(false);
  const currentPathRef = useRef(null);

  useEffect(() => {
    if (deviceMac && ports.length > 0) {
      history(deviceMac);
    }
  }, [deviceMac, ports]);

  useEffect(() => {
    if (!deviceMac) return;
    AutoDelete(deviceMac);
    const interval = setInterval(() => {
      AutoDelete(deviceMac);
    }, FIFTEEN_DAYS_MS);
    return () => clearInterval(interval);
  }, [deviceMac]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      soundRef.current = new Audio("/images/policeMp3.mp3");
      soundRef.current.loop = true;
    }
  }, []);

  useEffect(() => {
    const fetchPorts = async () => {
      const initialPorts = await window.ipc.listPorts();
      setPorts(initialPorts);
      portsRef.current = initialPorts;

      if (initialPorts.length > 0) {
        const firstPort = initialPorts[0];
        currentPathRef.current = firstPort.path;
        connectedRef.current = true;
        setSelectedCom(firstPort.path);
        localStorage.setItem("selectedComPort", firstPort.path);
        await Connected(firstPort.path);
      }
    };

    const handleAttach = async (newPorts) => {
      setPorts(newPorts);
      portsRef.current = newPorts;
      // Check if the previously connected device is in the new list
      const reconnectedPort = newPorts.find(
        (port) => port.path === currentPathRef.current
      );
      // If we have a stored port path and it's now available again
      if (currentPathRef.current && reconnectedPort && !connectedRef.current) {
        currentPathRef.current = reconnectedPort.path;
        connectedRef.current = true;
        setSelectedCom(reconnectedPort.path);
        localStorage.setItem("selectedComPort", reconnectedPort.path);
        await Connected(reconnectedPort.path);
      }
      // If no device was connected before but we have ports available
      else if (!connectedRef.current && newPorts.length > 0) {
        const nextPort = newPorts[0];
        currentPathRef.current = nextPort.path;
        connectedRef.current = true;
        setSelectedCom(nextPort.path);
        localStorage.setItem("selectedComPort", nextPort.path);
        await Connected(nextPort.path);
      }
    };
    const handleDetach = async (newPorts) => {
      setPorts(newPorts);
      portsRef.current = newPorts;
      // Check if our currently connected device is still available
      const stillConnected = newPorts.find(
        (port) => port.path === currentPathRef.current
      );
      if (!stillConnected && connectedRef.current) {
        await DisConnected(currentPathRef.current);
        connectedRef.current = false;
        // Clear the states when device is disconnected
        setAlertHistory([]);
        setSerialData(null);
        setHistoryArray([]);
        if (newPorts.length > 0) {
          const nextPort = newPorts[0];
          currentPathRef.current = nextPort.path;
          connectedRef.current = true;
          setSelectedCom(nextPort.path);
          await Connected(nextPort.path);
        } else {
          currentPathRef.current = null;
          setSelectedCom(null);
          localStorage.removeItem("selectedComPort");
        }
      }
    };
    fetchPorts();
    window.ipc.onSerialAttach(handleAttach);
    window.ipc.onSerialDetach(handleDetach);
    return () => {
      window.ipc.onSerialAttach(null);
      window.ipc.onSerialDetach(null);
    };
  }, []);

  const playSound = () => {
    if (soundRef.current && !isAlarmOn) {
      soundRef.current.play().catch((err) => {
        console.error("Failed to play sound:", err);
      });
      setIsAlarmOn(true);
    }
  };
  const stopSound = () => {
    if (soundRef.current) {
      soundRef.current.pause();
      soundRef.current.currentTime = 0;
      setIsAlarmOn(false);
    }
  };
  const handleChangeComp = async (event) => {
    const newComPort = event.target.value;
    if (connectedRef.current && currentPathRef.current !== newComPort) {
      await DisConnected(currentPathRef.current);
    }
    currentPathRef.current = newComPort;
    connectedRef.current = true;
    setSelectedCom(newComPort);
    localStorage.setItem("selectedComPort", newComPort);
    await Connected(newComPort);
    setAlertHistory([]);
    setSerialData(null);
    setHistoryArray([]);
  };

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    if (newValue === 1) {
      ReadHistory("HIST_COMM\n\r");
    }
    if (newValue === 0) {
      setHistoryArray([]);
    }
  };
  const handleOpenDialog = () => {
    setOpenDialog(true);
  };

  const getAlerts = async (id) => {
    try {
      const { data, status } = await axios.get(
        `http://localhost:8888/api/alerts?deviceMac=${id}`
      );
      if (status === 200 || status === 201) {
        setAlertData(data);

        setAlertHistory((prev) => [data, ...prev]);
        playSound();
        setIsAlarmOn(true);
      }
    } catch (error) {}
  };

  const calculateSeverity = (difference) => {
    if (difference >= 10) return "critical";
    if (difference >= 5) return "high";
    if (difference >= 2) return "medium";
    return "low";
  };

  const handleSerialData = async (data) => {
    try {
      const response = await axios.get(
        `http://localhost:8888/api/settings?device_id=${data?.device_id}`
      );
      setDeviceMac(data?.device_id);
      const setting = response?.data;
      setDefaultThreshold(setting);
      if (!setting) {
        console.warn("No setting found for device_id:", data?.device_id);
        return;
      }
      const alerts = [];
      // Temperature threshold
      if (
        data?.temperature !== undefined &&
        setting.defaultTempThreshold !== undefined
      ) {
        if (data.temperature > setting.defaultTempThreshold) {
          const diff = data.temperature - setting.defaultTempThreshold;

          alerts.push({
            deviceMac: data?.device_id,
            type: "Temperature",
            value: data.temperature,
            threshold: setting.defaultTempThreshold,
            severity: calculateSeverity(diff),
          });
        }
      }
      // Humidity threshold
      if (
        data?.humidity !== undefined &&
        setting.defaultHumidityThreshold !== undefined
      ) {
        const diff = data.humidity - setting.defaultHumidityThreshold;
        if (diff > 0) {
          alerts.push({
            deviceMac: data?.device_id,
            type: "Humidity",
            value: data.humidity,
            threshold: setting.defaultHumidityThreshold,
            severity: calculateSeverity(diff),
          });
        }
      }
      // Send alerts
      if (alerts.length > 0) {
        for (const alert of alerts) {
          await axios?.post(`http://localhost:8888/api/alerts`, alert);
          await getAlerts(alert?.deviceMac);
        }
      }
    } catch (error) {
      console.error("Error in handleSerialData:", error);
    }
  };

  const handleOpenDeleteHistory = () => {
    setDeleteHistory(true);
  };
  const Connected = async (path1) => {
    try {
      const baudRate = 115200;
      const result = await window?.ipc?.openPort({
        path: path1,
        baudRate,
      });

      if (result === true) {
        toast.success(`Port opened successfully at ${path1}`);
        currentPathRef.current = path1;
        connectedRef.current = true;
        window?.ipc?.onSerialData((data) => {
          try {
            setSerialData(JSON.parse(data.toString()));
            handleSerialData(JSON.parse(data.toString()));
          } catch (error) {
            console.error("Failed to parse JSON data:", error);
          }
        });
      }
    } catch (err) {
      console.log(err, "error");
      toast.error(`Failed to open port at ${path1}`);
    }
  };

  const DisConnected = async (event) => {
    try {
      const result = await window.ipc.closePort(event);
      if (result.success) {
        toast.success(result.msg);
      }
      connectedRef.current = false;
      currentPathRef.current = null;
    } catch (err) {
      toast.error(`${event} Failed to close port`);
    }
  };

  const ReadHistory = async (data) => {
    setLoading(true);
    toast.info("Fetching data from the device...");
    try {
      setHistoryArray([]);
      const result = await window.ipc.readData({ data });
      const entries = result
        .split("{HISTORY} : ")
        .map((line) => line.trim())
        .filter((line) => line.startsWith("{") && line.endsWith("}"));

      // Parse each JSON string safely
      const parsedArray = entries
        .map((jsonStr) => {
          try {
            return JSON.parse(jsonStr);
          } catch (e) {
            console.warn("Invalid JSON skipped:", jsonStr);
            return null;
          }
        })
        .filter(Boolean);

      // Update the state with all parsed history entries
      setHistoryArray((prev) => [...prev, ...parsedArray]);
      toast.success(`Data fetched successfully`);
    } catch (error) {
      console.error("Error parsing or invoking readData:", error);
    } finally {
      setLoading(false);
    }
  };
  const ClearHistory = async (data) => {
    try {
      const result = await window.ipc.clearData({ data });
      if (result.success) {
        setHistoryArray([]);
        toast.success(`data deleted successfully`);
      } else {
        console.error("Error in response:", result.message);
      }
    } catch (error) {
      console.error(
        "Error invoking clear-data:",
        JSON.stringify(error, null, 2)
      );
      toast.error(`Error invoking clear-data:`);
    }
  };

  const SetCurrentTime = async (data) => {
    try {
      const result = await window.ipc.setCurrentTime1({ data });
      if (result.success) {
        toast.success(result.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };

  const DeviceConfigured = async (data) => {
    try {
      const result = await window.ipc.setDefaultValues({ data });
      if (result.success) {
        toast.success(result.message);
      }
    } catch (error) {
      toast.error(error);
    }
  };
  const getTabLabel = (permission) => {
    switch (permission) {
      case "live":
        return "Live Data";
      case "history":
        return "History";
      default:
        return "";
    }
  };
  const panels = [
    {
      permission: "live",
      component: (
        <>
          <Grid
            container
            justifyContent={"space-between"}
            alignItems={"center"}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <TempGraph serialData={serialData} />
              </Grid>
              <Grid item xs={12} md={6}>
                <HumidityGraph serialData={serialData} />
              </Grid>
            </Grid>
            <CustomTableContent
              ReadHistory={ReadHistory}
              data={alertHistory}
              ClearHistory={ClearHistory}
              loading={alertLoading}
              ports={ports}
            />
          </Grid>
        </>
      ),
    },
    {
      permission: "history",
      component: (
        <HistoryCard
          ReadHistory={ReadHistory}
          SetCurrentTime={SetCurrentTime}
          data1={serialData}
          historyArray={filterHistory}
          serialData={serialData}
          ClearHistory={ClearHistory}
          ports={ports}
          loading={loading}
        />
      ),
    },
  ];
  const handleCancel = () => {
    setDeleteHistory(false);
  };
  const handleConfirm = async () => {
    if (historyArray.length === 0) {
      toast.error("no data found");
      handleCancel();
      return;
    }
    ClearHistory("CLEAR_SDCARD\n\r");
    handleCancel();
  };

  const onSubmit = async (data1) => {
    try {
      const payload = {
        device_id: serialData?.device_id,
        samplingfrequency: parseInt(data1?.samplingfrequency),
        datainterval: parseInt(data1?.datainterval),
      };
      const data2 = `${JSON.stringify(payload)}\n\r`;
      const body = {
        device_id: serialData?.device_id,
        defaultSamplingFrequency: parseInt(data1?.samplingfrequency),
        defaultDataFrequency: parseInt(data1?.datainterval),
        defaultTempThreshold: parseInt(data1?.defaultTempThreshold),
        defaultHumidityThreshold: parseInt(data1?.defaultHumidityThreshold),
      };
      const { data, status } = await axios.post(
        `http://localhost:8888/api/settings`,
        body
      );
      if (status === 201) {
        toast.success(data?.msg);
      }
      DeviceConfigured(data2);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error in onSubmit:", error);
    }
  };
  const getDataFromChildHandler = (state) => {
    setSelectedDate({
      startDate: dayjs(state[0]?.startDate).format("YYYY-MM-DD"),
      endDate: dayjs(state[0]?.endDate).format("YYYY-MM-DD"),
    });
  };
  const history = async (deviceMac) => {
    setAlertloading(true);
    try {
      const { data, status } = await axios.get(
        `http://localhost:8888/api/history?deviceMac=${deviceMac}`
      );
      if (status === 200) {
        setAlertHistory([...data, alertData]);
        setAlertloading(false);
      }
    } catch (error) {
      setAlertloading(false);
    }
  };

  const AutoDelete = async (deviceMac) => {
    try {
      const { data, status } = axios.delete(
        `http://localhost:8888/api/history?deviceMac=${deviceMac}`
      );
      if (status === 200) {
        toast.success(data?.msg);
      }
    } catch (error) {
      console.log("error", error);
    }
  };
  useEffect(() => {
    const parseDate = (dateTimeString) => {
      try {
        if (!dateTimeString) {
          throw new Error("Invalid date-time string");
        }
        // Extract just the date part (format: "2025-5-9")
        const datePart = dateTimeString.split(" ")[0];
        if (!datePart) {
          throw new Error("Missing date component");
        }

        const [year, month, day] = datePart.split("-").map(Number);

        if (isNaN(year) || isNaN(month) || isNaN(day)) {
          throw new Error("Invalid date components");
        }

        return new Date(year, month - 1, day);
      } catch (error) {
        console.error("Error parsing date:", error.message);
        return null;
      }
    };
    // Us current date if startDate or endDate is not provided
    const currentDate = dayjs();
    const selectedStartDate = selectedDate?.startDate || currentDate;
    const selectedEndDate = selectedDate?.endDate || currentDate;
    // Normalize the range to start and end of day
    const start = dayjs(selectedStartDate).startOf("day");
    const end = dayjs(selectedEndDate).endOf("day");

    if (historyArray?.length) {
      const filteredData = historyArray.filter((item) => {
        if (!item?.timestamp) return false;

        const itemDate = parseDate(item.timestamp);
        if (!itemDate) return false;

        const itemDayjs = dayjs(itemDate);

        // Alternative if isBetween still doesn't work:
        return (
          itemDayjs.isSame(start) ||
          itemDayjs.isSame(end) ||
          (itemDayjs.isAfter(start) && itemDayjs.isBefore(end))
        );
      });
      setFilteredHistory(filteredData);
    } else {
      setFilteredHistory([]);
    }
  }, [historyArray, selectedDate]);
  return (
    <>
      {deleteHistory && (
        <CommanDialog
          open={deleteHistory}
          bgcolor={"red"}
          fullWidth={true}
          maxWidth={"xs"}
          title="Confirmation"
          message="Are you certain you want to delete the history from both the app and the device?"
          color="error"
          onClose={handleCancel}
          onConfirm={handleConfirm}
        />
      )}
      {open && (
        <DeviceConfigDialog
          open={open}
          setOpen={setOpenDialog}
          SetCurrentTime={SetCurrentTime}
          onSubmit={onSubmit}
          defaultThreshold={defaultThreshold}
        />
      )}
      <Header
        ports={ports}
        handleOpenDialog={handleOpenDialog}
        toggleAlarm={stopSound}
        isAlarmOn={isAlarmOn}
        handleChangeComp={handleChangeComp}
        selectedCom={selectedCom}
        setSelectedCom={setSelectedCom}
      />
      <Grid
        container
        p={2}
        mt={11}
        sx={{mt:{xs:23,sm:19,md:11}}}
        alignItems="center"
        justifyContent={"space-between"}
      >
        <Grid item>
          <TabList
            value={value}
            handleChange={handleTabChange}
            permissions={permissions}
            getTabLabel={getTabLabel}
            centered={false}
            variant="scrollable"
          />
        </Grid>
        <Grid item>
          {value === 1 && (
            <>
              <Button
                variant="contained"
                onClick={() => ReadHistory("HIST_COMM\n\r")}
                startIcon={<HiOutlineRefresh />}
                sx={{ mr: 1 }}
              >
                {loading ? "fetching..." : "Refresh Data"}
              </Button>
              <Button
                variant="outlined"
                color="error"
                sx={{ color: theme.palette.error.main, mr: 1 }}
                onClick={handleOpenDeleteHistory}
                startIcon={<FaRegTrashAlt />}
              >
                Delete history
              </Button>
              <DateRangePicker
                getDataFromChildHandler={getDataFromChildHandler}
              />
            </>
          )}
        </Grid>
      </Grid>
      <Grid container p={2}>
        <TabPanelList value={value} permissions={permissions} panels={panels} />
      </Grid>

      <footer
        style={{
          display: "flex",
          justifyContent: "center",
          background: `linear-gradient(165deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 60%)`,
          color: "#fff",
          fontSize: "15px",
          padding: "8px",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h6"> Developed by PsiBorg Technologies</Typography>
      </footer>
    </>
  );
};

export default Index;
