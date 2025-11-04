import { useState, useEffect, useRef, useMemo } from "react";
import { Button, Grid, Tooltip, Typography } from "@mui/material";
import KeyboardIcon from "@mui/icons-material/Keyboard";
import { useConfirm } from "material-ui-confirm";
import AttemptResultField from "../AttemptResultField/AttemptResultField";
import useKeyNavigation from "./useKeyNavigation";
import ResultSelect from "./ResultSelect";
import { setAt, times } from "../../../lib/utils";
import {
  trimTrailingSkipped,
  meetsCutoff,
  formatAttemptResult,
  attemptResultsWarning,
  applyTimeLimit,
  applyCutoff,
  best,
  average,
} from "../../../lib/attempt-result";
import { formatCutoff, formatTimeLimit } from "../../../lib/formatters";
import {
  shouldComputeAverage,
  paddedAttemptResults,
} from "../../../lib/result";

function ResultAttemptsForm({
  result,
  results,
  onResultChange,
  eventId,
  format,
  timeLimit,
  cutoff,
  onSubmit,
  disabled = false,
  focusOnResultChange = false,
  officialWorldRecords,
}) {
  const confirm = useConfirm();

  const { numberOfAttempts } = format;

  const defaultAttemptResults = useMemo(() => {
    return times(numberOfAttempts, () => 0);
  }, [numberOfAttempts]);

  const [attemptResults, setAttemptResults] = useState(defaultAttemptResults);

  const rootRef = useRef(null);

  useKeyNavigation(rootRef);

  useEffect(() => {
    setAttemptResults(
      result
        ? paddedAttemptResults(result, numberOfAttempts)
        : defaultAttemptResults,
    );
  }, [result, numberOfAttempts, defaultAttemptResults]);

  useEffect(() => {
    if (!focusOnResultChange) return;

    const [resultInput, firstAttemptInput] =
      rootRef.current.getElementsByTagName("input");

    if (result) {
      // Wait for the above useEffect to set attempt result values
      // and then select the given field.
      setTimeout(() => {
        firstAttemptInput.focus();
        firstAttemptInput.select();
      }, 0);
    } else {
      resultInput.focus();
    }
  }, [result, focusOnResultChange]);

  const disabledFromIndex = meetsCutoff(attemptResults, cutoff)
    ? numberOfAttempts
    : cutoff.numberOfAttempts;

  function handleAttemptResultChange(index, value) {
    const newAttemptResults = setAt(attemptResults, index, value);
    setAttemptResults(
      applyCutoff(applyTimeLimit(newAttemptResults, timeLimit), cutoff),
    );
  }

  function handleSubmitClick() {
    confirmSubmission().then(() => {
      const attempts = trimTrailingSkipped(attemptResults).map((result) => ({
        result,
      }));
      onSubmit(attempts);
    });
  }

  function confirmSubmission() {
    const submissionWarning = attemptResultsWarning(
      attemptResults,
      eventId,
      officialWorldRecords,
    );

    if (submissionWarning) {
      return confirm({
        ...submissionWarning,
        confirmationText: "Submit",
        confirmationKeywordTextFieldProps: {
          sx: { mt: 2 },
          autoComplete: "off",
        },
      });
    } else {
      return Promise.resolve();
    }
  }

  return (
    <Grid container direction="column" spacing={1} ref={rootRef}>
      <Grid item>
        <Typography variant="body2">
          Time limit: {formatTimeLimit(timeLimit, eventId)}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="body2">
          Cutoff: {formatCutoff(cutoff, eventId)}
        </Typography>
      </Grid>
      <Grid item sx={{ my: 2 }}>
        <ResultSelect
          results={results}
          value={result}
          onChange={onResultChange}
          TextFieldProps={{
            autoFocus: true,
            fullWidth: true,
            variant: "outlined",
            inputProps: { "data-type": "result-select" },
          }}
        />
      </Grid>
      {attemptResults.map((attemptResult, index) => (
        <Grid item key={index}>
          <AttemptResultField
            eventId={eventId}
            label={`Attempt ${index + 1}`}
            disabled={!result || disabled || index >= disabledFromIndex}
            value={attemptResult}
            onChange={(value) => handleAttemptResultChange(index, value)}
            TextFieldProps={{
              fullWidth: true,
              variant: "outlined",
              inputProps: { "data-type": "attempt-result" },
            }}
          />
        </Grid>
      ))}
      <Grid item container>
        <Grid item xs>
          <Typography variant="body2">
            Best: {formatAttemptResult(best(attemptResults), eventId)}
          </Typography>
        </Grid>
        {shouldComputeAverage(eventId, format.numberOfAttempts) && (
          <Grid item xs>
            <Typography variant="body2">
              Average:{" "}
              {formatAttemptResult(average(attemptResults, eventId), eventId)}
            </Typography>
          </Grid>
        )}
      </Grid>
      <Grid item>
        {result?.enteredBy && (
          <Typography variant="body2" color="textSecondary">
            {`Updated by: ${result.enteredBy.name}`}
          </Typography>
        )}
      </Grid>
      <Grid item container alignItems="flex-end">
        <Grid item>
          <Button
            type="submit"
            variant="outlined"
            color="primary"
            disabled={!result || disabled}
            onClick={handleSubmitClick}
          >
            Submit
          </Button>
        </Grid>
        <Grid item sx={{ flexGrow: 1 }} />
        <Grid item>
          <Tooltip
            title={
              <div>
                Key bindings:
                <div>{`/ or d or # - DNF`}</div>
                <div>{`* or s - DNS`}</div>
                <div>{`Up, Down, Enter - navigation`}</div>
                <div>{`Space - jump to competitor field`}</div>
              </div>
            }
          >
            <KeyboardIcon sx={{ verticalAlign: "middle" }} color="action" />
          </Tooltip>
        </Grid>
      </Grid>
    </Grid>
  );
}

export default ResultAttemptsForm;
