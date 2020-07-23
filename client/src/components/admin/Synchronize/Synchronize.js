import React from 'react';
import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams } from 'react-router-dom';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import TimeAgo from 'react-timeago';
import EditIcon from '@material-ui/icons/Edit';
import PersonAddIcon from '@material-ui/icons/PersonAdd';
import { parseISO } from 'date-fns';

import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import {
  wcaUrl,
  groupifierUrl,
  scramblesMatcherUrl,
} from '../../../lib/url-utils';

const COMPETITION_QUERY = gql`
  query Competition($id: ID!) {
    competition(id: $id) {
      id
      wcaId
      synchronizedAt
    }
  }
`;

const SYNCHRONIZE_MUTATION = gql`
  mutation Synchronize($input: SynchronizeInput!) {
    synchronizeCompetition(input: $input) {
      competition {
        id
        synchronizedAt
      }
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  description: {
    maxWidth: '60%',
  },
}));

const Synchronize = () => {
  const classes = useStyles();
  const { competitionId } = useParams();
  const [
    synchronize,
    { loading: synchronizeLoading, error: synchronizeError },
  ] = useMutation(SYNCHRONIZE_MUTATION, {
    variables: { input: { id: competitionId } },
  });
  const { data, loading, error } = useQuery(COMPETITION_QUERY, {
    variables: { id: competitionId },
  });
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { competition } = data;

  return (
    <Grid container direction="column" alignItems="center" spacing={1}>
      <Grid item>
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={synchronize}
          disabled={synchronizeLoading}
        >
          Synchronize
        </Button>
        {synchronizeError && <ErrorSnackbar error={synchronizeError} />}
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
};

export default Synchronize;
