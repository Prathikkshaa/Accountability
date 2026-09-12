# Making Pairing Real — Setup Guide

Goal: two real people on two phones, each with their own account (created during
onboarding), who pair with an invite code and see each other's check-ins live.

You do **Parts 1–4** (about 10 minutes). Then send me the two values in Part 4 and
I'll build **Parts 5–6**. Nothing here costs money.

---

## Part 1 — Create the Supabase project

1. Go to **https://supabase.com** → **Sign in** (GitHub is easiest).
2. Click **New project**.
3. Fill in:
   - **Name:** `accountability` (anything is fine)
   - **Database Password:** click **Generate**, then **save it somewhere** (you won't need it often, but keep it).
   - **Region:** pick the one closest to you and your partner.
4. Click **Create new project** and wait ~2 minutes for it to finish provisioning.

---

## Part 2 — Configure Auth (email sign-in)

1. In the left sidebar: **Authentication** → **Providers** (or **Sign In / Providers**).
2. Make sure **Email** is **enabled** (it is by default).
3. Click into **Email** and confirm:
   - **Enable Email provider:** ON
   - **Confirm email:** you can leave this ON — our 6-digit code flow handles it.
4. Left sidebar: **Authentication** → **URL Configuration**:
   - **Site URL:** `https://prathikkshaa.github.io/Accountability/`
   - **Redirect URLs:** click Add and enter `https://prathikkshaa.github.io/**`
   - Save.
5. **Make the email show a 6-digit code** (so you can type it in the app instead of leaving to click a link):
   - **Authentication** → **Emails** → **Templates** → **Magic Link**.
   - Replace the body with this and **Save**:
     ```html
     <h2>Your Accountability code</h2>
     <p>Enter this code in the app to sign in:</p>
     <p style="font-size:28px;font-weight:bold;letter-spacing:4px">{{ .Token }}</p>
     <p>Or tap the link: <a href="{{ .ConfirmationURL }}">Sign in</a></p>
     <p>This code expires in 1 hour.</p>
     ```
   - (Both work — the code for typing in-app, the link as a backup.)

> **Email note:** Supabase's built-in email is fine for two testers but can be
> slow or rate-limited. If codes don't arrive within a minute, check spam. If it's
> consistently bad, tell me and I'll walk you through a free email sender (Resend) —
> not needed to start.

---

## Part 3 — Create the database

1. Left sidebar: **SQL Editor** → **New query**.
2. Paste the **entire** script below and click **Run**.
3. You should see "Success. No rows returned." If you see an error, copy it to me.

This creates every table, locks them down with security rules (you can see your
partner's *shared* goals but never their *private* ones), and adds trustworthy
server-side functions for invite/pair, disconnect cooldown, and nudge limits.

```sql
-- ============================================================
-- Accountability — schema, security, and pairing functions
-- Safe to run once on a fresh project.
-- ============================================================

-- ---------- TABLES ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Friend',
  avatar_url text,
  email text,
  timezone text,
  created_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  category text not null default 'General',
  description text,
  measurement_type text not null,           -- BINARY | DURATION | QUANTITY | FREQUENCY
  target_value numeric not null default 1,
  target_unit text,
  frequency_per_week int,
  selected_days int[],
  visibility text not null default 'PARTNER_VISIBLE',  -- PARTNER_VISIBLE | PRIVATE
  start_date date not null default current_date,
  end_date date,
  reminder_time text,
  status text not null default 'ACTIVE',     -- ACTIVE | PAUSED | ARCHIVED
  stake text,
  created_at timestamptz not null default now()
);
create index if not exists goals_user_idx on public.goals(user_id);

create table if not exists public.check_ins (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  date date not null,
  completed boolean not null default true,
  quantity_completed numeric,
  proof_photo_url text,
  note text,
  mood text,
  checked_in_at timestamptz not null default now(),
  unique (goal_id, date)
);
create index if not exists checkins_user_date_idx on public.check_ins(user_id, date);

create table if not exists public.partnerships (
  id uuid primary key default gen_random_uuid(),
  user_a uuid not null references public.profiles(id) on delete cascade,
  user_b uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'ACTIVE',     -- ACTIVE | DISCONNECTED
  created_at timestamptz not null default now(),
  disconnected_at timestamptz,
  cooldown_until timestamptz
);

create table if not exists public.invites (
  code text primary key,
  inviter_id uuid not null references public.profiles(id) on delete cascade,
  status text not null default 'PENDING',    -- PENDING | APPROVED | EXPIRED
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists public.nudges (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  goal_id uuid,
  goal_name text,
  message text not null,
  nudge_type text not null default 'CUSTOM',
  status text not null default 'DELIVERED',
  created_at timestamptz not null default now()
);

create table if not exists public.grace_requests (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid references public.goals(id) on delete cascade,
  goal_name text,
  user_id uuid not null references public.profiles(id) on delete cascade,
  reviewer_id uuid not null references public.profiles(id) on delete cascade,
  date date,
  reason_note text,
  status text not null default 'PENDING',     -- PENDING | APPROVED | REJECTED
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------- HELPER: am I partnered with this user? ----------
create or replace function public.is_my_partner(other uuid)
returns boolean language sql security definer set search_path = public stable as $$
  select exists (
    select 1 from public.partnerships p
    where p.status = 'ACTIVE'
      and ( (p.user_a = auth.uid() and p.user_b = other)
         or (p.user_b = auth.uid() and p.user_a = other) )
  );
$$;

-- ---------- ROW LEVEL SECURITY ----------
alter table public.profiles       enable row level security;
alter table public.goals          enable row level security;
alter table public.check_ins      enable row level security;
alter table public.partnerships   enable row level security;
alter table public.invites        enable row level security;
alter table public.nudges         enable row level security;
alter table public.grace_requests enable row level security;

-- profiles: see self + partners; write self
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select
  using (id = auth.uid() or public.is_my_partner(id));
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert
  with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update
  using (id = auth.uid()) with check (id = auth.uid());

-- goals: own everything; partners can read PARTNER_VISIBLE ones
drop policy if exists goals_select on public.goals;
create policy goals_select on public.goals for select
  using (user_id = auth.uid()
         or (visibility = 'PARTNER_VISIBLE' and public.is_my_partner(user_id)));
drop policy if exists goals_cud on public.goals;
create policy goals_cud on public.goals for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- check_ins: own everything; partners can read those on PARTNER_VISIBLE goals
drop policy if exists checkins_select on public.check_ins;
create policy checkins_select on public.check_ins for select
  using (user_id = auth.uid()
         or (public.is_my_partner(user_id)
             and exists (select 1 from public.goals g
                          where g.id = check_ins.goal_id
                            and g.visibility = 'PARTNER_VISIBLE')));
drop policy if exists checkins_cud on public.check_ins;
create policy checkins_cud on public.check_ins for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());

-- partnerships: read your own; writes happen through functions below
drop policy if exists partnerships_select on public.partnerships;
create policy partnerships_select on public.partnerships for select
  using (user_a = auth.uid() or user_b = auth.uid());

-- invites: only the creator can read their codes; created via function
drop policy if exists invites_select on public.invites;
create policy invites_select on public.invites for select
  using (inviter_id = auth.uid());

-- nudges: read ones you sent or received; sent via function
drop policy if exists nudges_select on public.nudges;
create policy nudges_select on public.nudges for select
  using (sender_id = auth.uid() or receiver_id = auth.uid());

-- grace: requester and reviewer can read; requester inserts; reviewer decides
drop policy if exists grace_select on public.grace_requests;
create policy grace_select on public.grace_requests for select
  using (user_id = auth.uid() or reviewer_id = auth.uid());
drop policy if exists grace_insert on public.grace_requests;
create policy grace_insert on public.grace_requests for insert
  with check (user_id = auth.uid());
drop policy if exists grace_update on public.grace_requests;
create policy grace_update on public.grace_requests for update
  using (reviewer_id = auth.uid()) with check (reviewer_id = auth.uid());

-- ---------- PAIRING / RULE FUNCTIONS (run with elevated rights) ----------
create or replace function public.generate_invite()
returns text language plpgsql security definer set search_path = public as $$
declare chars text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; code text; i int;
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  loop
    code := '';
    for i in 1..6 loop code := code || substr(chars, floor(random()*length(chars))::int + 1, 1); end loop;
    exit when not exists (select 1 from public.invites where invites.code = code);
  end loop;
  insert into public.invites(code, inviter_id, status, expires_at)
  values (code, auth.uid(), 'PENDING', now() + interval '7 days');
  return code;
end; $$;

create or replace function public.accept_invite(p_code text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare inv public.invites; joiner uuid := auth.uid();
begin
  if joiner is null then raise exception 'Not authenticated'; end if;
  select * into inv from public.invites where code = upper(trim(p_code));
  if inv.code is null then raise exception 'Invalid invite code'; end if;
  if inv.status <> 'PENDING' then raise exception 'This code has already been used'; end if;
  if inv.expires_at < now() then raise exception 'This code has expired'; end if;
  if inv.inviter_id = joiner then raise exception 'You cannot pair with yourself'; end if;
  if exists (select 1 from public.partnerships p where p.status='ACTIVE'
      and ((p.user_a=inv.inviter_id and p.user_b=joiner) or (p.user_a=joiner and p.user_b=inv.inviter_id)))
    then raise exception 'You are already partners'; end if;
  if exists (select 1 from public.partnerships p where p.cooldown_until > now()
      and ((p.user_a=inv.inviter_id and p.user_b=joiner) or (p.user_a=joiner and p.user_b=inv.inviter_id)))
    then raise exception 'Reconnect cooldown is still active'; end if;
  insert into public.partnerships(user_a, user_b, status) values (inv.inviter_id, joiner, 'ACTIVE');
  update public.invites set status='APPROVED' where code = inv.code;
  return jsonb_build_object('partner_id', inv.inviter_id);
end; $$;

create or replace function public.disconnect_partner(p_partner uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.partnerships
    set status='DISCONNECTED', disconnected_at=now(), cooldown_until=now() + interval '4 hours'
  where status='ACTIVE'
    and ((user_a=auth.uid() and user_b=p_partner) or (user_a=p_partner and user_b=auth.uid()));
end; $$;

create or replace function public.send_nudge(
  p_receiver uuid, p_goal_id uuid, p_goal_name text, p_message text, p_type text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  if not public.is_my_partner(p_receiver) then raise exception 'You are not partners'; end if;
  if (select count(*) from public.nudges
      where sender_id=auth.uid() and receiver_id=p_receiver
        and created_at > now() - interval '1 hour') >= 5
    then raise exception 'Nudge limit reached — try again later'; end if;
  insert into public.nudges(sender_id, receiver_id, goal_id, goal_name, message, nudge_type, status)
  values (auth.uid(), p_receiver, p_goal_id, p_goal_name, p_message, coalesce(p_type,'CUSTOM'), 'DELIVERED');
end; $$;

grant execute on function
  public.generate_invite(), public.accept_invite(text),
  public.disconnect_partner(uuid), public.send_nudge(uuid, uuid, text, text, text)
  to authenticated;

-- ---------- LIVE UPDATES (realtime) ----------
do $$ begin
  alter publication supabase_realtime add table public.check_ins;
  alter publication supabase_realtime add table public.nudges;
  alter publication supabase_realtime add table public.grace_requests;
  alter publication supabase_realtime add table public.partnerships;
exception when duplicate_object then null; end $$;
```

---

## Part 4 — Send me these

Left sidebar: **Project Settings** → **API**. Copy and paste back to me:

1. **Project URL** — `https://xxxxxxxx.supabase.co`
2. **anon public** key — the long `eyJ...` string labelled **anon / public**
   *(Safe to share and to put in the app. Do **not** send the `service_role` key.)*
3. A quick **"SQL ran OK"** confirmation.

That's everything I need from you.

---

## Part 5 — What I build once you're back (so you know the plan)

**Auth + onboarding**
- Add the Supabase client to the app (your URL + anon key as build secrets).
- Onboarding's "who's this?" step collects **name + email** → sends a code → you type the **6-digit code** inline → verified → your **profile** is created. You never leave the flow.
- The signed-in user replaces the hardcoded "Tara" everywhere; the demo users are retired.
- A lightweight **"Sign in"** entry for returning devices (enter email → code) so the same account follows you across phones/reinstalls.
- **Sign out** in the You tab.

**Data layer rewrite**
- Swap every read/write (Today, goal detail, Partners, nudges, grace) from localStorage to Supabase.
- Real **invite → pair**: `generate_invite` / `accept_invite` link your two accounts.
- **Live partner updates**: subscribe to realtime so a partner's check-in appears without refreshing.
- Keep a small offline cache so the installed app still opens without signal and syncs later.

**Deploy**
- Store URL + anon key as GitHub repo secrets, inject at build, redeploy to the same link.

## Part 6 — How you'll test together

1. **Phone A (you):** open the link → onboard with your email → enter the emailed code → you're in.
2. **Phone B (partner):** same, with their email.
3. **You:** copy your invite code (Partners tab or end of onboarding) and send it to your partner.
4. **Partner:** Partners → Add → Enter a code → paste it → **paired**.
5. You check in a goal → it appears on your partner's screen; they nudge you → you get it; you ask for grace → they forgive.
6. Mark a goal **Private** → confirm your partner can't see it.
