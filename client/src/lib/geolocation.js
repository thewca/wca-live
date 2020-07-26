import { sortBy } from './utils';

/* Source https://www.movable-type.co.uk/scripts/latlong.html#equirectangular */
function distanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; /* km */
  const x = toRadians(lon2 - lon1) * Math.cos(toRadians(lat1 + lat2) / 2);
  const y = toRadians(lat2 - lat1);
  return Math.sqrt(x * x + y * y) * R;
}

function toRadians(degrees) {
  return (degrees * Math.PI) / 180;
}

export function nearestCompetition(competitions) {
  return new Promise((resolve, reject) => {
    const options = {
      /* Prevent the browser from asking the user to turn on GPS, we just need an estimate. */
      maximumAge: 5 * 60 * 1000,
    };
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const [nearest] = sortBy(competitions, (competition) => {
          const distances = competition.venues.map((venue) =>
            distanceKm(latitude, longitude, venue.latitude, venue.longitude)
          );
          return Math.min(...distances);
        });
        resolve(nearest);
      },
      reject,
      options
    );
  });
}

export const geolocationAvailable = 'geolocation' in navigator;
