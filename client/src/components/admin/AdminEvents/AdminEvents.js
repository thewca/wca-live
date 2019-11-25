import React from 'react';
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

import CustomQuery from '../../CustomQuery/CustomQuery';
import CustomMutation from '../../CustomMutation/CustomMutation';
import CubingIcon from '../../CubingIcon/CubingIcon';

const EVENTS_QUERY = gql`
  query Events($id: ID!) {
    competition(id: $id) {
      id
      events {
        _id
        id
        name
        rounds {
          _id
          id
          name
          open
          finished
        }
      }
    }
  }
`;

const OPEN_ROUND_MUTATION = gql`
  mutation OpenRound($competitionId: ID!, $roundId: String!) {
    openRound(competitionId: $competitionId, roundId: $roundId) {
      _id
      open
    }
  }
`;

const CLEAR_ROUND_MUTATION = gql`
  mutation ClearRound($competitionId: ID!, $roundId: String!) {
    clearRound(competitionId: $competitionId, roundId: $roundId) {
      _id
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

const AdminEvents = ({ confirm, match }) => {
  const { competitionId } = match.params;
  return (
    <CustomQuery query={EVENTS_QUERY} variables={{ id: competitionId }}>
      {({
        data: {
          competition: { events },
        },
      }) => (
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
                    {event.rounds.map((round, index) => (
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
                            <CustomMutation
                              mutation={OPEN_ROUND_MUTATION}
                              variables={{
                                competitionId,
                                roundId: round.id,
                              }}
                            >
                              {(openRound, { loading }) => (
                                <Button
                                  size="small"
                                  onClick={
                                    index > 0 &&
                                    !event.rounds[index - 1].finished
                                      ? confirm(openRound, {
                                          description: `
                                            There are some missing results in the previous round.
                                            Opening this round will permanently remove them.
                                          `,
                                        })
                                      : openRound
                                  }
                                  disabled={loading}
                                >
                                  Open
                                </Button>
                              )}
                            </CustomMutation>
                          )}
                          {roundClearable(round, event.rounds) && (
                            <CustomMutation
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
                            </CustomMutation>
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
      )}
    </CustomQuery>
  );
};

export default withConfirm(AdminEvents);
