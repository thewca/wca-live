import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { useParams } from 'react-router-dom';
import {
  Grid,
  Link,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Typography,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import EditIcon from '@material-ui/icons/Edit';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import TimeAgo from 'react-timeago';
import { parseISO } from 'date-fns';
import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import { wcaUrl, groupifierUrl, scramblesMatcherUrl } from '../../../lib/urls';
import SynchronizeButton from './SynchronizeButton';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      wcaId
      synchronizedAt
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  description: {
    maxWidth: '60%',
  },
}));

function Synchronization() {
  const classes = useStyles();
  const { competitionId } = useParams();

  const { data, loading, error } = useQuery(COMPETITION_QUERY, {
    variables: { id: competitionId },
  });

  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { competition } = data;

  return (
    <Grid container direction="column" alignItems="center" spacing={1}>
      <Grid item>
        <SynchronizeButton competitionId={competition.id} />
      </Grid>
      <Grid item>
        <Typography variant="caption" component="div" align="center">
          Last synchronized{' '}
          <TimeAgo date={parseISO(competition.synchronizedAt)} />.
        </Typography>
      </Grid>
      <Grid item className={classes.description}>
        <Typography align="justify">
          {`
            We use competition information from the WCA website.
            If you want to add competitors or change round information,
            you need to make those changes on the WCA website,
            and then click the "Synchronize" button above.
          `}
        </Typography>
      </Grid>
      <Grid item>
        <List>
          <ListItem
            button
            component="a"
            href={wcaUrl(
              `/competitions/${competition.wcaId}/registrations/add`
            )}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ListItemIcon>
              <PersonAddIcon />
            </ListItemIcon>
            <ListItemText>Add competitor</ListItemText>
          </ListItem>
          <ListItem
            button
            component="a"
            href={wcaUrl(`/competitions/${competition.wcaId}/events/edit`)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <ListItemIcon>
              <EditIcon />
            </ListItemIcon>
            <ListItemText>Change round data</ListItemText>
          </ListItem>
        </List>
      </Grid>
      <Grid item className={classes.description}>
        <Typography align="justify">
          {`To manage competitor groups and print scorecards you can use `}
          <Link
            href={groupifierUrl(`/competitions/${competition.wcaId}`)}
            target="_blank"
          >
            Groupifier
          </Link>
          {`. After the competition, please use `}
          <Link href={scramblesMatcherUrl()} target="_blank">
            Scrambles Matcher
          </Link>
          {` to attach scrambles to rounds and proceed with results posting.`}
          {` Always make sure to "Synchronize" first, so the tools see the entered results.`}
        </Typography>
      </Grid>
    </Grid>
  );
}

export default Synchronization;
