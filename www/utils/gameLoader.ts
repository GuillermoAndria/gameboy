const GAME_LIBRARY = [
  "pokemon-yellow.gb",
] as const;

type GameName = typeof GAME_LIBRARY[number];

function isValidGame(game: string): game is GameName {
  return (GAME_LIBRARY as readonly string[]).includes(game);
}

function normalizeGameName(game: string): string {
  const validExtensions = [".gb", ".gbc"];

  if (validExtensions.some((ext) => game.endsWith(ext))) {
    return game;
  }

  const candidates = [
    `${game}.gbc`,
    `${game}.gb`,
  ];

  for (const candidate of candidates) {
    if (isValidGame(candidate)) return candidate;
  }

  return game;
}

function getGameFromUrl(): GameName | null {
  if (typeof self === "undefined" || !self.location) return null;

  const urlParams = new URLSearchParams(self.location.search);
  const requestedGame = urlParams.get("game");

  if (!requestedGame) return null;

  const normalizedGame = normalizeGameName(requestedGame);
  return isValidGame(normalizedGame) ? normalizedGame : null;
}

function getRandomGame(): GameName {
  return GAME_LIBRARY[Math.floor(Math.random() * GAME_LIBRARY.length)];
}

export function getGameToLoad(): GameName {
  return getGameFromUrl() ?? getRandomGame();
}

export function getCurrentGame(): GameName | null {
  return getGameFromUrl();
}

export async function fetchRom(game: GameName): Promise<Uint8Array> {
  const response = await fetch(`/roms/${game}`);

  if (!response.ok) {
    throw new Error(`Failed to fetch ${game}`);
  }

  return new Uint8Array(await response.arrayBuffer());
}

const GAME_TITLES: Record<GameName, string> = {
  "pokemon-yellow.gb": "Pokémon Yellow",
};

export function formatGameName(game: string): string {
  if (isValidGame(game)) return GAME_TITLES[game];

  return game
    .replace(/\.gb[c]?$/, "")
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export const GAME_OPTIONS = GAME_LIBRARY
  .map((game) => ({
    value: game,
    label: formatGameName(game),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

export { GAME_LIBRARY, isValidGame };
export type { GameName };
