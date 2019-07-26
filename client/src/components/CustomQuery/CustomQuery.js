import React from 'react';
import { Query } from 'react-apollo';
import Icon from '@material-ui/core/Icon';
import SnackbarContent from '@material-ui/core/SnackbarContent';

import Loading from '../Loading/Loading';

/* Wrapper around Query with common error and loading logic. */
const CustomQuery = ({ children, ...props }) => (
  <Query {...props}>
    {({ loading, error, ...other }) => {
      if (error) {
        return (
          <SnackbarContent
            message={
              <span style={{ display: 'flex', alignItems: 'center' }}>
                <Icon style={{ marginRight: 8 }}>error</Icon>
                Something went wrong!
              </span>
            }
            style={{ margin: 16 }}
          />
        );
      }
      if (loading) return <Loading />;
      return children(other);
    }}
  </Query>
);

export default CustomQuery;
