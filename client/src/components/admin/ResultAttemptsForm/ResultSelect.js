import React, { useMemo } from 'react';
import PersonSelect from '../PersonSelect/PersonSelect';

function ResultSelect({ results, value, onChange, TextFieldProps = {} }) {
  const persons = useMemo(() => {
    return results.map((result) => result.person);
  }, [results]);

  return (
    <PersonSelect
      persons={persons}
      value={
        value ? persons.find((person) => person.id === value.person.id) : null
      }
      onChange={(person) => {
        onChange(
          person
            ? results.find((result) => result.person.id === person.id)
            : null
        );
      }}
      TextFieldProps={TextFieldProps}
    />
  );
}

export default ResultSelect;
