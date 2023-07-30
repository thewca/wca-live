import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Fade, Grid, IconButton, Tooltip } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import NearMeIcon from "@mui/icons-material/NearMe";

import CompetitionSearch from "../CompetitionSearch/CompetitionSearch";
import { geolocationAvailable } from "../../lib/geolocation";
import { nearestCompetition } from "../../lib/competition";

function HomeToolbar({ inProgress }) {
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  return (
    <Grid container alignItems="center" justifyContent="flex-end" spacing={1}>
      {inProgress.length > 0 && geolocationAvailable && (
        <Grid item>
          <Tooltip title="Find nearest competition" placement="top">
            <IconButton
              onClick={() => {
                nearestCompetition(inProgress).then((competition) => {
                  navigate(`/competitions/${competition.id}`);
                });
              }}
              aria-label="Nearest competition"
              size="large"
            >
              <NearMeIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      )}
      <Grid item>
        <Tooltip title="Search competitions" placement="top">
          <IconButton onClick={() => setSearchOpen(!searchOpen)} size="large">
            <SearchIcon />
          </IconButton>
        </Tooltip>
      </Grid>
      <Grid item>
        <Fade
          in={searchOpen}
          onEntered={() => searchInputRef.current.focus()}
          unmountOnExit
        >
          <div>
            <CompetitionSearch
              onChange={(competition) =>
                navigate(`/competitions/${competition.id}`)
              }
              TextFieldProps={{
                fullWidth: true,
                placeholder: "Search",
                variant: "outlined",
                size: "small",
                inputRef: searchInputRef,
                onBlur: () => setSearchOpen(false),
                style: { width: 250 },
              }}
            />
          </div>
        </Fade>
      </Grid>
    </Grid>
  );
}

export default HomeToolbar;
