import React from "react";
import { Grid, TableBody, TableCell, TableRow } from "@mui/material";
import PropTypes from "prop-types";
// skeleten loading
import Skeleton from "@mui/material/Skeleton";
// skeleten loading
const EnhancedTableToolbar = (props) => {};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number.isRequired,
};

const TableSkeleton = ({ rowNumber, tableCell, showOption }) => {
  return (
    <>
      {rowNumber &&
        rowNumber?.length > 0 &&
        rowNumber?.map((row, index) => {
          return (
            <TableRow
              key={index}
              hover
              tabIndex={-1}
              sx={{
                "&:last-child td, &:last-child th": { border: 0 },
                width: "100%",
              }}
            >
              {tableCell &&
                tableCell?.length > 0 &&
                tableCell?.map((a, i) => (
                  <TableCell
                    component="th"
                    scope="row"
                    key={i + 1}
                    align={
                      i === 0
                        ? "left"
                        : i === a.length - 1
                        ? "center"
                        : "center"
                    }
                    sx={{ width: a }}
                  >
                    <Grid
                      container
                      justifyContent={
                        i === 0
                          ? "left"
                          : i === a.length - 1
                          ? "center"
                          : "center"
                      }
                    >
                      <Skeleton
                        variant="text"
                        sx={{
                          fontSize: "1rem",
                          width: "50%",
                          height: "40%",
                          padding: "5px",
                        }}
                      />
                    </Grid>
                  </TableCell>
                ))}

              {showOption && (
                <TableCell
                  component="th"
                  scope="row"
                  padding="none"
                  className="greycolortypo"
                  width={showOption?.[0]}
                >
                  <Grid
                    container
                    justifyContent={"space-evenly"}
                    width={"100px"}
                  >
                    {showOption.map((a, b) => (
                      <Grid item xs={4} key={b}>
                        {" "}
                        <Skeleton
                          variant="circular"
                          width={"30px"}
                          height={"30px"}
                          sx={{ fontSize: "1rem" }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </TableCell>
              )}
            </TableRow>
          );
        })}
    </>
  );
};

export default TableSkeleton;
