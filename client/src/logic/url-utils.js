const production = process.env.NODE_ENV === 'production';

const WCA_ORIGIN = production
  ? 'https://www.worldcubeassociation.org'
  : 'https://staging.worldcubeassociation.org';

const GROUPIFIER_ORIGIN = 'https://groupifier.jonatanklosko.com';

export const wcaUrl = path => {
  return `${WCA_ORIGIN}${path}`;
};

export const groupifierUrl = path => {
  const query = production ? '' : '?staging=true';
  return `${GROUPIFIER_ORIGIN}${path}${query}`;
};
