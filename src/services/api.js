const HERO_URL = 'https://akabab.github.io/superhero-api/api/all.json';
export async function getHeroes() {
  const response = await fetch(HERO_URL);
  if (!response.ok) throw new Error('Unable to load the superhero database. Please try again.');
  return response.json();
}
export async function getWeather(city) {
  const geoResponse = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  if (!geoResponse.ok) throw new Error('City lookup failed.');
  const geo = await geoResponse.json();
  if (!geo.results?.length) throw new Error(`No location found for "${city}".`);
  const place = geo.results[0];
  const weatherResponse = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${place.latitude}&longitude=${place.longitude}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto`);
  if (!weatherResponse.ok) throw new Error('Weather lookup failed.');
  const weather = await weatherResponse.json();
  return { ...weather.current, location: `${place.name}${place.admin1 ? `, ${place.admin1}` : ''}`, unit: weather.current_units?.temperature_2m ?? '°F' };
}
export function describeWeather(code) {
  if (code === 0) return 'Clear skies';
  if ([1,2,3].includes(code)) return 'Partly cloudy';
  if ([45,48].includes(code)) return 'Foggy';
  if ([51,53,55,56,57].includes(code)) return 'Drizzle';
  if ([61,63,65,66,67,80,81,82].includes(code)) return 'Rain';
  if ([71,73,75,77,85,86].includes(code)) return 'Snow';
  if ([95,96,99].includes(code)) return 'Thunderstorms';
  return 'Conditions unavailable';
}

export async function geocodeCity(city) {
  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`);
  if (!response.ok) throw new Error('Map location lookup failed');
  const data = await response.json();
  if (!data.results?.length) throw new Error(`City not found: ${city}`);
  const { latitude, longitude, name, admin1, country } = data.results[0];
  return { lat: latitude, lng: longitude, label: [name, admin1, country].filter(Boolean).join(', ') };
}
