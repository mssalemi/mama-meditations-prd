// The tag vocabulary Mom picks from in the admin forms.
//
// Tags are an organising tool for HER — the public page never shows them; they
// only drive the filter on the meditations list. So the right vocabulary is
// whatever makes her own library easy to sort through, nothing more.
//
// Edit this list freely. Tags already saved on a meditation keep working and
// keep appearing in the list filter even if removed here, because that filter
// derives its options from the library itself rather than from this constant.
// Keep it short: the whole point is that choosing is faster than typing.
export const PRESET_TAGS = [
  "Morning",
  "Evening",
  "Sleep",
  "Gratitude",
  "Breathing",
  "Calm",
  "Anxiety",
  "Body Scan",
] as const;
