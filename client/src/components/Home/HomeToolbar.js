import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { Fade, Grid, IconButton, Tooltip } from '@material-ui/core';
import SearchIcon from '@material-ui/icons/Search';
import NearMeIcon from '@material-ui/icons/NearMe';

import CompetitionSearch from '../CompetitionSearch/CompetitionSearch';
import { geolocationAvailable } from '../../lib/geolocation';
import { nearestCompetition } from '../../lib/competition';

function HomeToolbar({ upcoming, inProgress, past }) {
  const history = useHistory();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchInputRef = useRef(null);

  return (
    <Grid container alignItems="center" justify="flex-end" spacing={1}>
      {inProgress.length > 0 && geolocationAvailable && (
        <Grid item>
          <Tooltip title="Find nearest competition" placement="top">
            <IconButton
              onClick={() => {
                nearestCompetition(inProgress).then((competition) => {
                  history.push(`/competitions/${competition.id}`);
                });
              }}
              aria-label="Nearest competition"
            >
              <NearMeIcon />
            </IconButton>
          </Tooltip>
        </Grid>
      )}
      <Grid item>
        <Tooltip title="Search competitions" placement="top">
          <IconButton onClick={() => setSearchOpen(!searchOpen)}>
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
                history.push(`/competitions/${competition.id}`)
              }
              TextFieldProps={{
                fullWidth: true,
                placeholder: 'Search',
                variant: 'outlined',
                size: 'small',
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
