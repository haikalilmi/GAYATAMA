import { getDb } from "./db";

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

export function getCampaignBySlug(slug: string): CampaignDetail | null {
  const db = getDb();
  const row = db
    .prepare(
      `SELECT c.id, c.name, c.slug, c.description, c.target_metric_key, c.target_value,
              c.demo_reward_pool, o.name AS organization_name
       FROM campaigns c LEFT JOIN organizations o ON o.id = c.organization_id WHERE c.slug = ?`
    )
    .get(slug) as
    | {
        id: string; name: string; slug: string; description: string | null;
        target_metric_key: string | null; target_value: number | null;
        demo_reward_pool: number | null; organization_name: string | null;
      }
    | undefined;
  if (!row) return null;
  const base = getCampaigns().find((c) => c.id === row.id);
  const missions = db
    .prepare("SELECT title, slug, status FROM missions WHERE campaign_id = ? ORDER BY title")
    .all(row.id) as unknown as CampaignDetail["missions"];
  return {
    id: row.id, name: row.name, slug: row.slug, description: row.description,
    target_metric_key: row.target_metric_key, target_value: row.target_value,
    current: base?.current ?? 0, participants: base?.participants ?? 0, actions: base?.actions ?? 0,
    demo_reward_pool: row.demo_reward_pool,
    organization_name: row.organization_name,
    missions: missions.map((m) => ({ ...m })),
  };
}

export function getCampaigns(): CampaignProgress[] {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT id, name, slug, description, target_metric_key, target_value, demo_reward_pool
       FROM campaigns ORDER BY created_at`
    )
    .all() as unknown as {
    id: string; name: string; slug: string; description: string | null;
    target_metric_key: string | null; target_value: number | null; demo_reward_pool: number | null;
  }[];
  return rows.map((c) => {
    const missions = db.prepare("SELECT id FROM missions WHERE campaign_id = ?").all(c.id) as unknown as {
      id: string;
    }[];
    const mids = missions.map((m) => m.id);
    let current = 0;
    let actions = 0;
    let participants = 0;
    if (mids.length > 0) {
      const ph = mids.map(() => "?").join(",");
      current =
        (
          db
            .prepare(
              `SELECT SUM(si.verified_value) AS v FROM submission_impacts si
               JOIN submissions s ON s.id = si.submission_id
               JOIN mission_metrics mm ON mm.id = si.mission_metric_id
               WHERE s.status = 'APPROVED' AND si.verified_value IS NOT NULL
               AND mm.metric_key = ? AND s.mission_id IN (${ph})`
            )
            .get(c.target_metric_key, ...mids) as { v: number | null }
        ).v ?? 0;
      actions = (
        db.prepare(`SELECT COUNT(*) AS c FROM submissions WHERE status = 'APPROVED' AND mission_id IN (${ph})`).get(...mids) as {
          c: number;
        }
      ).c;
      participants = (
        db.prepare(
          `SELECT COUNT(DISTINCT user_id) AS c FROM participations WHERE status = 'APPROVED' AND mission_id IN (${ph})`
        ).get(...mids) as { c: number }
      ).c;
    }
    return {
      id: c.id, name: c.name, slug: c.slug, description: c.description,
      target_metric_key: c.target_metric_key, target_value: c.target_value,
      current, participants, actions, demo_reward_pool: c.demo_reward_pool,
    };
  }).map((c) => ({ ...c }));
}
