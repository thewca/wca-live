import { useState, useEffect, useRef, createRef } from "react";
import { gql, useMutation } from "@apollo/client";
import {
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  List,
  ListItemButton,
  ListItemText,
  TextField
} from "@mui/material";
import { ADMIN_ROUND_RESULT_FRAGMENT } from "./fragments";
import useApolloErrorHandler from "../../../hooks/useApolloErrorHandler";
import { orderBy } from "../../../lib/utils";
import { useAutocomplete } from "@mui/base/useAutocomplete";

const REMOVE_NO_SHOWS_FROM_ROUND_MUTATION = gql`
  mutation RemoveNoShowsFromRound($input: RemoveNoShowsFromRoundInput!) {
    removeNoShowsFromRound(input: $input) {
      round {
        id
        results {
          id
          ...adminRoundResult
        }
      }
    }
  }
  ${ADMIN_ROUND_RESULT_FRAGMENT}
`;

function QuitNoShowsDialog({ open, onClose, roundId, results }) {
  const apolloErrorHandler = useApolloErrorHandler();
  const [selectedPersons, setSelectedPersons] = useState([]);
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [inputValue, setInputValue] = useState("");

  const noShowPersons = orderBy(
    results
      .filter((result) => result.attempts.length === 0)
      .map((result) => result.person),
    (person) => person.name
  );

  const textFieldRef = useRef(null);
  const personRefs = useRef(noShowPersons.map(createRef));

  const [removeNoShowsFromRound, { loading: mutationLoading }] = useMutation(
    REMOVE_NO_SHOWS_FROM_ROUND_MUTATION,
    {
      variables: {
        input: {
          roundId,
          personIds: selectedPersons.map(person => person.registrantId),
        },
      },
      onCompleted: handleClose,
      onError: apolloErrorHandler,
    }
  );

  const {
    getInputProps,
    getListboxProps,
    getOptionProps,
    setAnchorEl,
  } = useAutocomplete({
    options: noShowPersons,
    getOptionLabel: labelPerson, 
    onInputChange: (event, newInputValue) => setInputValue(newInputValue),
  });

  useEffect(() => {
    if (focusedIndex !== null && personRefs.current[focusedIndex]) {
      personRefs.current[focusedIndex].current?.focus();
    }
    if (focusedIndex === null) {
      setAnchorEl.current?.focus();
    }
  }, [focusedIndex]);

  useEffect(() => {
    const selectedIndex = noShowPersons.findIndex(
      (person) => inputValue === person.registrantId.toString()
    );
    
    if (selectedIndex !== -1 && personRefs.current[selectedIndex]) {
      personRefs.current[selectedIndex].current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [inputValue, noShowPersons]);

  function onListItemClick(newPerson) {
    setSelectedPersons((prevSelectedPersonIds) => [
      ...prevSelectedPersonIds,
      newPerson,
    ]);
    setInputValue("");
    setFocusedIndex(null);
    textFieldRef.current?.focus();
  };

  function handleDelete(personToDelete) {
    setSelectedPersons((prev) => prev.filter((person) => person !== personToDelete));
  };

  function handleSearch() {
    const matchIndex = noShowPersons
      .filter((person) => !selectedPersons.includes(person))
      .findIndex((person) => person.registrantId.toString() === inputValue);

    if (matchIndex !== -1) {
      setFocusedIndex(matchIndex);
    }
  };

  function handleKeyDown(e) {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  function handleClose() {
    setSelectedPersons([]);
    onClose();
  }

  function labelPerson(person) {
    return person ? `${person.name} (${person.registrantId})` : '';
  }

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Quit no-shows</DialogTitle>
      <DialogContent>
        {noShowPersons.length > 0 ? (
          <Grid container direction="column" spacing={2}>
            <Grid item>
              <DialogContentText>
                Here you can quickly select and quit competitors that did not
                show up.
              </DialogContentText>
            </Grid>
            <Grid item>
              <TextField
                {...getInputProps()}
                placeholder="Search..."
                variant="outlined"
                inputRef={(ref) => {
                  textFieldRef.current = ref;
                  setAnchorEl(ref);
                }}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                fullWidth
              />

              <div style={{ marginBottom: "10px" }}>
                {selectedPersons.map((person, index) => (
                  <Chip
                    key={index}
                    label={labelPerson(person)}
                    onDelete={() => handleDelete(person)}
                    style={{ margin: "4px" }}
                  />
                ))}
              </div>

              <List {...getListboxProps()} style={{ maxHeight: 200, overflowY: "auto" }}>
                {noShowPersons
                  .filter((person) => !selectedPersons.includes(person))
                  .map((person, index) => (
                    <ListItemButton 
                      {...getOptionProps({ person, index })} 
                      key={index} 
                      onClick={() => onListItemClick(person)} 
                      selected={inputValue === person.registrantId.toString()}             
                      ref={personRefs.current[index]}
                      tabIndex={focusedIndex === index ? 0 : -1}
                    >
                      <ListItemText primary={labelPerson(person)} />
                    </ListItemButton>
                  ))}
              </List>
            </Grid>
          </Grid>
        ) : (
          <DialogContentText>{`All results are entered.`}</DialogContentText>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          onClick={() => removeNoShowsFromRound()}
          color="primary"
          disabled={selectedPersons.length === 0 || mutationLoading}
        >
          Quit
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default QuitNoShowsDialog;
