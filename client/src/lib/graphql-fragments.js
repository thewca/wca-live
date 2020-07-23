import { gql } from '@apollo/client';

// TODO: remove?
export const RESULTS_UPDATE_FRAGMENT = gql`
  fragment resultsUpdate on Round {
    results {
      _id
      ranking
      advancing
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
