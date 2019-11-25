import React from 'react';
import { Query } from 'react-apollo';

import Loading from '../Loading/Loading';
import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';

/* Wrapper around Query with common error and loading logic. */
const CustomQuery = ({ children, ...props }) => (
  /* Note: cache-and-network is a good default in our case as we always want
     to show the up-to-data, but using cache for faster  */
  <Query {...props} fetchPolicy="cache-and-network">
    {(...args) => {
      const [{ loading, error, data }] = args;
      if (error) return <ErrorSnackbar message="Something went wrong 😔" />;
      if (loading && !data) return <Loading />;
      /* If there is any data already, render it while indicating loading. */
      return (
        <React.Fragment>
          {loading && <Loading />}
          {children(...args)}
        </React.Fragment>
      );
    }}
  </Query>
);

export default CustomQuery;
