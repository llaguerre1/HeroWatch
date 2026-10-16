# HeroWatch — Superhero Database & Mission Control

HeroWatch is a superhero database and mission tracker I built using React and Vite. The idea was to make something that looks like a superhero command center where you can search for Marvel and DC characters, look at their abilities, keep track of your favorites, and assign them to missions.

I also wanted the site to have a futuristic look, so I went with a dark background, light blue HUD styling, and a slowly rotating wireframe globe.

The missions are fictional, but the cities, map locations, and weather information are real.

## What You Can Do

### Search for Superheroes

The database pulls character information from the Akabab Superhero API.

You can:
- Search for a character by name.
- Filter characters by Marvel or DC.
- Filter by power stats and minimum scores.
- Use the Next and Previous buttons to browse through the characters, with 36 shown per page.
- Open a character's profile to see more information.
- Add characters to your tracked heroes list.

Some characters in the API are listed under the wrong publisher or don't belong in the Marvel/DC database. I added a separate `characterOverrides.js` file so I can fix those issues without having to change the main app every time.

### Track Heroes

You can add heroes to your personal roster and remove them whenever you want.

The tracked heroes are saved in your browser, so refreshing the page won't erase your list.

### Create Missions

Mission Control lets you choose a tracked hero, assign them to a real-world city, and create a fictional patrol mission.

Once a mission is created, its location appears on the map. Marvel missions have red markers, and DC missions have blue markers.

You can click a marker to view the mission location. The map also has a day/night overlay that shows which parts of the world are currently in daylight or darkness.

You can manage and complete missions from the dashboard.

### Check the Weather

The weather section uses Open-Meteo to show real weather conditions for mission cities.

When you select a different mission location, the weather display updates for that city.

### Use It on Different Screen Sizes

I worked on making the layout usable on desktop, phones, and tablets.

The sidebar changes into a menu on smaller screens, and the cards, filters, and map adjust to fit.

I tested the mobile layout using the iPhone 16 and iPad Mini options in Chrome DevTools.

## Tools and Technologies

| Technology | What I Used It For |
|---|---|
| React | Building the interface and managing components |
| JavaScript | Search, filtering, missions, and application logic |
| Vite | Running the project locally and building it |
| CSS | Layout, colors, responsiveness, and animations |
| Lucide React | Icons throughout the dashboard |
| React Leaflet and Leaflet | Displaying the interactive map |
| OpenStreetMap | Map tiles |
| localStorage | Saving tracked heroes and missions |

## APIs

I used three main APIs for the project.

**Akabab Superhero API**

https://akabab.github.io/superhero-api/api/

This provides the superhero names, images, biographies, publisher information, and power stats.

The app loads the character list from:

`https://akabab.github.io/superhero-api/api/all.json`

**Open-Meteo Geocoding API**

https://open-meteo.com/en/docs/geocoding-api

This converts the city entered for a mission into coordinates that can be used on the map.

**Open-Meteo Forecast API**

https://open-meteo.com/en/docs

This provides the weather information for the selected city.

These APIs don't require an API key for the way I'm using them in this project, but they do require an internet connection.

## How to Run the Project

You'll need Node.js and npm installed.

First, download or clone the project and open the `herowatch` folder in a terminal.

Install the dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Vite will give you a local address, usually:

`http://localhost:5173/`

Open that address in your browser.

To check the production build, run:

```bash
npm run build
```

You can also preview the production version with:

```bash
npm run preview
```

## How the Project Is Organized

Most of the main application state is handled in `App.jsx`. This includes the hero database, tracked heroes, missions, search filters, and page navigation.

I separated some of the features into their own components to keep the main file more manageable.

```text
src/
├── components/
│   ├── DayNightOverlay.jsx
│   ├── HeroCard.jsx
│   ├── HeroMap.jsx
│   ├── WeatherWidget.jsx
│   └── WireFrameGlobe.jsx
├── services/
├── App.jsx
├── characterOverrides.js
├── main.jsx
└── style.css
```

Here's how the main parts work together:

- `App.jsx` handles the main state and connects the different features.
- `HeroCard.jsx` displays individual superhero cards.
- `HeroMap.jsx` displays mission locations and map markers.
- `DayNightOverlay.jsx` handles the sunlight overlay on the map.
- `WeatherWidget.jsx` gets the weather for a selected city.
- `WireFrameGlobe.jsx` displays the rotating globe on the dashboard.
- `characterOverrides.js` handles corrections to the superhero data.

The original component wireframe is saved in `docs/wireframe.svg`.

## React State and Props

I used React state to keep track of things like the current search, selected hero, tracked heroes, missions, and filters.

The main app passes information down to components through props. When something changes, such as clicking a track button or selecting a mission, the component uses a callback to update the state in `App.jsx`.

For example, clicking the track button on a hero card updates the tracked heroes list. Creating a mission adds it to the missions state, and selecting a mission can change which city the weather widget displays.

I used `localStorage` to save tracked heroes and missions between visits.

## Project Plan

I originally planned the project around a 72-hour hackathon schedule.

**Day 1:** Plan the layout, create the wireframe, set up React and Vite, and start building the interface.

**Day 2:** Connect the superhero and weather APIs, add tracked heroes, and build Mission Control.

**Day 3:** Test the features, work on responsive layouts, finish documentation, and prepare the project for deployment.

As I worked on the project, I also added pagination, power filters, character data corrections, the day/night map overlay, and the rotating globe.

## Things to Keep in Mind

There are a few limitations with the current version:

- The superhero API isn't perfect, so some character information may be incorrect. I've added overrides for issues I've found.
- The app needs an internet connection to load character data, weather, and map tiles.
- If two cities have the same name, the geocoding API might choose a different one than intended.
- Missions and tracked heroes are saved in the browser, not in an online account. Someone using the site on another device will have their own saved data.
- Mission locations are fictional assignments, not actual superhero locations.

## Deployment

Once the project is finished and the production build passes, I plan to upload it to GitHub and deploy it using Vercel.

The expected build settings are:

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

## Final Notes

This project gave me practice working with React components, state, props, API requests, filtering data, saving information locally, and making a responsive layout.

One of the bigger challenges was dealing with inconsistent superhero data. I also spent time getting the interactive map and mobile layout to work the way I wanted.

HeroWatch is an educational fan project. The superhero characters and images belong to their respective owners, and the project isn't affiliated with Marvel or DC.