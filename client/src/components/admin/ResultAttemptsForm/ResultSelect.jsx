import { useMemo } from "react";
import PersonSelect from "../PersonSelect/PersonSelect";

function ResultSelect({
  results,
  value,
  onChange,
  multiple = false,
  TextFieldProps = {},
}) {
  const persons = useMemo(() => {
    return results
      .map((result) => result.person)
      .sort((p1, p2) => p1.name.localeCompare(p2.name));
  }, [results]);

  return (
    <PersonSelect
      multiple={multiple}
      persons={persons}
      value={
        multiple
          ? value.map((result) => result.person)
          : value
            ? value.person
            : null
      }
      onChange={(value) => {
        onChange(
          multiple
            ? value.map((person) =>
                results.find((result) => result.person.id === person.id),
              )
            : value
              ? results.find((result) => result.person.id === value.id)
              : null,
        );
      }}
      TextFieldProps={TextFieldProps}
    />
  );
}

export default ResultSelect;
