import { gql, useQuery } from "@apollo/client";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../Home/Home";
import DefaultLayout from "./DefaultLayout";
import SignIn from "../SignIn/SignIn";
import About from "../About/About";
import Error from "../Error/Error";
import Loading from "../Loading/Loading";
import Account from "../Account/Account";
import MyCompetitions from "../MyCompetitions/MyCompetitions";

const CURRENT_USER_QUERY = gql`
  query CurrentUser {
    currentUser {
      id
      name
      avatar {
        thumbUrl
      }
    }
  }
`;

function DefaultNavigation() {
  const { data, error, loading } = useQuery(CURRENT_USER_QUERY);

  if (error) return <Error error={error} />;

  const loaded = !loading || !!data;
  const currentUser = data ? data.currentUser : null;

  return (
    <DefaultLayout currentUser={currentUser} loaded={loaded}>
      {loading && <Loading />}
      <Routes>
        <Route path="" element={<Home />} />
        <Route path="sign-in" element={<SignIn />} />
        <Route path="about" element={<About />} />
        {currentUser && (
          <Route path="my-competitions" element={<MyCompetitions />} />
        )}
        {currentUser && <Route path="account" element={<Account />} />}
        {/* Wait for data before redirecting as the user routes are rendered conditionally. */}
        {loaded && <Route path="*" element={<Navigate to="/" />} />}
      </Routes>
    </DefaultLayout>
  );
}

export default DefaultNavigation;
