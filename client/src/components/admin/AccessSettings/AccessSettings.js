import React, { useState } from 'react';
import { gql, useMutation } from '@apollo/client';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';

import ErrorSnackbar from '../../ErrorSnackbar/ErrorSnackbar';
import PersonSelect from '../PersonSelect/PersonSelect';
import PersonList from '../PersonList/PersonList';

const UPDATE_ACCESS_SETTINGS_MUTATION = gql`
  mutation UpdateAccessSettings(
    $competitionId: ID!
    $accessSettings: AccessSettingsInput!
  ) {
    updateAccessSettings(
      competitionId: $competitionId
      accessSettings: $accessSettings
    ) {
      id
      scoretakers {
        id
      }
      passwordAuthEnabled
    }
  }
`;

const useStyles = makeStyles((theme) => ({
  fullWidth: {
    width: '100%',
  },
}));

const AccessSettings = ({ competition }) => {
  const classes = useStyles();
  const scoretakerIds = competition.scoretakers.map((person) => person.id);
  const [scoretakers, setScoretakers] = useState(
    competition.competitors.filter((person) =>
      scoretakerIds.includes(person.id)
    )
  );
  const [passwordAuthEnabled, setPasswordAuthEnabled] = useState(
    competition.passwordAuthEnabled
  );
  const [password, setPassword] = useState('');

  const passwordValid = () => {
    if (competition.passwordAuthEnabled) {
      if (0 < password.length && password.length < 8) return false;
    } else {
      if (passwordAuthEnabled && password.length < 8) return false;
    }
    return true;
  };

  const [updateAccessSettings, { error, loading }] = useMutation(
    UPDATE_ACCESS_SETTINGS_MUTATION,
    {
      variables: {
        competitionId: competition.id,
        accessSettings: {
          scoretakerIds: scoretakers.map((person) => person.id),
          passwordAuthEnabled,
          password,
        },
      },
      onCompleted: () => setPassword(''),
    }
  );

  return (
    <Grid container direction="column" spacing={1}>
      <Grid item>
        <Typography variant="h5" gutterBottom>
          Competition access
        </Typography>
        <Typography>
          {`Delegates and organizers have admin access to the competition.
            Additionally, you can grant people scoretaking access
            using either of the options below (or both).`}
        </Typography>
      </Grid>
      <Grid item className={classes.fullWidth}>
        <Typography variant="h6">Scoretaker list</Typography>
        <Typography gutterBottom>
          {`Authorize specific people to do scoretaking tasks.
            They just need to sign in using their WCA account.`}
        </Typography>
        <PersonSelect
          persons={competition.competitors.filter(
            (person) => !scoretakers.includes(person)
          )}
          value={null}
          onChange={(person) => setScoretakers([...scoretakers, person])}
          clearOnChange
          TextFieldProps={{ label: 'Add person', fullWidth: true }}
        />
        <Box mt={1}>
          <PersonList
            people={scoretakers}
            onDelete={(person) =>
              setScoretakers(
                scoretakers.filter((scoretaker) => scoretaker !== person)
              )
            }
          />
        </Box>
      </Grid>
      <Grid item>
        <Typography variant="h6">Password</Typography>
        <Typography>
          {`You can set a password to allow accountless scoretaking access
            to anyone who knows it.
            We recommend the above option as it provides more granularity.`}
        </Typography>
        <Box my={1}>
          <FormControlLabel
            control={
              <Checkbox
                checked={passwordAuthEnabled}
                onChange={(event) => {
                  const { checked } = event.target;
                  if (!checked) setPassword('');
                  setPasswordAuthEnabled(checked);
                }}
              />
            }
            label="Password authentication enabled"
          />
        </Box>
        <TextField
          variant="outlined"
          type="password"
          label={competition.passwordAuthEnabled ? 'New password' : 'Password'}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          disabled={!passwordAuthEnabled}
          helperText={!passwordValid() ? 'Must have at least 8 character' : ' '}
        />
      </Grid>
      <Grid item style={{ marginTop: 16 }}>
        <Button
          variant="contained"
          color="primary"
          onClick={updateAccessSettings}
          disabled={loading || !passwordValid()}
        >
          Save
        </Button>
        {error && <ErrorSnackbar error={error} />}
      </Grid>
    </Grid>
  );
};

export default AccessSettings;
