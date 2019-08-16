import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import Icon from '@material-ui/core/Icon';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import { makeStyles } from '@material-ui/core/styles';

import FlagIcon from '../FlagIcon/FlagIcon';

const useStyles = makeStyles(theme => ({
  searchBox: {
    padding: '2px 2px 2px 16px',
    display: 'inline-block',
  },
  fullWidth: {
    width: '100%',
  },
}));

const CompetitorList = ({ competitors, competitionId }) => {
  const classes = useStyles();
  const [filter, setFilter] = useState('');

  const filteredCompetitors = competitors
    .filter(({ name }) =>
      filter
        .split(/\s+/)
        .every(part => name.toLowerCase().includes(part.toLowerCase()))
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Grid container direction="column" alignItems="center" spacing={1}>
      <Grid item>
        <Paper className={classes.searchBox}>
          <InputBase
            autoFocus
            value={filter}
            placeholder="Search competitor"
            onChange={event => setFilter(event.target.value)}
          />
          <IconButton disabled>
            <Icon>search</Icon>
          </IconButton>
        </Paper>
      </Grid>
      <Grid item className={classes.fullWidth}>
        <List>
          {filteredCompetitors.map(competitor => (
            <ListItem
              key={competitor.id}
              button
              component={Link}
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
};

export default CompetitorList;
