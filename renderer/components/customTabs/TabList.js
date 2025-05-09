import { Tabs, Tab } from "@mui/material";
const TabList = ({
  value,
  handleChange,
  permissions,
  getTabLabel,
  centered,
  variant,
  sx,
}) => {
  return (
    <Tabs
      value={value}
      onChange={handleChange}
      centered={centered}
      aria-label="scrollable force tabs example"
    >
      {Object.keys(permissions).map((permission, index) => {
        if (permissions[permission]) {
          return (
            <Tab sx={sx} key={permission} label={getTabLabel(permission)} />
          );
        }
        return null;
      })}
    </Tabs>
  );
};

export default TabList;
