# `services` — bookable treatments

Purpose: catalog items for the menu/booking flows.

Key columns: `title`, `category` (slug), `category_label`, `price`
(numeric), `duration_minutes`, `description`, `image_url`
(**relative web paths today — see concerns §9.5**), `features` (text[]),
`branch_ids` (text[], empty = all branches), `is_featured`, `popular`,
`created_at`.

Written by: super_admin / owner (portal). Read by: public.
