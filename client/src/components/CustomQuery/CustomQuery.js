import React from 'react';
import { Query } from 'react-apollo';

import Loading from '../Loading/Loading';
import ErrorSnackbar from '../ErrorSnackbar/ErrorSnackbar';

/* Wrapper around Query with common error and loading logic. */
const CustomQuery = ({ children, ...props }) => (
  <Query {...props}>
    {(...args) => {
      const [{ loading, error }] = args;
      if (error) return <ErrorSnackbar message="Something went wrong 😔" />;
      if (loading) return <Loading />;
      return children(...args);
    }}
  </Query>
);

export default CustomQuery;
