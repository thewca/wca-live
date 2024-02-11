import { gql } from "@apollo/client";

export const RECORD_LIST_RECORD_FRAGMENT = gql`
  fragment records on Record {
    id
    tag
    type
    attemptResult
    result {
      id
      person {
        id
        name
        country {
          iso2
          name
        }
      }
      round {
        id
        competitionEvent {
          id
          event {
            id
            name
          }
          competition {
            id
          }
        }
      }
    }
  }
`;
