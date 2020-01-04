import React, { useState, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import Fade from '@material-ui/core/Fade';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import SearchIcon from '@material-ui/icons/Search';
import NearMeIcon from '@material-ui/icons/NearMe';

import CompetitionSelect from '../CompetitionSelect/CompetitionSelect';
import {
  geolocationAvailable,
  nearestCompetition,
} from '../../logic/geolocation';

const HomeToolbar = ({ upcoming, inProgress, past }) => {
  const [searchOpen, setSearchOpen] = useState(false);
  const history = useHistory();
  const searchInputRef = useRef(null);

  return (
    <Grid container alignItems="center" justify="flex-end" spacing={1}>
      {inProgress.length > 0 && geolocationAvailable && (
        <Grid item>
          <Tooltip title="Find nearest competition" placement="top">
            <IconButton
              onClick={() => {
                nearestCompetition(inProgress).then(competition => {
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
            <CompetitionSelect
              competitions={[...inProgress, ...upcoming, ...past]}
              onChange={competition =>
                history.push(`/competitions/${competition.id}`)
              }
              TextFieldProps={{
                fullWidth: true,
                placeholder: 'Search',
                variant: 'outlined',
                size: 'small',
                inputRef: searchInputRef,
                onBlur: () => setSearchOpen(false),
              }}
            />
          </div>
        </Fade>
      </Grid>
    </Grid>
  );
};

export default HomeToolbar;
