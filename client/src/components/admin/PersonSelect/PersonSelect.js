import React, { useRef } from 'react';
import Downshift from 'downshift';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import TextField from '@material-ui/core/TextField';

import { uniq, toInt } from '../../../lib/utils';

const useStyles = makeStyles((theme) => ({
  popper: {
    marginTop: theme.spacing(1),
    zIndex: theme.zIndex.modal + 1,
  },
}));

const personToString = (person) => {
  return `${person.name} (${person.registrantId})`;
};

const searchPersons = (persons, search) => {
  const normalizedSearch = search.trim().toLowerCase();
  if (normalizedSearch.length === 0) return [];
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
};

const PersonSelect = ({
  persons,
  value,
  onChange,
  clearOnChange = false,
  TextFieldProps = {},
}) => {
  const classes = useStyles();
  const textFieldRef = useRef();

  const handleKeyDown = (event) => {
    /* Mimic enter behavior on tab press. */
    if (event.key === 'Tab') {
      event.preventDefault();
      const newEvent = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
        key: 'Enter',
      });
      event.target.dispatchEvent(newEvent);
    }
  };

  return (
    <Downshift
      selectedItem={value}
      onChange={(person, { clearSelection }) => {
        if (clearOnChange) {
          clearSelection();
        }
        onChange(person);
      }}
      itemToString={(item) => (item ? personToString(item) : '')}
      defaultHighlightedIndex={0}
    >
      {({
        getInputProps,
        getItemProps,
        getLabelProps,
        getMenuProps,
        highlightedIndex,
        inputValue,
        isOpen,
        selectedItem,
      }) => (
        <div>
          <TextField
            spellCheck={false}
            variant="outlined"
            label="Competitor"
            placeholder="Type ID or name"
            {...TextFieldProps}
            InputLabelProps={getLabelProps()}
            InputProps={getInputProps({ onKeyDown: handleKeyDown })}
            ref={textFieldRef}
          />
          <Popper
            keepMounted
            open={isOpen}
            anchorEl={textFieldRef.current}
            className={classes.popper}
          >
            <div {...getMenuProps({}, { suppressRefError: true })}>
              <Paper
                square
                style={{
                  width: textFieldRef.current
                    ? textFieldRef.current.clientWidth
                    : undefined,
                }}
              >
                {searchPersons(persons, inputValue).map((person, index) => (
                  <MenuItem
                    {...getItemProps({
                      item: person,
                      key: person.id,
                      component: 'div',
                      selected: highlightedIndex === index,
                      style: {
                        fontWeight: selectedItem === person ? 500 : 400,
                      },
                    })}
                  >
                    {personToString(person)}
                  </MenuItem>
                ))}
              </Paper>
            </div>
          </Popper>
        </div>
      )}
    </Downshift>
  );
};

export default PersonSelect;
