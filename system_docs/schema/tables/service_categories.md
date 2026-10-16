# `service_categories` — treatment taxonomy

Purpose: dynamic catalog categories (portal CRUD, no code changes).

Key columns: `name`, `slug` (unique — apps filter on this), `description`,
`display_order`, `is_active`, `created_at`.

Live slugs: `hair | nails | spa | lashes | ambiance`.

Written by: super_admin / owner (portal). Read by: public.
