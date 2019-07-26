import React from 'react';
import { Mutation } from 'react-apollo';
import { Link } from 'react-router-dom';
import gql from 'graphql-tag';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import Grid from '@material-ui/core/Grid';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import withConfirm from 'material-ui-confirm';

import CubingIcon from '../../CubingIcon/CubingIcon';

const OPEN_ROUND_MUTATION = gql`
  mutation OpenRound($competitionId: ID!, $roundId: ID!) {
    openRound(competitionId: $competitionId, roundId: $roundId) {
      id
      open
    }
  }
`;

const CLEAR_ROUND_MUTATION = gql`
  mutation ClearRound($competitionId: ID!, $roundId: ID!) {
    clearRound(competitionId: $competitionId, roundId: $roundId) {
      id
      open
    }
  }
`;

const roundOpenable = (round, rounds) => {
  if (round.open) return false;
  const roundIndex = rounds.indexOf(round);
  if (roundIndex === 0) return true;
  return rounds[roundIndex - 1].open;
};

const roundClearable = (round, rounds) => {
  if (!round.open) return false;
  const roundIndex = rounds.indexOf(round);
  if (roundIndex === rounds.length - 1) return true;
  return !rounds[roundIndex + 1].open;
};

const AdminEvents = ({ events, competitionId, confirm }) => {
  return (
    <Grid container spacing={2} direction="row">
      {events.map(event => (
        <Grid item xs={12} md={4} key={event.id}>
          <Card style={{ height: '100%' }}>
            <CardHeader
              avatar={<CubingIcon eventId={event.id} />}
              title={event.name}
            />
            <CardContent style={{ padding: 0 }}>
              <List dense={true}>
                {event.rounds.map(round => (
                  <ListItem
                    key={round.id}
                    button
                    component={Link}
                    to={`/admin/competitions/${competitionId}/rounds/${round.id}`}
                    disabled={!round.open}
                  >
                    <ListItemText primary={round.name} />
                    <ListItemSecondaryAction>
                      {roundOpenable(round, event.rounds) && (
                        <Mutation
                          mutation={OPEN_ROUND_MUTATION}
                          variables={{
                            competitionId,
                            roundId: round.id,
                          }}
                        >
                          {(openRound, { loading }) => (
                            <Button
                              size="small"
                              onClick={openRound}
                              disabled={loading}
                            >
                              Open
                            </Button>
                          )}
                        </Mutation>
                      )}
                      {roundClearable(round, event.rounds) && (
                        <Mutation
                          mutation={CLEAR_ROUND_MUTATION}
                          variables={{
                            competitionId,
                            roundId: round.id,
                          }}
                        >
                          {(clearRound, { loading }) => (
                            <Button
                              size="small"
                              onClick={confirm(clearRound, {
                                description: `
                                  This will irreversibly remove all results
                                  from ${event.name} - ${round.name}.
                                `,
                              })}
                              disabled={loading}
                            >
                              Clear
                            </Button>
                          )}
                        </Mutation>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default withConfirm(AdminEvents);
