import React from 'react';
import Avatar from '@material-ui/core/Avatar';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import DeleteIcon from '@material-ui/icons/Delete';

function PersonList({ people, onDelete }) {
  const sortedPeople = people.sort((person1, person2) =>
    person1.name.localeCompare(person2.name)
  );
  return (
    <List>
      {sortedPeople.map((person) => (
        <ListItem key={person.id}>
          <ListItemAvatar>
            <Avatar src={person.avatar.thumbUrl} />
          </ListItemAvatar>
          <ListItemText primary={`${person.name} (${person.id})`} />
          <ListItemSecondaryAction>
            <IconButton onClick={() => onDelete(person)}>
              <DeleteIcon />
            </IconButton>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
}

export default PersonList;
