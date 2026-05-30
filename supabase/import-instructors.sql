-- Generated from WordPress user export.
-- Run this in Supabase SQL Editor to import instructor profiles.

insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Alex',
  'alexshelley365@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry’s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('alexshelley365@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'AlexT',
  'aussietwerk@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('aussietwerk@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'AmyK',
  'amy.kauler@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('amy.kauler@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Amy',
  'amcin103@gmail.com',
  null,
  '{}'::text[],
  'This is Profile info',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('amcin103@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Anandi',
  'anandidw@gmail.com',
  null,
  '{}'::text[],
  'Anandi is a freelance professional dancer/choreographer. She completed a Certificate IV in dance at RAW Dance Company and a Bachelor of Fine Arts (Dance) at QUT in 2022. She has had the pleasure to perform, and choreograph, for shows such as IndepenDance (2021), Lord Mayor’s Senior Cabaret Gala (2022, 2023), Supanova (2020 – 2022) Brisbane Fringe Festival (2023), Brisbane Arts Theatre’s High School Musical (2023), Australia and Asia-Pacific International Pageantry (2024), On The Boards Theatre Company''s A Chorus Line (2024), Qld Musical Theatre''s Mary Poppins (2024) and other choreographic projects.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('anandidw@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'AndreaD',
  'hello@dancemasala.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('hello@dancemasala.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'AngeliqueM',
  'evokedanceandtheatre@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('evokedanceandtheatre@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'AnnaJ',
  'annaleahjohnston@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('annaleahjohnston@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Arturo Flores',
  'imarturoflores@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('imarturoflores@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'AshG',
  'ashleighgauci@bigpond.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('ashleighgauci@bigpond.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Ashlee Lawson',
  'ashlee.lawson13@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('ashlee.lawson13@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Ashton',
  'ashtongydeinfo@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('ashtongydeinfo@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'BeckH',
  'beck@spiritbreathwork.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('beck@spiritbreathwork.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'BereniceT',
  'berenice.tan@delvemeditation.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('berenice.tan@delvemeditation.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'BodieF',
  'info@sundaysessionsproseries.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('info@sundaysessionsproseries.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Brandon Skapa',
  'brandonskapa@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('brandonskapa@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Brendan',
  'brendanchristoph@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('brendanchristoph@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'BrianS',
  'brian@empireswing.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('brian@empireswing.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'BrieS',
  'brie@spiritrisingyoga.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('brie@spiritrisingyoga.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'BrunoS',
  'info@bossalatina.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('info@bossalatina.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Cassandra',
  'info@choreographybycassandra.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('info@choreographybycassandra.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'CharliS',
  'charlistewart.raw@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('charlistewart.raw@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'ChelseaA',
  'chelseaapps.dance@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('chelseaapps.dance@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'ChloeL',
  'info@paradizodance.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('info@paradizodance.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Ciara',
  'ciaracamp25@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('ciaracamp25@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Connor Miller',
  'connormiller93@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('connormiller93@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'DanaP',
  'danapaige@optusnet.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('danapaige@optusnet.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'DarceiR',
  'darcie.rae@hotmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('darcie.rae@hotmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'DeeT',
  'dee@tribalblossoms.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('dee@tribalblossoms.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'DenzalV',
  'DenzalVanUitregt@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('DenzalVanUitregt@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Dion',
  'd.apirana.kc@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('d.apirana.kc@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'DonnaZ',
  'donnazakura@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('donnazakura@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'EmmaC',
  '2emma.chow@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('2emma.chow@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'EmmaH',
  'emma@cornerpocketswing.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('emma@cornerpocketswing.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'EmmaHi',
  'Hiphulahoophooray@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('Hiphulahoophooray@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'EmmaW',
  'em.whitefield@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('em.whitefield@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'EstelleD',
  'estelle.delalande93@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('estelle.delalande93@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'EvaM',
  'evamalteaser@yahoo.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('evamalteaser@yahoo.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'FionaJ',
  'fiona.johnson@tapfit.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('fiona.johnson@tapfit.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'GeorgiaP',
  'georgiapierce@live.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('georgiapierce@live.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'GlynnisE',
  'glynnis.eames@bigpond.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('glynnis.eames@bigpond.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'GraceB',
  'gracebartlettraw@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('gracebartlettraw@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Hannah',
  'lecheileirishdance@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('lecheileirishdance@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Hannah',
  'hannahgroom@outlook.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('hannahgroom@outlook.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'HannahR',
  'hannahrasenberger.raw@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('hannahrasenberger.raw@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'HeidiO',
  'heidi@skatepink.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('heidi@skatepink.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'HelenaK',
  'Kathak@infinitykathak.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('Kathak@infinitykathak.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'HollyW',
  'holly@shivashaktidance.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('holly@shivashaktidance.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'JadeN',
  'werqit@hoopsthighsbuttocks.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('werqit@hoopsthighsbuttocks.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'James',
  'james@danceculture.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('james@danceculture.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Jess',
  'jesslbepage@homail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('jesslbepage@homail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Jill',
  'chewjill96@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('chewjill96@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'KateH',
  'khartley@bigpond.net.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('khartley@bigpond.net.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'KatherineJ',
  'katherinejarowicki@googlemail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('katherinejarowicki@googlemail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Kim Smit',
  'kimberleysmit0@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('kimberleysmit0@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'KristyH',
  'kristyhorn92@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('kristyhorn92@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'LeahG',
  'leahgeddes.raw@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('leahgeddes.raw@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Leonard Mickelo',
  'leonardjmickelo@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('leonardjmickelo@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Leo Woodfield',
  'leo.woodfield@outlook.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('leo.woodfield@outlook.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'LindyY',
  'admin@yogakidssa.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('admin@yogakidssa.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'LisaB',
  'labartley@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('labartley@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'LoniG',
  'loni.gw@hotmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('loni.gw@hotmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Lucy Chambers',
  'lucy.chambers1is@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('lucy.chambers1is@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'MadelineG',
  'chevronshowgirlsbookings@outlook.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('chevronshowgirlsbookings@outlook.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'MadiR',
  'madison.randl21@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('madison.randl21@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Mads',
  'mads_dance@hotmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('mads_dance@hotmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'MargoL',
  'chrislow1964@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('chrislow1964@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'MaryanneN',
  'maryanne.nucifora92@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('maryanne.nucifora92@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Michelle',
  'eunoiadance@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('eunoiadance@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'MikaelaP',
  'gingertonicburlesque@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('gingertonicburlesque@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'MitchellM',
  'mmarsh0804@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('mmarsh0804@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'MoniM',
  'monimeng8@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('monimeng8@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'MontannaS',
  'montanna.stoneman@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('montanna.stoneman@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Morgan',
  'morganjmcaleer@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('morganjmcaleer@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Nadia',
  'milford.nadia@gmail.com',
  null,
  '{}'::text[],
  'Nadia is a passionate dance and yoga practitioner driven by a vision to foster a more compassionate world. She uses dance as a medium for empowerment, creativity, freedom, and, above all, fun. Nadia has collaborated with contemporary dance and physical theatre companies, as well as renowned choreographers. She has performed and facilitated professional workshops across Australia, Europe, South Korea, Mongolia, India, Sri Lanka, and China. Her workshops and classes integrate her extensive professional experience in diverse movement practices, promoting a deeper connection to the body.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('milford.nadia@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Natalie',
  'natalie@thebalanceddancer.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('natalie@thebalanceddancer.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'NeridaM',
  'neridance@live.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('neridance@live.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'NicoleR',
  'nicole@zenzenzo.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('nicole@zenzenzo.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'PaigeL',
  'paige.lowe.2006@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('paige.lowe.2006@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'PaigeM',
  'paigeaemuller@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('paigeaemuller@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Pamela Williams',
  'misspams@bigpond.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('misspams@bigpond.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Rachel Dowse',
  'rachel.dowse10@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('rachel.dowse10@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Ramone Mustafay',
  'rmustafay@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('rmustafay@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Andy',
  'rawmanager46@gmail.com',
  'Moorooka, QLD',
  '{}'::text[],
  'this is our bio area.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('rawmanager46@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Raw2023',
  'rawtrainer2023@gmail.com',
  null,
  '{}'::text[],
  'Andrew is a dancer, producer, director and choreographer and has been involved in creative arts his entire life. Andrew started dancing at the age of 6, excelling in tap, ballet, contemporary, acting, singing and acrobatics. Andrew studied RAD, LGTDA and CSTD syllabus work and competed throughout Australia at a range of competitions and eisteddfods. Andrew went on to create Raw Metal in 1998 when he was 19 years old.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('rawtrainer2023@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'RhysH',
  'rhys@lucidmoves.com.au',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('rhys@lucidmoves.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Rowan Jack',
  'rowancjack@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('rowancjack@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Sammie',
  'rawrto46@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('rawrto46@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Sam Windsor',
  'sam.windsor1988@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('sam.windsor1988@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Sanda Mesic',
  'sandamesic99@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('sandamesic99@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'SaraG',
  'sara.nicole@zoho.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('sara.nicole@zoho.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Shika',
  'shikatanudjaja@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('shikatanudjaja@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'ShyamS',
  'sldancefoundation@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('sldancefoundation@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'SidneyS',
  'sidneyshen8@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('sidneyshen8@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'SimoneP',
  'simone@simonepope.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('simone@simonepope.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'StephanieF',
  'hello@stephfergusonyoga.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('hello@stephfergusonyoga.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'TenaiQ',
  'tqperformer@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('tqperformer@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'TommyH',
  'tommy@adonisdanceacademy.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('tommy@adonisdanceacademy.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'ToreaR',
  'riversidephysie@hotmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('riversidephysie@hotmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'UmeshaP',
  'u.pathmanathan@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('u.pathmanathan@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Vanessa Friscia',
  'vanessa@vhubdance.com.au',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('vanessa@vhubdance.com.au'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Waimania Paikea',
  'waimania_paikea@hotmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('waimania_paikea@hotmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'Wanida Serce',
  'wanida.serce@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('wanida.serce@gmail.com'));
insert into public.instructors
  (name, email, location, categories, bio, hourly_rate, approved)
select
  'WillD',
  'william.j.dent@gmail.com',
  null,
  '{}'::text[],
  'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry''s standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged.',
  null,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('william.j.dent@gmail.com'));
