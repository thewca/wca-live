import { useParams } from 'react-router-dom';
import { gql, useQuery } from '@apollo/client';
import { Grid, Typography } from '@mui/material';
import wcaLogo from './wca-logo.svg';
import Loading from '../Loading/Loading';
import Error from '../Error/Error';
import FlagIcon from '../FlagIcon/FlagIcon';
import CompetitorResults from '../CompetitorResults/CompetitorResults';
import { wcaUrl } from '../../lib/urls';

const COMPETITOR_QUERY = gql`
  query Competitor($id: ID!) {
    person(id: $id) {
      id
      name
      wcaId
      country {
        iso2
      }
      results {
        id
        ranking
        advancing
        attempts {
          result
        }
        best
        average
        singleRecordTag
        averageRecordTag
        round {
          id
          name
          number
          competitionEvent {
            id
            event {
              id
              name
              rank
            }
          }
          format {
            id
            numberOfAttempts
            sortBy
          }
        }
      }
    }
  }
`;

function Competitor() {
  const { competitionId, competitorId } = useParams();

  const { data, loading, error } = useQuery(COMPETITOR_QUERY, {
    variables: { id: competitorId },
  });

  if (loading && !data) return <Loading />;
  if (error) return <Error error={error} />;
  const { person } = data;

  return (
    <>
      <Grid container alignContent="center" sx={{ mb: 2 }}>
        <Grid item>
          <Typography variant="h5">
            {person.name} <FlagIcon code={person.country.iso2.toLowerCase()} />
          </Typography>
        </Grid>
        <Grid item sx={{ flexGrow: 1 }} />
        {person.wcaId && (
          <Grid item>
            <a
              href={wcaUrl(`/persons/${person.wcaId}`)}
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={wcaLogo} alt="WCA Profile" height="32" width="32" />
            </a>
          </Grid>
        )}
      </Grid>
      <CompetitorResults
        results={person.results}
        competitionId={competitionId}
      />
    </>
  );
}

export default Competitor;
