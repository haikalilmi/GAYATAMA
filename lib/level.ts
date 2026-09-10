export type LevelTitle =
  | "Explorer"
  | "Contributor"
  | "Advocate"
  | "Changemaker"
  | "Impact Leader";

export function calculateLevel(totalXp: number): {
  level: number;
  title: LevelTitle;
} {
  if (totalXp >= 3500) return { level: 5, title: "Impact Leader" };
  if (totalXp >= 2000) return { level: 4, title: "Changemaker" };
  if (totalXp >= 1200) return { level: 3, title: "Advocate" };
  if (totalXp >= 500) return { level: 2, title: "Contributor" };
  return { level: 1, title: "Explorer" };
}
