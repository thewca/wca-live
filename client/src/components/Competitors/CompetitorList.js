import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import {
  Grid,
  IconButton,
  InputBase,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Paper,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import SearchIcon from '@material-ui/icons/Search';
import FlagIcon from '../FlagIcon/FlagIcon';

const useStyles = makeStyles((theme) => ({
  searchBox: {
    padding: '2px 2px 2px 16px',
    display: 'inline-block',
  },
  fullWidth: {
    width: '100%',
  },
}));

function searchCompetitors(competitors, search) {
  const searchParts = search.toLowerCase().split(/\s+/);
  return competitors.filter((competitor) =>
    searchParts.every((part) => competitor.name.toLowerCase().includes(part))
  );
}

function CompetitorList({ competitors, competitionId }) {
  const classes = useStyles();
  const [search, setSearch] = useState('');

  const filteredCompetitors = searchCompetitors(
    competitors,
    search
  ).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Grid container direction="column" alignItems="center" spacing={1}>
      <Grid item>
        <Paper className={classes.searchBox}>
          <InputBase
            autoFocus
            value={search}
            placeholder="Search competitor"
            onChange={(event) => setSearch(event.target.value)}
          />
          <IconButton disabled>
            <SearchIcon />
          </IconButton>
        </Paper>
      </Grid>
      <Grid item className={classes.fullWidth}>
        <List>
          {filteredCompetitors.map((competitor) => (
            <ListItem
              key={competitor.id}
              button
              component={RouterLink}
              to={`/competitions/${competitionId}/competitors/${competitor.id}`}
            >
              <ListItemIcon>
                <FlagIcon
                  code={competitor.country.iso2.toLowerCase()}
                  size="lg"
                />
              </ListItemIcon>
              <ListItemText primary={competitor.name} />
            </ListItem>
          ))}
        </List>
      </Grid>
    </Grid>
  );
}

export default CompetitorList;
