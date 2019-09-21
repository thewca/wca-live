import React, { useRef } from 'react';
import Downshift from 'downshift';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import Popper from '@material-ui/core/Popper';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
  popper: {
    marginTop: theme.spacing(1),
    zIndex: theme.zIndex.modal + 1,
  },
}));

const personToString = person => {
  return `${person.name} (${person.id})`;
};

const searchPersons = (persons, search) => {
  const normalizedSearch = search.trim().toLowerCase();
  return normalizedSearch.length === 0
    ? []
    : persons
        .filter(
          person =>
            person.id === normalizedSearch ||
            person.name.toLowerCase().includes(normalizedSearch)
        )
        .slice(0, 5);
};

const PersonSelect = ({ persons, value, onChange }) => {
  const classes = useStyles();
  const textFieldRef = useRef();

  const handleKeyDown = event => {
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
      onChange={person => onChange(person)}
      itemToString={item => (item ? personToString(item) : '')}
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
            autoFocus
            fullWidth
            spellCheck={false}
            variant="outlined"
            label="Competitor"
            placeholder="Type ID or name"
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
