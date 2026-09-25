-- "Set as today's meditation": pins one meditation to a specific date.
-- The public page checks for a pin first and falls back to the daily rotation,
-- so this is additive — nothing breaks before or after it's applied.
--
-- Run this once in the Supabase SQL editor.

alter table meditations
  add column if not exists featured_on date;

-- Only one meditation can hold a given day.
create unique index if not exists meditations_featured_on_key
  on meditations (featured_on)
  where featured_on is not null;
