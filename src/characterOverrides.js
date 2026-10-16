
/*
 * HeroWatch Character Overrides
 *
 * Exclude characters that do not belong
 * in the Marvel/DC database.
 *
 * Include characters whose publisher
 * is incorrectly classified by the API.
 */

// Character IDs to exclude
export const excludedCharacterIds = [
  78, // Ben 10
];

// Character names to exclude
export const excludedCharacterNames = [
  "captain planet",
  "kevin 11",
];

// Publisher corrections
export const publisherOverrides = {
  644: "DC Comics", // Superman
};

/*
 * Clean and filter the superhero API data
 */
export function cleanHeroData(heroes) {
  return heroes
    .filter(hero => {
      const name = hero.name.trim().toLowerCase();

      return (
        !excludedCharacterIds.includes(hero.id) &&
        !excludedCharacterNames.includes(name)
      );
    })
    .map(hero => {
      const correctedPublisher =
        publisherOverrides[hero.id];

      if (!correctedPublisher) {
        return hero;
      }

      return {
        ...hero,
        biography: {
          ...hero.biography,
          publisher: correctedPublisher,
        },
      };
    })
    .filter(hero =>
      ["Marvel Comics", "DC Comics"].includes(
        hero.biography?.publisher
      )
    );
}
