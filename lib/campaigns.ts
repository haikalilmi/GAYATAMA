import { sql } from "./db";

export interface CampaignProgress {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  target_metric_key: string | null;
  target_value: number | null;
  current: number;
  participants: number;
  actions: number;
  demo_reward_pool: number | null;
}

export interface CampaignDetail extends CampaignProgress {
  organization_name: string | null;
  missions: { title: string; slug: string; status: string }[];
}

export async function getCampaignBySlug(slug: string): Promise<CampaignDetail | null> {
  const row = await sql<{
    id: string; name: string; slug: string; description: string | null;
    target_metric_key: string | null; target_value: number | null;
    demo_reward_pool: number | null; organization_name: string | null;
  }>(
    `SELECT c.id, c.name, c.slug, c.description, c.target_metric_key, c.target_value,
            c.demo_reward_pool, o.name AS organization_name
     FROM campaigns c LEFT JOIN organizations o ON o.id = c.organization_id WHERE c.slug = ?`,
    slug
  ).get();
  if (!row) return null;
  const base = (await getCampaigns()).find((c) => c.id === row.id);
  const missions = await sql<CampaignDetail["missions"][0]>(
    "SELECT title, slug, status FROM missions WHERE campaign_id = ? ORDER BY title",
    row.id
  ).all();
  return {
    id: row.id, name: row.name, slug: row.slug, description: row.description,
    target_metric_key: row.target_metric_key, target_value: row.target_value,
    current: base?.current ?? 0, participants: base?.participants ?? 0, actions: base?.actions ?? 0,
    demo_reward_pool: row.demo_reward_pool,
    organization_name: row.organization_name,
    missions: missions.map((m) => ({ ...m })),
  };
}

export async function getCampaigns(): Promise<CampaignProgress[]> {
  const rows = await sql<{
    id: string; name: string; slug: string; description: string | null;
    target_metric_key: string | null; target_value: number | null; demo_reward_pool: number | null;
  }>(
    `SELECT id, name, slug, description, target_metric_key, target_value, demo_reward_pool
     FROM campaigns ORDER BY created_at`
  ).all();
  const results: CampaignProgress[] = [];
  for (const c of rows) {
    const missions = await sql<{ id: string }>(
      "SELECT id FROM missions WHERE campaign_id = ?",
      c.id
    ).all();
    const mids = missions.map((m) => m.id);
    let current = 0;
    let actions = 0;
    let participants = 0;
    if (mids.length > 0) {
      const ph = mids.map((_, i) => `$${i + 2}`).join(",");
      const currentRow = await sql<{ v: number | null }>(
        `SELECT SUM(si.verified_value) AS v FROM submission_impacts si
             JOIN submissions s ON s.id = si.submission_id
             JOIN mission_metrics mm ON mm.id = si.mission_metric_id
             WHERE s.status = 'APPROVED' AND si.verified_value IS NOT NULL
             AND mm.metric_key = $1 AND s.mission_id IN (${ph})`,
        c.target_metric_key, ...mids
      ).get();
      current = Number(currentRow?.v ?? 0);

      const actionsRow = await sql<{ c: number }>(
        `SELECT COUNT(*) AS c FROM submissions WHERE status = 'APPROVED' AND mission_id IN (${mids.map((_, i) => `$${i + 1}`).join(",")})`,
        ...mids
      ).get();
      actions = Number(actionsRow?.c ?? 0);

      const partRow = await sql<{ c: number }>(
        `SELECT COUNT(DISTINCT user_id) AS c FROM participations WHERE status = 'APPROVED' AND mission_id IN (${mids.map((_, i) => `$${i + 1}`).join(",")})`,
        ...mids
      ).get();
      participants = Number(partRow?.c ?? 0);
    }
    results.push({
      id: c.id, name: c.name, slug: c.slug, description: c.description,
      target_metric_key: c.target_metric_key, target_value: c.target_value,
      current, participants, actions, demo_reward_pool: c.demo_reward_pool,
    });
  }
  return results;
}
