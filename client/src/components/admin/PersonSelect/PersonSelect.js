import React from 'react';
import { TextField } from '@mui/material';
import { Autocomplete } from '@mui/material';
import { uniq, toInt } from '../../../lib/utils';

function personToLabel(person) {
  return `${person.name} (${person.registrantId})`;
}

function searchPersons(persons, search) {
  const normalizedSearch = search.trim().toLowerCase();
  if (!normalizedSearch) return persons;
  const matchingId = persons.find(
    (person) => person.registrantId === toInt(normalizedSearch)
  );
  if (matchingId) return [matchingId];
  const matchingNameStart = persons.filter((person) =>
    person.name.toLowerCase().startsWith(normalizedSearch)
  );
  const matchingName = persons.filter((person) =>
    person.name.toLowerCase().includes(normalizedSearch)
  );
  return uniq([...matchingNameStart, ...matchingName]).slice(0, 5);
}

function PersonSelect({ persons, value, onChange, TextFieldProps = {} }) {
  function handleChange(event, value, reason) {
    if (reason === 'selectOption') {
      onChange(value);
    }
  }

  return (
    <Autocomplete
      options={persons}
      getOptionLabel={personToLabel}
      value={value}
      onChange={handleChange}
      forcePopupIcon={false}
      disableClearable={true}
      autoHighlight={true}
      filterOptions={(persons, { inputValue }) =>
        searchPersons(persons, inputValue)
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label="Competitor"
          spellCheck={false}
          placeholder="Type ID or name"
          {...TextFieldProps}
          inputProps={{
            ...params.inputProps,
            ...(TextFieldProps.inputProps || {}),
          }}
        />
      )}
    />
  );
}

export default PersonSelect;
