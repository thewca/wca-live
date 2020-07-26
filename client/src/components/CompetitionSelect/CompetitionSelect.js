import React from 'react';
import Autocomplete from '@material-ui/lab/Autocomplete';
import TextField from '@material-ui/core/TextField';

function searchCompetitions(competitions, search) {
  const normalizedSearch = search.trim().toLowerCase();
  if (normalizedSearch.length === 0) return [];
  const matchingName = competitions.filter((competition) =>
    normalizedSearch
      .split(/\s+/)
      .every((part) => competition.name.toLowerCase().includes(part))
  );
  return matchingName.slice(0, 5);
}

function CompetitionSelect({
  competitions,
  value = null,
  onChange,
  TextFieldProps = {},
}) {
  return (
    <Autocomplete
      freeSolo
      options={competitions}
      getOptionLabel={(competition) => competition.name}
      renderInput={(props) => <TextField {...props} {...TextFieldProps} />}
      autoHighlight
      filterOptions={(options, state) =>
        searchCompetitions(options, state.inputValue)
      }
      value={value}
      onChange={(event, competition) => onChange(competition)}
      closeIcon={null}
      style={{ width: 250 }}
    />
  );
}

export default CompetitionSelect;
