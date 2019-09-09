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

const resultToString = result => {
  return `${result.person.name} (${result.person.id})`;
};

const searchResults = (results, search) => {
  const normalizedSearch = search.trim().toLowerCase();
  return normalizedSearch.length === 0
    ? []
    : results
        .filter(
          ({ person }) =>
            person.id === normalizedSearch ||
            person.name.toLowerCase().includes(normalizedSearch)
        )
        .slice(0, 5);
};

const ResultSelect = ({ results, value, onChange }) => {
  const classes = useStyles();
  const textFieldRef = useRef();

  return (
    <Downshift
      selectedItem={value}
      onChange={onChange}
      itemToString={item => (item ? resultToString(item) : '')}
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
            variant="outlined"
            label="Competitor"
            placeholder="Type ID or name"
            InputLabelProps={getLabelProps()}
            InputProps={getInputProps()}
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
                {searchResults(results, inputValue).map((result, index) => (
                  <MenuItem
                    {...getItemProps({
                      item: result,
                      key: result.person.id,
                      component: 'div',
                      selected: highlightedIndex === index,
                      style: {
                        fontWeight: selectedItem === result ? 500 : 400,
                      },
                    })}
                  >
                    {resultToString(result)}
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

export default ResultSelect;
