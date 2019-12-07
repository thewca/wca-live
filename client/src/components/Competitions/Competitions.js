import React, { Fragment, useState } from 'react';

import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import CompetitionList from '../CompetitionList/CompetitionList';

const Competitions = ({ past, inProgress, upcoming }) => {
  const [tabValue, setTabValue] = useState(
    inProgress.length > 0 ? 'inProgress' : 'upcoming'
  );
  const competitions = { past, inProgress, upcoming }[tabValue];

  return (
    <Fragment>
      <Tabs
        value={tabValue}
        onChange={(event, value) => setTabValue(value)}
        variant="fullWidth"
      >
        <Tab label="Upcoming" value="upcoming" />
        {inProgress.length > 0 && <Tab label="Right now" value="inProgress" />}
        {past.length > 0 && <Tab label="Past" value="past" />}
      </Tabs>
      <CompetitionList competitions={competitions} />
    </Fragment>
  );
};

export default Competitions;
