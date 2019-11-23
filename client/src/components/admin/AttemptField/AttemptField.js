import React from 'react';

import FmField from './FmField/FmField';
import MbldField from './MbldField/MbldField';
import TimeField from './TimeField/TimeField';

/**
   Note on how attempt editing works

   The idea behind an attempt field is that it gets initialValue,
   allows editing it in any way without interruptions (like a draft value)
   and triggers onValue once editing is finished (blur event).
   This requires keeping both the current value (attempts in ResultForm)
   and a draft value (local copy of the current value).
   Whenever initialValue changes we want to synchronize the local draft value,
   which fits into getDerivedStateFromProps lifecycle method.
   (most straightforward way would be using useEffect to keep them in sync,
   but this performs unnecessary re-rendering with old initial value and leads to jumpy UI)
   https://reactjs.org/blog/2018/06/07/you-probably-dont-need-derived-state.html
   The above article describes alternatives, but none seems good enough in our case:
   - keeping the draft value in the parent component sounds like a bad idea,
   because it's already complex enough and as there are many attempt field types
   it's best to keep them as isolated black boxes
   - using the key prop is a better option, but it remounts the given input element,
   which may lead to undesired "tab" key behaviour
   (clicking "tab" blurs one input, which may affect the next input value
   and remounting it as a consequence, in that case we lose focus)

   Using getDerivedStateFromProps sounds justified in this case.
   Hooks equivalent is described here https://reactjs.org/docs/hooks-faq.html#how-do-i-implement-getderivedstatefromprops.
*/

const AttemptField = ({ eventId, ...props }) => {
  if (eventId === '333fm') {
    return <FmField {...props} />;
  }
  if (eventId === '333mbf') {
    return <MbldField {...props} />;
  }
  return <TimeField {...props} />;
};

export default AttemptField;
