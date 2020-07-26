export function parseActivityCode(activityCode) {
  if (activityCode.startsWith('other-')) {
    return {
      type: 'other',
      id: activityCode.replace(/^other-/, ''),
    };
  } else {
    const match = activityCode.match(
      /^(\w+)(?:-r(\d+))?(?:-g(\d+))?(?:-a(\d+))?$/
    );
    if (!match) {
      throw new Error(`Invalid activity code: '${activityCode}'.`);
    }
    const [, e, r, g, a] = match;
    return {
      type: 'official',
      eventId: e,
      roundNumber: r ? parseInt(r, 10) : null,
      groupNumber: g ? parseInt(g, 10) : null,
      attemptNumber: a ? parseInt(a, 10) : null,
    };
  }
}
