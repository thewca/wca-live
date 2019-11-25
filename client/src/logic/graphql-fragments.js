import gql from 'graphql-tag';

export const RESULTS_UPDATE_FRAGMENT = gql`
  fragment resultsUpdate on Round {
    results {
      _id
      ranking
      advancable
      attempts
      best
      average
      person {
        _id
      }
      recordTags {
        single
        average
      }
    }
  }
`;

export const COMPETITION_INFO_FRAGMENT = gql`
  fragment competitionInfo on Competition {
    id
    name
    schedule {
      startDate
      endDate
    }
    countries {
      iso2
    }
  }
`;
