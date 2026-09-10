export const categories = ["ENVIRONMENT", "EDUCATION", "COMMUNITY", "DIGITAL", "SOCIAL"] as const;
export const difficulties = ["EASY", "MEDIUM", "HIGH"] as const;
export const missionTypes = ["STANDARD", "LIMITED", "SPONSORED"] as const;

export type Category = (typeof categories)[number];
export type Difficulty = (typeof difficulties)[number];
export type MissionType = (typeof missionTypes)[number];
