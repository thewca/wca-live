import React from 'react';
import Downshift from 'downshift';
import { makeStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import Paper from '@material-ui/core/Paper';
import TextField from '@material-ui/core/TextField';

const useStyles = makeStyles(theme => ({
  container: {
    position: 'relative',
  },
  paper: {
    position: 'absolute',
    left: 0,
    right: 0,
    marginTop: theme.spacing(1),
    zIndex: 10,
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
        <div className={classes.container}>
          <TextField
            autoFocus
            fullWidth
            variant="outlined"
            label="Competitor"
            placeholder="Type ID or name"
            InputLabelProps={getLabelProps()}
            InputProps={getInputProps()}
          />
          <div {...getMenuProps()}>
            {isOpen && (
              <Paper className={classes.paper} square>
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
            )}
          </div>
        </div>
      )}
    </Downshift>
  );
};

export default ResultSelect;
