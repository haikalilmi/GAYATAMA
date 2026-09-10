// Setup + seed DB lokal. Repeatable: bersihkan lalu isi ulang demo.
// Jalankan: npm run db:setup
import { DatabaseSync } from "node:sqlite";
import { readFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { scryptSync, randomUUID } from "node:crypto";

const dbPath = resolve(process.cwd(), process.env.DATABASE_PATH ?? "data/impactquest.db");
mkdirSync(dirname(dbPath), { recursive: true });
const db = new DatabaseSync(dbPath);
db.exec("PRAGMA journal_mode = WAL; PRAGMA foreign_keys = OFF;");

const schema = readFileSync(resolve(process.cwd(), "db/schema.sql"), "utf8");
db.exec(schema);

function hash(pw) {
  const salt = randomUUID().replaceAll("-", "").slice(0, 16);
  return `scrypt:${salt}:${scryptSync(pw, salt, 64).toString("hex")}`;
}

// Bersihkan child -> parent agar repeatable untuk latihan demo.
db.exec(`
DELETE FROM notifications; DELETE FROM reward_redemptions;
DELETE FROM user_badges; DELETE FROM point_transactions;
DELETE FROM xp_transactions; DELETE FROM verification_logs;
DELETE FROM submission_impacts; DELETE FROM submission_evidence;
DELETE FROM submissions; DELETE FROM participations;
DELETE FROM mission_metrics; DELETE FROM missions;
DELETE FROM campaigns; DELETE FROM organizations;
DELETE FROM badges; DELETE FROM rewards;
DELETE FROM demo_baselines; DELETE FROM sessions; DELETE FROM users;
`);

const now = new Date().toISOString();
const q = (sql, ...params) => db.prepare(sql).run(...params);

const uid = {
  demo: "u-demo-haikal",
  admin: "u-demo-admin",
  org: "u-demo-org",
  lb1: "u-lb-1", lb2: "u-lb-2", lb3: "u-lb-3", lb4: "u-lb-4", lb5: "u-lb-5",
};

q(`INSERT INTO users (id,email,full_name,password_hash,role,total_xp,points_balance,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?, ?,?)`, uid.demo, "demo@impactquest.local", "Haikal", hash("demo1234"), "USER", 1900, 470, now, now);
q(`INSERT INTO users (id,email,full_name,password_hash,role,total_xp,points_balance,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?, ?,?)`, uid.admin, "admin@impactquest.local", "Admin", hash("admin1234"), "ADMIN", 0, 0, now, now);
q(`INSERT INTO users (id,email,full_name,password_hash,role,total_xp,points_balance,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?, ?,?)`, uid.org, "org@impactquest.local", "EcoFuture", hash("org1234"), "ORGANIZATION", 0, 0, now, now);

const lb = [["lb1","Sinta",3200,900],["lb2","Bima",2600,600],["lb3","Rani",1500,300],["lb4","Dimas",800,150],["lb5","Putri",300,80]];
for (const [k, name, xp, pts] of lb) {
  q(`INSERT INTO users (id,email,full_name,password_hash,role,total_xp,points_balance,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?, ?,?)`, uid[k], `${k}@impactquest.local`, name, hash("demo1234"), "USER", xp, pts, now, now);
}

for (const [id, name, slug] of [
  ["o-ecofuture","EcoFuture Foundation","ecofuture-foundation"],
  ["o-green","Green Future Community","green-future-community"],
  ["o-goodcup","GoodCup Demo Partner","goodcup"],
  ["o-edufuture","EduFuture Demo Partner","edufuture"],
]) {
  q(`INSERT INTO organizations (id,name,slug,description,is_demo,created_at)
     VALUES (?,?,?,?,1,?)`, id, name, slug, `${name} (demo)`, now);
}

q(`INSERT INTO campaigns (id,organization_id,name,slug,description,target_metric_key,target_value,demo_reward_pool,status,is_demo,created_at,updated_at)
   VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
  "c-green-city","o-ecofuture","Green City Challenge","green-city-challenge",
  "Kumpulkan 1000 kg sampah terverifikasi bersama.","waste_collected",1000,5000000,"ACTIVE",1,now,now);

const missions = [
  // id, org, campaign, title, slug, short, category, difficulty, type, xp, pts, repeat, expiry, before, after, desc, proof, partner, sdg, status
  ["m-clean",null,"c-green-city","Clean Your Neighborhood","clean-your-neighborhood","Bersihkan lingkungan sekitar.","ENVIRONMENT","EASY","STANDARD",100,30,"WEEKLY",48,1,1,1,1,0,"[11,12]","ACTIVE"],
  ["m-plant","o-ecofuture",null,"Plant for Tomorrow","plant-for-tomorrow","Tanam pohon di sekitarmu.","ENVIRONMENT","MEDIUM","STANDARD",150,40,"REPEATABLE",72,1,1,1,0,0,"[11,13]","ACTIVE"],
  ["m-share","o-edufuture",null,"Share Knowledge","share-knowledge","Ajar satu hal ke orang lain.","EDUCATION","MEDIUM","STANDARD",200,50,"REPEATABLE",72,0,0,1,0,0,"[4]","ACTIVE"],
  ["m-book","o-edufuture",null,"Donate a Book","donate-a-book","Donasikan buku layak baca.","EDUCATION","EASY","STANDARD",100,25,"REPEATABLE",72,0,0,1,0,0,"[4]","ACTIVE"],
  ["m-biz",null,null,"Help a Local Business","help-local-business","Bantu digitalisasi usaha lokal.","DIGITAL","HIGH","STANDARD",300,80,"ONCE",168,0,0,1,0,0,"[8]","ACTIVE"],
  ["m-volunteer","o-green","c-green-city","Community Volunteer","community-volunteer","Ikut aksi komunitas.","COMMUNITY","MEDIUM","SPONSORED",250,70,"WEEKLY",72,0,0,1,0,1,"[11,17]","ACTIVE"],
];
for (const m of missions) {
  q(`INSERT INTO missions (id,organization_id,campaign_id,title,slug,short_description,description,category,difficulty,mission_type,xp_reward,point_reward,repeat_type,participation_expiry_hours,requires_before_photo,requires_after_photo,requires_description,requires_proof_code,requires_partner_code,sdg_codes,status,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    m[0],m[1],m[2],m[3],m[4],m[5],`${m[5]} Detail menyusul.`,m[6],m[7],m[8],m[9],m[10],m[11],m[12],m[13],m[14],m[15],m[16],m[17],m[18],m[19],now,now);
}

const metrics = [
  ["mm-waste","m-clean","Waste Collected","waste_collected","kg",0],
  ["mm-plant","m-plant","Plants Added","plants_added","pohon",0],
  ["mm-teach","m-share","Teaching Hours","teaching_hours","jam",0],
  ["mm-reach","m-share","People Reached","people_reached","orang",1],
  ["mm-book","m-book","Books Donated","books_donated","buku",0],
  ["mm-biz","m-biz","Businesses Assisted","businesses_assisted","usaha",0],
  ["mm-vol","m-volunteer","Volunteer Hours","volunteer_hours","jam",0],
];
for (const m of metrics) q(`INSERT INTO mission_metrics (id,mission_id,name,metric_key,unit,display_order,created_at) VALUES (?,?,?,?,?,?,?)`, ...m, now);

for (const [id,name,slug,desc,cat,ctype,cval] of [
  ["b-eco-starter","Eco Starter","eco-starter","Misi lingkungan pertama disetujui.","ENVIRONMENT","ENV_APPROVED_COUNT","1"],
  ["b-eco-guardian","Eco Guardian","eco-guardian","Lima misi lingkungan disetujui.","ENVIRONMENT","ENV_APPROVED_COUNT","5"],
  ["b-knowledge","Knowledge Giver","knowledge-giver","Misi edukasi pertama disetujui.","EDUCATION","EDU_APPROVED_COUNT","1"],
  ["b-digital","Digital Helper","digital-helper","Misi digital pertama disetujui.","DIGITAL","DIGITAL_APPROVED_COUNT","1"],
  ["b-community","Community Builder","community-builder","Misi komunitas pertama disetujui.","COMMUNITY","COMMUNITY_APPROVED_COUNT","1"],
  ["b-verified","Verified Contributor","verified-contributor","Sepuluh submission disetujui.","SOCIAL","TOTAL_APPROVED_COUNT","10"],
]) {
  q(`INSERT INTO badges (id,name,slug,description,category,condition_type,condition_value,created_at) VALUES (?,?,?,?,?,?,?,?)`,
    id,name,slug,desc,cat,ctype,cval,now);
}

for (const [id,title,cost,stock] of [
  ["r-coffee","Coffee Voucher",500,50],
  ["r-book","Book Voucher",750,30],
  ["r-learn","Learning Voucher",1000,20],
  ["r-social","Social Contribution Reward",1500,10],
  ["r-scholar","Community Scholarship",5000,2],
]) {
  q(`INSERT INTO rewards (id,organization_id,title,description,point_cost,stock,status,is_demo,created_at,updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?)`, id,"o-goodcup",title,`${title} (simulasi demo)`,cost,stock,"ACTIVE",1,now,now);
}

for (const [k,v] of [["verified_actions",8700],["contributors",2450],["waste_collected",12000],["plants_added",4700],["volunteer_hours",9000],["teaching_hours",6800]]) {
  q(`INSERT INTO demo_baselines (metric_key,numeric_value,updated_at) VALUES (?,?,?)`, k,v,now);
}

db.exec("PRAGMA foreign_keys = ON;");
db.close();
console.log(`OK seed -> ${dbPath}`);
