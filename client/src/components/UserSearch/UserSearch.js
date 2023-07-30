import { useState } from 'react';
import { useQuery, gql } from '@apollo/client';
import { TextField } from '@mui/material';
import { Autocomplete } from '@mui/material';
import useDebounce from '../../hooks/useDebounce';

const USERS = gql`
  query Users($filter: String!) {
    users(filter: $filter) {
      id
      name
    }
  }
`;

const DEBOUNCE_MS = 250;

function UserSearch({ onChange, TextFieldProps = {} }) {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);

  const { data, loading } = useQuery(USERS, {
    variables: { filter: debouncedSearch },
  });

  const users = data ? data.users : [];

  function handleInputChange(event, value, reason) {
    if (reason === 'input') {
      setSearch(value);
    }
  }

  function handleChange(event, user, reason) {
    if (reason === 'selectOption') {
      onChange(user);
    }
  }

  return (
    <Autocomplete
      clearOnBlur
      blurOnSelect
      options={users}
      getOptionLabel={(user) => user.name}
      loading={loading}
      onInputChange={handleInputChange}
      value={null}
      onChange={handleChange}
      renderInput={(params) => <TextField {...params} {...TextFieldProps} />}
    />
  );
}

export default UserSearch;
