import React from 'react';
import { Query } from 'react-apollo';

import Loading from '../Loading/Loading';
import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';

/* Wrapper around Query with common error and loading logic. */
const CustomQuery = ({ children, ...props }) => (
  /* Note: network-only means that a query never reads initial data from the cache.
     This ensures that people always get fresh data. Apollo defaults to cache-first
     but there are several issues with caching:
     - event/round/competitor ids are not globally unique, which breaks the cache
     - some actions introduce many changes to data, which makes updating cache unconvenient
       (e.g. opening a round clears missing results from previous round, so we'd need to
       load all the results from previous round in order for the cache to update automatically) */
  <Query {...props} fetchPolicy="network-only">
    {(...args) => {
      const [{ loading, error }] = args;
      if (error) return <ErrorSnackbar message="Something went wrong 😔" />;
      if (loading) return <Loading />;
      return children(...args);
    }}
  </Query>
);

export default CustomQuery;
