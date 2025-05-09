import { contextBridge, ipcRenderer } from "electron";

const handler = {
  listPorts() {
    return ipcRenderer.invoke("list-ports");
  },
  closePort(config) {
    return ipcRenderer.invoke("close-port", config);
  },
  openPort(config) {
    return ipcRenderer.invoke("open-port", config);
  },
  readData(config) {
    return ipcRenderer.invoke("read-data", config);
  },
  getUsbDevices() {
    return ipcRenderer.invoke("get-usb-devices");
  },
  clearData(config) {
    return ipcRenderer.invoke("clear-data", config);
  },
  setDefaultValues(config) {
    return ipcRenderer.invoke("set-default-values", config);
  },
  setCurrentTime1(config) {
    return ipcRenderer.invoke("current-time", config);
  },
  onSerialData(callback) {
    ipcRenderer.on("serial-data", (event, data) => callback(data));
    return () => ipcRenderer.removeListener("serial-data", callback);
  },
  offSerialData() {
    ipcRenderer.removeAllListeners("serial-data");
  },
  checkData1: (callback) => {
    ipcRenderer.on("check-data", (event, message) => {
      callback(message);
    });
  },
  onSerialAttach: (callback) =>
    ipcRenderer.on("serial-port-attached", (_, data) => callback(data)),
  onSerialDetach: (callback) =>
    ipcRenderer.on("serial-port-detached", (_, data) => callback(data)),
  onReceivingSD_Data(callback) {
    ipcRenderer.on("Read-SD-data", (event, data) => callback(data));
    return () => ipcRenderer.removeListener("Read-SD-data", callback);
  },
  on(channel, callback) {
    ipcRenderer.on(channel, (event, ...args) => callback(...args));
    return () => ipcRenderer.removeListener(channel, callback);
  },
  send(channel, ...args) {
    ipcRenderer.send(channel, ...args);
  },
  showNotification(title, body, type) {
    ipcRenderer.send("show-notification", { title, body, type });
  },
  reloadApp() {
    return ipcRenderer.send("reload-app");
  },
};

contextBridge.exposeInMainWorld("ipc", handler);
