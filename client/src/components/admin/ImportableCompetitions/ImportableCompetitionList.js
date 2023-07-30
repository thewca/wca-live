import { gql, useQuery } from '@apollo/client';
import List from '@mui/material/List';

import Error from '../../Error/Error';
import Loading from '../../Loading/Loading';
import ImportableCompetitionListItem from './ImportableCompetitionListItem';

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

function ImportableCompetitionList() {
  const { data, loading, error } = useQuery(IMPORTABLE_COMPETITIONS_QUERY);

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { importableCompetitions } = data;

  return (
    <List
      dense={true}
      disablePadding
      sx={{
        width: '100%',
        maxHeight: 240,
        overflowY: 'auto',
      }}
    >
      {importableCompetitions.map((competition) => (
        <ImportableCompetitionListItem
          key={competition.wcaId}
          competition={competition}
        />
      ))}
    </List>
  );
}

export default ImportableCompetitionList;
