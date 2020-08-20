import React, { useState } from 'react';
import { Tab, Tabs } from '@material-ui/core';
import CompetitionList from '../CompetitionList/CompetitionList';

function HomeCompetitions({ past, inProgress, upcoming }) {
  const [tabValue, setTabValue] = useState(
    inProgress.length > 0 ? 'inProgress' : 'upcoming'
  );
  const competitions = { past, inProgress, upcoming }[tabValue];

  function handleTabChange(event, value) {
    setTabValue(value);
  }

  return (
    <>
      <Tabs value={tabValue} onChange={handleTabChange} variant="fullWidth">
        <Tab label="Upcoming" value="upcoming" />
        {inProgress.length > 0 && <Tab label="Right now" value="inProgress" />}
        {past.length > 0 && <Tab label="Past month" value="past" />}
      </Tabs>
      <CompetitionList competitions={competitions} />
    </>
  );
}

export default HomeCompetitions;
