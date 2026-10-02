import { db, ai } from "hatchable";

export const access = "user";
export const methods = ["POST"];

export default async function (req, res) {
  const b = req.body || {};
  const product = String(b.product || "").trim();
  const platform = String(b.platform || "Instagram").trim();
  const objective = String(b.objective || "Conversions").trim();
  const audience = String(b.audience || "").trim();
  const tone = String(b.tone || "Bold & modern").trim();
  const visualStyle = String(b.visualStyle || "Premium studio").trim();

  if (!product || !audience) return res.status(400).json({error:"Product and audience are required."});
  if (product.length > 300 || audience.length > 500) return res.status(400).json({error:"Please keep the descriptions concise."});

  const prompt = [
    "Create one polished advertising creative package.",
    "Return ONLY valid JSON with exactly these keys: headline, primary_text, call_to_action, concept.",
    "headline: 6-10 words. primary_text: 2-4 short sentences. call_to_action: 2-4 words.",
    "concept: describe visual composition, subject placement, lighting, background, typography treatment, and 3-5 visual details.",
    "Product: " + product, "Platform: " + platform, "Objective: " + objective,
    "Audience: " + audience, "Tone: " + tone, "Visual style: " + visualStyle
  ].join("\n");

  try {
    const result = await ai.generateText({
      model:"sonnet", purpose:"ad-creative-generation", userId:req.user.id, maxTokens:1400,
      system:"You are an expert performance advertising creative director. Keep claims grounded in the product description; never invent certifications, discounts, guarantees, statistics, or capabilities.",
      prompt
    });
    if (result.finishReason === "length") return res.status(502).json({error:"The AI response was truncated. Please try again."});

    let parsed;
    try { parsed = JSON.parse(result.text); }
    catch {
      const match = result.text.match(/\{[\s\S]*\}/);
      if (!match) return res.status(502).json({error:"The AI returned an invalid creative. Please try again."});
      parsed = JSON.parse(match[0]);
    }

    const headline=String(parsed.headline||"").slice(0,180);
    const primaryText=String(parsed.primary_text||"").slice(0,1200);
    const callToAction=String(parsed.call_to_action||"Learn More").slice(0,80);
    const concept=String(parsed.concept||"").slice(0,1600);

    const saved=await db.query(
      "INSERT INTO creatives (user_id, product_name, platform, objective, audience, tone, visual_style, headline, primary_text, call_to_action, concept, prompt) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12) RETURNING id, product_name, platform, objective, audience, tone, visual_style, headline, primary_text, call_to_action, concept, created_at",
      [req.user.id,product,platform,objective,audience,tone,visualStyle,headline,primaryText,callToAction,concept,prompt]
    );
    res.json({creative:saved.rows[0],usage:result.usage});
  } catch(e) {
    console.error("creative generation failed",e);
    res.status(502).json({error:"AI generation is temporarily unavailable. Please try again."});
  }
}