import React from 'react';
import gql from 'graphql-tag';
import { useQuery } from 'react-apollo';

import Loading from '../../Loading/Loading';
import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import AdminSignIn from '../AdminSignIn/AdminSignIn';
import AdminDashboard from '../AdminDashboard/AdminDashboard';
import { COMPETITION_INFO_FRAGMENT } from '../../../logic/graphql-fragments';

const ADMIN_QUERY = gql`
  query Competitions {
    me {
      id
      name
      avatar {
        thumbUrl
      }
      manageableCompetitions {
        ...competitionInfo
      }
      importableCompetitions {
        ...competitionInfo
      }
    }
  }
  ${COMPETITION_INFO_FRAGMENT}
`;

const Admin = () => {
  const { data, loading, error } = useQuery(ADMIN_QUERY);
  if (loading && !data) return <Loading />;
  if (error) return <ErrorSnackbar />;
  const { me } = data;
  return me ? <AdminDashboard me={me} /> : <AdminSignIn />;
};

export default Admin;
