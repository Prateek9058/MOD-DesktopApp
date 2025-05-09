import path from "path";
import { app, ipcMain, Notification } from "electron";
import serve from "electron-serve";
import { createWindow } from "./helpers";
import { SerialPort } from "serialport";
import { usb } from "usb"; // Import the 'usb' library

const isProd = process.env.NODE_ENV === "production";
let port;
let mainWindow;
let buffer = "";

if (isProd) {
  serve({ directory: "app" });
} else {
  app.setPath("userData", `${app.getPath("userData")} (development)`);
}
const showNotification = (title, body, type = "info", onClick = null) => {
  if (!Notification.isSupported()) {
    console.warn("Notifications not supported on this system");
    return;
  }
  const options = {
    title,
    body,
    icon: path.join(__dirname, `../assets/icons/${type}.png`),
    silent: false,
  };
  const notification = new Notification(options);
  notification.on("click", () => {
    if (onClick && typeof onClick === "function") {
      onClick();
    } else if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
  notification.on("close", () => {});
  notification.show();
};
// Clear the default menu
// Menu.setApplicationMenu(null);

(async () => {
  await app.whenReady();
  mainWindow = createWindow("main", {
    width: 1500,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (isProd) {
    await mainWindow.loadURL("app://./home");
  } else {
    const port = process.argv[2];
    await mainWindow.loadURL(`http://localhost:${port}/home`);
    mainWindow.webContents.openDevTools();
  }
})();

usb.on("attach", async (device) => {
  const ports = await SerialPort.list();
  mainWindow.webContents.send("serial-port-attached", ports);
});

usb.on("detach", async (device) => {
  const ports = await SerialPort.list();
  mainWindow.webContents.send("serial-port-detached", ports);
});
ipcMain.handle("list-ports", async () => {
  try {
    const ports = await SerialPort.list();
    return ports;
  } catch (error) {
    console.error("Error listing ports:", error.message);
    return { error: error.message };
  }
});
ipcMain.handle("open-port", async (event, config) => {
  const { path, baudRate } = config;
  try {
    port = new SerialPort({
      path,
      baudRate,
      autoOpen: false,
    });
    await new Promise((resolve, reject) => {
      port.open((err) => {
        if (err) {
          console.error("Failed to open port:", err.message);
          mainWindow.webContents.send(
            "serial-error",
            `Failed to open port: ${err.message}`
          );
          reject(err);
        } else {
          resolve();
        }
      });
    });
    port.on("data", (data) => {
      buffer += data.toString();
      console.log("buffer", buffer);
      try {
        let jsonData;

        if (buffer.startsWith("{LIVE} : ")) {
          const jsonStr = buffer.substring("{LIVE} : ".length).trim();
          jsonData = JSON.parse(jsonStr);
          console.log("✅ Parsed LIVE JSON:", jsonStr);
          mainWindow.webContents.send("serial-data", jsonStr);
        }
        buffer = "";
      } catch (err) {
        console.log("Waiting for complete JSON...");
      }
    });
    port.on("error", (err) => {
      mainWindow.webContents.send("serial-error", err.message);
    });
    return true;
  } catch (error) {
    console.error("Error opening port:", error);
    return false;
  }
});
ipcMain.handle("close-port", async (event, portPath) => {
  try {
    if (port && port.isOpen && port.path === portPath) {
      return new Promise((resolve, reject) => {
        port.close((err) => {
          if (err) {
            console.error("Failed to close port:", err.message);
            mainWindow.webContents.send(
              "serial-error",
              `Failed to close port: ${err.message}`
            );
            reject(false);
          } else {
            console.log("Port closed successfully");
            port = null;
            resolve({
              success: true,
              msg: `${portPath} Port is close successfully`,
            });
          }
        });
      });
    } else {
      console.log("No port is open to close.");
      return false;
    }
  } catch (error) {
    console.error("Error closing port:", error);
    mainWindow.webContents.send(
      "serial-error",
      `Error closing port: ${error.message}`
    );
    return false;
  }
});

ipcMain.handle("read-data", async (event, { data }) => {
  try {
    if (!port || !port.isOpen) {
      throw new Error("Serial port is not open");
    }
    await new Promise((resolve, reject) => {
      port.write(data, (err) => {
        if (err) {
          console.error("Error writing to serial port:", err.message);
          reject(new Error("Failed to write to serial port"));
        } else {
          console.log("Command sent to serial port111111:", data);
          resolve();
        }
      });
    });
    return new Promise((resolve, reject) => {
      let responseBuffer = "";
      const onData = (chunk) => {
        const incomingStr = chunk.toString();
        responseBuffer += incomingStr;
        console.log("Response buffer:", responseBuffer);
        const historyStart = responseBuffer.indexOf("{HISTORY} : ");
        const endMarker = responseBuffer.indexOf("{END}");
        if (
          historyStart !== -1 &&
          endMarker !== -1 &&
          endMarker > historyStart
        ) {
          const fullHistoryData = responseBuffer.substring(
            historyStart,
            endMarker
          );
          port.off("data", onData);
          event.sender.send("Read-SD-data", fullHistoryData);
          resolve(fullHistoryData);
        }
      };
      port.on("data", onData);
    });
  } catch (error) {
    console.error("Error during serial communication:", error);
    return {
      success: false,
      message: `Failed to complete operation: ${error.message}`,
    };
  }
});
ipcMain.handle("clear-data", async (event, { data }) => {
  try {
    if (!port || !port.isOpen) {
      throw new Error("Serial port is not open");
    }
    await new Promise((resolve, reject) => {
      port.write(data, (err) => {
        if (err) {
          console.error("Error writing to serial port:", err.message);
          reject(new Error("Failed to write to serial port"));
        } else {
          console.log("Command sent to serial port:", data);
          resolve();
        }
      });
    });
    return new Promise((resolve, reject) => {
      let responseBuffer1 = "";
      const onData1 = (incomingData) => {
        const chunk = incomingData.toString();
        responseBuffer1 += chunk;
        if (responseBuffer1.includes("File deleted successfully")) {
          port.off("data", onData1);
          resolve({
            success: true,
            message: "File deleted successfully",
          });
        }
      };
      port.on("data", onData1);
    });
  } catch (error) {
    console.error("Error during serial communication:", error);
    return {
      success: false,
      message: `Failed to complete operation: ${error.message}`,
    };
  }
});
ipcMain.handle("current-time", async (event, { data }) => {
  try {
    if (!port) {
      throw new Error("Serial port is not open");
    }
    await new Promise((resolve, reject) => {
      port.write(data, (err) => {
        if (err) {
          console.error("Error writing to serial port:", err.message);
          reject(new Error("Failed to write to serial port"));
        } else {
          console.log("Command sent to serial port:", data);
          resolve();
        }
      });
    });
    return new Promise((resolve, reject) => {
      let responseBuffer1 = "";
      const onData1 = (incomingData) => {
        const chunk = incomingData.toString();
        responseBuffer1 += chunk;
        console.log("responseBuffer1", responseBuffer1);
        if (responseBuffer1.includes("SET_TIME_SUCCESS")) {
          port.off("data", onData1);
          resolve({
            success: true,
            message: "Time & Date set successfully",
          });
        }
      };
      port.on("data", onData1);
    });
  } catch (error) {
    console.error("Error during serial communication:", error);
    return {
      success: false,
      message: `Failed to complete operation: ${error.message}`,
    };
  }
});
ipcMain.handle("set-default-values", async (event, { data }) => {
  try {
    if (!port || !port.isOpen) {
      throw new Error("Serial port is not open");
    }
    await new Promise((resolve, reject) => {
      port.write(data, (err) => {
        if (err) {
          console.error("Error writing to serial port:", err.message);
          reject(new Error("Failed to write to serial port"));
        } else {
          console.log("Command sent to serial port:", data);
          resolve();
        }
      });
    });
    return new Promise((resolve, reject) => {
      let responseBuffer1 = "";
      const onData1 = (incomingData) => {
        const chunk = incomingData.toString();
        responseBuffer1 += chunk;
        if (responseBuffer1.includes("DEVICE_CONFIGURED")) {
          port.off("data", onData1);
          resolve({
            success: true,
            message: "DEVICE_CONFIGURED",
          });
        }
      };
      port.on("data", onData1);
    });
  } catch (error) {
    console.error("Error during serial communication:", error);
    return {
      success: false,
      message: `Failed to complete operation: ${error.message}`,
    };
  }
});
ipcMain.on("reload-app", () => {
  if (mainWindow) {
    mainWindow.reload();
  }
});
ipcMain.on("show-notification", (event, { title, body, type }) => {
  showNotification(title, body, type);
});
