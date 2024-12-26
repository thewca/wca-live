import { useState } from "react";
import { useQuery, gql } from "@apollo/client";
import Autocomplete from "@mui/material/Autocomplete";
import { TextField } from "@mui/material";
import useDebounce from "../../hooks/useDebounce";

const COMPETITIONS = gql`
  query Competitions($filter: String!) {
    competitions(filter: $filter, limit: 10) {
      id
      name
    }
  }
`;

const DEBOUNCE_MS = 250;

function CompetitionSearch({ value = null, onChange, TextFieldProps = {} }) {
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, DEBOUNCE_MS);

  const { data, loading } = useQuery(COMPETITIONS, {
    variables: { filter: debouncedSearch },
  });

  const competitions = data ? data.competitions : [];

  function handleInputChange(event, value, reason) {
    if (reason === "input") {
      setSearch(value);
    }
  }

  function handleChange(event, competition, reason) {
    if (reason === "selectOption") {
      onChange(competition);
    }
  }

  return (
    <Autocomplete
      clearOnBlur
      blurOnSelect
      options={competitions}
      getOptionLabel={(competition) => competition.name}
      loading={loading}
      onInputChange={handleInputChange}
      value={value}
      onChange={handleChange}
      forcePopupIcon={false}
      disableClearable={true}
      renderInput={(params) => <TextField {...params} {...TextFieldProps} />}
      filterOptions={(options) => options}
    />
  );
}

export default CompetitionSearch;
