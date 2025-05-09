import PropTypes from "prop-types";
import { Grid } from "@mui/material";

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
      style={{ width: "100%" }}
    >
      {value === index && <div>{children} </div>}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};
const TabPanelList = ({ value, permissions, panels }) => {
  return (
    <Grid container  mt={-2}>
      {panels
        ?.filter((panel) => permissions[panel.permission])
        .map((panel, index) => {
          return (
            <TabPanel
              size={12}
              key={panel.permission}
              value={value}
              index={index}
            >
              {panel.component}
            </TabPanel>
          );
        })}
    </Grid>
  );
};

export default TabPanelList;
