CREATE TABLE creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id text NOT NULL,
  product_name text NOT NULL,
  platform text NOT NULL,
  objective text NOT NULL,
  audience text NOT NULL,
  tone text NOT NULL,
  visual_style text NOT NULL,
  headline text NOT NULL,
  primary_text text NOT NULL,
  call_to_action text NOT NULL,
  concept text NOT NULL,
  prompt text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
)