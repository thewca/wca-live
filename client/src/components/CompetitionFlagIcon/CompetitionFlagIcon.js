import React from 'react';
import PublicIcon from '@mui/icons-material/Public';
import FlagIcon from '../FlagIcon/FlagIcon';
import { competitionCountries } from '../../lib/competition';

function CompetitionFlagIcon({ competition }) {
  const countries = competitionCountries(competition);

  if (countries.length === 1) {
    const [country] = countries;
    return <FlagIcon code={country.iso2.toLowerCase()} size="lg" />;
  } else {
    return <PublicIcon />;
  }
}

export default CompetitionFlagIcon;
