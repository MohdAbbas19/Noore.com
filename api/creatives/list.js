import { db } from "hatchable";

export const access = "user";
export const methods = ["GET"];

export default async function (req, res) {
  const { rows } = await db.query(
    "SELECT id, product_name, platform, objective, audience, tone, visual_style, headline, primary_text, call_to_action, concept, created_at FROM creatives WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50",
    [req.user.id]
  );
  res.json(rows);
}