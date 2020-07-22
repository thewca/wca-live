import React from 'react';
import { gql, useQuery } from '@apollo/client';

import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import AdminSignIn from '../AdminSignIn/AdminSignIn';
import AdminDashboard from '../AdminDashboard/AdminDashboard';
import { COMPETITION_INFO_FRAGMENT } from '../../../lib/graphql-fragments';

const ADMIN_QUERY = gql`
  query Admin {
    currentUser {
      id
      name
      avatar {
        thumbUrl
      }
      staffMembers {
        id
        competition {
          id
          name
          startDate
          endDate
          venues {
            id
            country {
              iso2
            }
          }
        }
      }
    }
  }
`;

const Admin = () => {
  const { data, loading, error } = useQuery(ADMIN_QUERY);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { currentUser } = data;
  return currentUser ? (
    <AdminDashboard currentUser={currentUser} />
  ) : (
    <AdminSignIn />
  );
};

export default Admin;
