import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Box, List, Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';

import Error from '../Error/Error';
import Loading from '../Loading/Loading';
import ImportableCompetitionListItem from './ImportableCompetitionListItem';
import { orderBy } from '../../lib/utils';

const IMPORTABLE_COMPETITIONS_QUERY = gql`
  query ImportableCompetitions {
    importableCompetitions {
      wcaId
      name
      startDate
      endDate
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxHeight: 300,
    overflowY: 'auto',
  },
}));

function ImportableCompetitionList() {
  const classes = useStyles();

  const { data, loading, error } = useQuery(IMPORTABLE_COMPETITIONS_QUERY);

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { importableCompetitions } = data;

  const sortedImportableCompetitions = orderBy(importableCompetitions, [
    (competition) => competition.startDate,
    (competition) => competition.endDate,
  ]);

  if (sortedImportableCompetitions.length === 0) {
    return (
      <Box p={2} pt={0}>
        <Typography variant="body2">
          You have no importable competitions.
        </Typography>
      </Box>
    );
  }

  return (
    <List dense={true} disablePadding className={classes.root}>
      {sortedImportableCompetitions.map((competition) => (
        <ImportableCompetitionListItem
          key={competition.wcaId}
          competition={competition}
        />
      ))}
    </List>
  );
}

export default ImportableCompetitionList;
