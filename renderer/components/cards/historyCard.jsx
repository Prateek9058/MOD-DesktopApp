import React from "react";
import { Grid } from "@mui/material";
import GraphSDCard from "./historyTemp";
import GraphSDCardHumidity from "./historyHumidity";
import CustomTableContent from "../table/table";

const CardList = ({ loading, historyArray }) => {
  return (
    <>
      <Grid container justifyContent={"space-between"} alignItems={"center"}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <GraphSDCard data={historyArray} />
          </Grid>
          <Grid item xs={12} md={6}>
            <GraphSDCardHumidity data={historyArray} />
          </Grid>
          <Grid item xs={12}>
            <CustomTableContent data={historyArray} loading={loading} />
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};

export default CardList;
