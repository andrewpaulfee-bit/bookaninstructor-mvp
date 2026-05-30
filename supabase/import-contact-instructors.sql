-- Generated from contact CSV.
-- Run instructor-signup-fields.sql first so newer instructor columns exist.

insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Lucy',
  'Chambers',
  'Lucy Chambers',
  'lucy.chambers1is@gmail.com',
  null,
  '{}'::text[],
  null,
  '0422 771 127',
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('lucy.chambers1is@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Jess',
  'Page',
  'Jess Page',
  'jesslbepage@homail.com',
  null,
  '{}'::text[],
  null,
  '0422 735 850',
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('jesslbepage@homail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Emma',
  'Whitefield',
  'Emma Whitefield',
  'em.whitefield@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  array['Brisbane']::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('em.whitefield@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Wanida',
  'Serce',
  'Wanida Serce',
  'wanida.serce@gmail.com',
  null,
  array['Choreographer']::text[],
  null,
  '0414 068 286',
  '{}'::text[],
  'https://www.facebook.com/photo?fbid=10161109638046672&set=a.465941891671',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('wanida.serce@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Waimania',
  'Paikea',
  'Waimania Paikea',
  'waimania_paikea@hotmail.com',
  'Augustine heights 4300',
  '{}'::text[],
  null,
  '0450806042',
  '{}'::text[],
  'http://bookaninstructor.com/wp-content/uploads/2023/08/2-3.png',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('waimania_paikea@hotmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Vanessa',
  'Friscia',
  'Vanessa Friscia',
  'vanessa@vhubdance.com.au',
  '27/10/1988',
  '{}'::text[],
  null,
  '0450955914',
  '{}'::text[],
  'http://bookaninstructor.com/wp-content/uploads/2023/08/9-1.png',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('vanessa@vhubdance.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Umesha',
  'Pathmanathan',
  'Umesha Pathmanathan',
  'u.pathmanathan@gmail.com',
  null,
  '{}'::text[],
  null,
  '0450 212 810',
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=1021797234563473&set=ecnf.100001996170100',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('u.pathmanathan@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Torea',
  'Ramsay',
  'Torea Ramsay',
  'riversidephysie@hotmail.com',
  null,
  array['Ballet', 'aerobic dance', 'jazz', 'contemporary and hip hop']::text[],
  null,
  '0425 504 434',
  '{}'::text[],
  'https://www.riversidephysie.com/our-teachers',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('riversidephysie@hotmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Tommy',
  'Harvey',
  'Tommy Harvey',
  'tommy@adonisdanceacademy.com',
  null,
  array['Male Striptease']::text[],
  null,
  '0498 102 276',
  '{}'::text[],
  'https://www.instagram.com/p/C4cZLliJ_st/?hl=en',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('tommy@adonisdanceacademy.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Tenai',
  'Quinn',
  'Tenai Quinn',
  'tqperformer@gmail.com',
  null,
  array['Musical Theatre']::text[],
  null,
  null,
  array['Sunshine Coast']::text[],
  'https://www.facebook.com/tenai.quinn',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('tqperformer@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Simone',
  'Pope',
  'Simone Pope',
  'simone@simonepope.com',
  null,
  array['Flamenco']::text[],
  null,
  '0411 742 933',
  '{}'::text[],
  'https://cdn.prod.website-files.com/6121a4c7d6e3b0382c9784ed/6178fd9e6d86117315032c93_Toma%202011-180%20resized-p-500.jpeg',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('simone@simonepope.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Sidney',
  'Shen',
  'Sidney Shen',
  'sidneyshen8@gmail.com',
  null,
  '{}'::text[],
  null,
  '0403 091 588',
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('sidneyshen8@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Shika',
  null,
  'Shika',
  'shikatanudjaja@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('shikatanudjaja@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Sanda',
  'Mesic',
  'Sanda Mesic',
  'sandamesic99@gmail.com',
  null,
  '{}'::text[],
  null,
  '0422 525 630',
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('sandamesic99@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Sammie',
  'Williams',
  'Sammie Williams',
  'sammiewilliams@y7mail.com',
  '04/05/1983',
  '{}'::text[],
  null,
  '0450299951',
  '{}'::text[],
  'http://bookaninstructor.com/wp-content/uploads/2023/08/16.png',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('sammiewilliams@y7mail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Sam',
  'Windsor',
  'Sam Windsor',
  'sam.windsor1988@gmail.com',
  null,
  '{}'::text[],
  null,
  '0423 516 681',
  '{}'::text[],
  'http://bookaninstructor.com/wp-content/uploads/2023/08/37.png',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('sam.windsor1988@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Rowan',
  'Jack',
  'Rowan Jack',
  'rowancjack@gmail.com',
  null,
  '{}'::text[],
  null,
  '0466834200',
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('rowancjack@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Rhys',
  'Hume',
  'Rhys Hume',
  'rhys@lucidmoves.com.au',
  null,
  '{}'::text[],
  null,
  null,
  '{}'::text[],
  'http://bookaninstructor.com/wp-content/uploads/2023/08/15.png',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('rhys@lucidmoves.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Ramone',
  'Mustafay',
  'Ramone Mustafay',
  'rmustafay@gmail.com',
  null,
  '{}'::text[],
  null,
  '0430921770',
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('rmustafay@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Rachel',
  'Dowse',
  'Rachel Dowse',
  'rachel.dowse10@gmail.com',
  null,
  array['Tap Dance']::text[],
  null,
  '0412 884 605',
  '{}'::text[],
  'http://bookaninstructor.com/wp-content/uploads/2023/08/36.png',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('rachel.dowse10@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Pamela',
  'Williams',
  'Pamela Williams',
  'misspams@bigpond.com',
  '27/06/1971',
  '{}'::text[],
  null,
  '0407018983',
  '{}'::text[],
  'https://www.linkedin.com/in/pamela-williams-46ab978b/overlay/photo/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('misspams@bigpond.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Paige',
  'Muller',
  'Paige Muller',
  'paigeaemuller@gmail.com',
  null,
  array['Hip Hop', 'Commerical Jazz']::text[],
  null,
  null,
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('paigeaemuller@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Paige',
  null,
  'Paige',
  'paige.lowe.2006@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('paige.lowe.2006@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Nicole',
  'Reilly',
  'Nicole Reilly',
  'nicole@zenzenzo.com',
  null,
  '{}'::text[],
  null,
  '0431 322 774',
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=10209580130042158&set=ecnf.1295066370',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('nicole@zenzenzo.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Nerida',
  'Matthaei',
  'Nerida Matthaei',
  'neridance@live.com.au',
  null,
  array['Contemporary']::text[],
  null,
  '0410 560 921',
  '{}'::text[],
  'https://www.facebook.com/photo.php?fbid=10153185246015222&set=pb.668090221.-2207520000&type=3',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('neridance@live.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Natalie',
  'Orola',
  'Natalie Orola',
  'natalie@thebalanceddancer.com',
  null,
  '{}'::text[],
  null,
  '0415 715 080',
  '{}'::text[],
  'https://www.linkedin.com/in/natalie-orola-26aa5135/overlay/photo/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('natalie@thebalanceddancer.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Nadia',
  'Milford',
  'Nadia Milford',
  'milford.nadia@gmail.com',
  null,
  '{}'::text[],
  null,
  '0409624460',
  '{}'::text[],
  'https://www.facebook.com/photo.php?fbid=10162063451739497&set=pb.619749496.-2207520000&type=3',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('milford.nadia@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Morgan',
  'McAleer',
  'Morgan McAleer',
  'morganjmcaleer@gmail.com',
  null,
  array['Musical Theatre', 'Tap']::text[],
  null,
  '0423 536 467',
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=792475199089111&set=ecnf.100049799138221',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('morganjmcaleer@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Montanna',
  'Stoneman',
  'Montanna Stoneman',
  'montanna.stoneman@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  '{}'::text[],
  'https://www.instagram.com/_montannafaye_/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('montanna.stoneman@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Moni',
  'Meng',
  'Moni Meng',
  'monimeng8@gmail.com',
  null,
  '{}'::text[],
  null,
  '0432 164 495',
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('monimeng8@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Mitchell',
  'Marshman',
  'Mitchell Marshman',
  'mmarsh0804@gmail.com',
  null,
  array['Hip Hop', 'Commerical Jazz']::text[],
  null,
  null,
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('mmarsh0804@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Michelle',
  'Laurenson',
  'Michelle Laurenson',
  'eunoiadance@gmail.com',
  null,
  array['Ballet']::text[],
  null,
  '0455 421 103',
  '{}'::text[],
  'https://www.facebook.com/michelle.laurenson.5',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('eunoiadance@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Maryanne',
  'Nucifora',
  'Maryanne Nucifora',
  'maryanne.nucifora92@gmail.com',
  null,
  array['Comm Jazz', 'Fosse Jazz']::text[],
  null,
  null,
  '{}'::text[],
  'http://bookaninstructor.com/wp-content/uploads/2023/08/14.png',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('maryanne.nucifora92@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Madison',
  'Randl',
  'Madison Randl',
  'madison.randl21@gmail.com',
  null,
  array['Contemporary', 'Commercial Jazz']::text[],
  null,
  null,
  '{}'::text[],
  'Sunshine Coast https://www.instagram.com/p/CB9EpubHNBy/?hl=en&img_index=2',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('madison.randl21@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Loni',
  'Garnons-Williams',
  'Loni Garnons-Williams',
  'loni.gw@hotmail.com',
  null,
  array['Contemporary']::text[],
  null,
  '0492 905 791',
  '{}'::text[],
  'https://australasiandancecollective.com/generated/1920w-9-16/lonii-garnons-williams.jpg?1655838169',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('loni.gw@hotmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Lisa',
  'Bartley',
  'Lisa Bartley',
  'labartley@gmail.com',
  null,
  '{}'::text[],
  null,
  null,
  '{}'::text[],
  'https://www.instagram.com/labartley/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('labartley@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Lindy',
  'Pulsford',
  'Lindy Pulsford',
  'admin@yogakidssa.com.au',
  null,
  array['Yoga']::text[],
  null,
  null,
  '{}'::text[],
  'https://www.yogakidssa.com.au/about-lindy-pulsford.html',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('admin@yogakidssa.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Leonard',
  'Mickelo',
  'Leonard Mickelo',
  'leonardjmickelo@gmail.com',
  '19/04/1987',
  '{}'::text[],
  null,
  '0457188549',
  '{}'::text[],
  'https://www.linkedin.com/in/leonard-mickelo-43a117178/overlay/photo/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('leonardjmickelo@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Leo',
  'Woodfield',
  'Leo Woodfield',
  'leo.woodfield@outlook.com',
  null,
  array['Hip Hop']::text[],
  null,
  '0432977793',
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=2463075997323945&set=pcb.2463076067323938',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('leo.woodfield@outlook.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Leah',
  'Geddes',
  'Leah Geddes',
  'leahgeddes.raw@gmail.com',
  null,
  array['Hip Hop']::text[],
  null,
  '0401 733 802',
  '{}'::text[],
  'Brisbane, Ipswich',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('leahgeddes.raw@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Kim',
  'Smit',
  'Kim Smit',
  'kimberleysmit0@gmail.com',
  null,
  array['Hip Hop', 'Commercial Jazz']::text[],
  null,
  '0431 874 220',
  '{}'::text[],
  'http://bookaninstructor.com/wp-content/uploads/2023/08/35.png',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('kimberleysmit0@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Kaushalya',
  'Harasgama',
  'Kaushalya Harasgama',
  'sldancefoundation@gmail.com',
  null,
  array['Sri Lankan']::text[],
  null,
  '0499 422 266',
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=4470895306299738&set=a.309365675786076',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('sldancefoundation@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Katherine',
  'Jarowicki',
  'Katherine Jarowicki',
  'katherinejarowicki@googlemail.com',
  null,
  array['Contemporary', 'Jazz']::text[],
  null,
  null,
  '{}'::text[],
  'Okay',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('katherinejarowicki@googlemail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Jill',
  null,
  'Jill',
  'chewjill96@gmail.com',
  null,
  array['Contemporary']::text[],
  null,
  null,
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('chewjill96@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'James',
  'Quinn-Hawtin',
  'James Quinn-Hawtin',
  'james@danceculture.com.au',
  null,
  array['Salsa', 'Zouk']::text[],
  null,
  '0497 100 350',
  '{}'::text[],
  'https://www.facebook.com/jquinnhawtin/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('james@danceculture.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Jade',
  'Nicholson',
  'Jade Nicholson',
  'werqit@hoopsthighsbuttocks.com',
  null,
  array['Dance', 'circus and fitness professional']::text[],
  null,
  '0435 236 316',
  '{}'::text[],
  'https://www.linkedin.com/in/jade-nicholson-01/overlay/photo/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('werqit@hoopsthighsbuttocks.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Holly',
  'Wodetzki',
  'Holly Wodetzki',
  'holly@shivashaktidance.com',
  null,
  array['Sensual Embodied Dance']::text[],
  null,
  '0437 304 576',
  '{}'::text[],
  'https://www.instagram.com/p/C-_yKaASnJ5/?hl=en&img_index=1',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('holly@shivashaktidance.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Helena',
  'Joshi',
  'Helena Joshi',
  'Kathak@infinitykathak.com',
  null,
  array['Kathak Dance']::text[],
  null,
  '0435 514 251',
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=737852287450874&set=a.737852250784211',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('Kathak@infinitykathak.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Heidi',
  'Owen',
  'Heidi Owen',
  'heidi@skatepink.com.au',
  null,
  array['Roller Skating']::text[],
  null,
  '0418 799 145',
  '{}'::text[],
  'https://www.instagram.com/heyheidigirl/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('heidi@skatepink.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Hannah',
  'Rasenberger',
  'Hannah Rasenberger',
  'hannahrasenberger.raw@gmail.com',
  null,
  array['Contemporary', 'Commercial Jazz']::text[],
  null,
  null,
  '{}'::text[],
  'https://www.howellmgmt.com.au/portfolio/howell-extras-new-south-wales/all/2499191/hannah-rasenberger/resume?bf=1&i=2',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('hannahrasenberger.raw@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Hannah',
  'Gray',
  'Hannah Gray',
  'lecheileirishdance@gmail.com',
  null,
  array['Irish Dance']::text[],
  null,
  '0481 392 904',
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=3572401456163749&set=pb.100063985360417.-2207520000',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('lecheileirishdance@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Hannah',
  'Groom',
  'Hannah Groom',
  'hannahgroom@outlook.com',
  '23/03/2000',
  '{}'::text[],
  null,
  '0490754504',
  '{}'::text[],
  'https://www.linkedin.com/in/hannah-groom-7861a3212/overlay/photo/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('hannahgroom@outlook.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Grace',
  'Bartlett',
  'Grace Bartlett',
  'gracebartlettraw@gmail.com',
  null,
  array['Commercial Jazz', 'Fosse Jazz']::text[],
  null,
  null,
  '{}'::text[],
  'https://www.instagram.com/gracekbartlett/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('gracebartlettraw@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Georgia',
  'Pierce',
  'Georgia Pierce',
  'georgiapierce@live.com',
  null,
  '{}'::text[],
  null,
  null,
  '{}'::text[],
  'https://www.instagram.com/p/CrKk5cxvglx/?img_index=2',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('georgiapierce@live.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Fiona',
  'Johnson',
  'Fiona Johnson',
  'fiona.johnson@tapfit.com',
  null,
  array['Tap']::text[],
  null,
  '0423 203 714',
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('fiona.johnson@tapfit.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Eva',
  'Malteaser',
  'Eva Malteaser',
  'evamalteaser@yahoo.com.au',
  null,
  array['Burlesque']::text[],
  null,
  '0488 775 687',
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=1009583026655414&set=a.111745283105864',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('evamalteaser@yahoo.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Emma',
  'Hadfield',
  'Emma Hadfield',
  'emma@cornerpocketswing.com.au',
  null,
  array['Swing']::text[],
  null,
  '0421 106 487',
  '{}'::text[],
  'https://www.facebook.com/photo.php?fbid=10152758551950809&set=pb.670915808.-2207520000&type=3',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('emma@cornerpocketswing.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Emma',
  null,
  'Emma',
  'Hiphulahoophooray@gmail.com',
  null,
  array['Hooping', 'circus and fitness']::text[],
  null,
  null,
  '{}'::text[],
  'https://www.instagram.com/emma.j_black/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('Hiphulahoophooray@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Emma',
  'Chow',
  'Emma Chow',
  '2emma.chow@gmail.com',
  null,
  array['Jazz', 'Contemporary']::text[],
  null,
  null,
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('2emma.chow@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Donna',
  'Zakura',
  'Donna Zakura',
  'donnazakura@gmail.com',
  null,
  array['Yoga']::text[],
  null,
  null,
  '{}'::text[],
  'https://www.instagram.com/donna_zakura/?hl=en',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('donnazakura@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Dion',
  'Apirana',
  'Dion Apirana',
  'd.apirana.kc@gmail.com',
  null,
  array['Hip Hop']::text[],
  null,
  '0423852590',
  '{}'::text[],
  'IMG_2916.JPG',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('d.apirana.kc@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Dee',
  'Thompson',
  'Dee Thompson',
  'dee@tribalblossoms.com',
  null,
  array['Belly Dance']::text[],
  null,
  '0402 148 910',
  '{}'::text[],
  'https://www.linkedin.com/in/dee-thomson/overlay/photo/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('dee@tribalblossoms.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Darcie',
  'Rae',
  'Darcie Rae',
  'darcie.rae@hotmail.com',
  null,
  array['Aerial']::text[],
  null,
  '0403 720 255',
  '{}'::text[],
  'https://www.instagram.com/p/ClLYgspvIwC/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('darcie.rae@hotmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Dana',
  'Coles',
  'Dana Coles',
  'danapaige@optusnet.com.au',
  '01/10/1996',
  array['Lyrical', 'Contemporary', 'Jazz']::text[],
  null,
  '0411259998',
  '{}'::text[],
  'Okay',
  null,
  '1371071/2',
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('danapaige@optusnet.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Connor',
  'Miller',
  'Connor Miller',
  'connormiller93@gmail.com',
  '1/2/1998',
  array['Ballet', 'Musical Theatre', 'HipHop']::text[],
  null,
  '0401889019',
  '{}'::text[],
  'https://www.facebook.com/104948441873499/photos/a.134046088963734/200606122307730/?type=3',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('connormiller93@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Chloe',
  'Loh',
  'Chloe Loh',
  'info@paradizodance.com.au',
  null,
  array['Latin Dance']::text[],
  null,
  '0402 695 541',
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=10154608934194488&set=a.10154608944164488',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('info@paradizodance.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Bruno & Sarah',
  'Ferreira',
  'Bruno & Sarah Ferreira',
  'info@bossalatina.com.au',
  null,
  array['Salsa', 'Zouk']::text[],
  null,
  null,
  '{}'::text[],
  'https://www.instagram.com/p/CalDDyAFW9P/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('info@bossalatina.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Brie',
  null,
  'Brie',
  'brie@spiritrisingyoga.com.au',
  null,
  array['Yoga']::text[],
  null,
  null,
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=1888042181255754&set=a.246960063568442',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('brie@spiritrisingyoga.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Brendan',
  'Hodder',
  'Brendan Hodder',
  'brendanchristoph@gmail.com',
  null,
  array['Jazz', 'Contemporary', 'Fosse Jazz', 'Musical Theatre']::text[],
  null,
  '0423062143',
  '{}'::text[],
  'https://www.instagram.com/p/Ch68D_5orjS/?hl=en',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('brendanchristoph@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Brandon',
  'Skapa',
  'Brandon Skapa',
  'brandonskapa@gmail.com',
  null,
  array['Musical Theatre']::text[],
  null,
  null,
  '{}'::text[],
  'https://www.instagram.com/scottogierfreelance/p/Cf85IL4hcYI/?img_index=1',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('brandonskapa@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Bodie',
  'Fullerton',
  'Bodie Fullerton',
  'info@sundaysessionsproseries.com',
  'MERMAID BEACH, 4218',
  array['Comercial Jazz']::text[],
  null,
  '0423628955',
  '{}'::text[],
  'http://bookaninstructor.com/wp-content/uploads/2023/08/39.png',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('info@sundaysessionsproseries.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Berenice',
  'Tan',
  'Berenice Tan',
  'berenice.tan@delvemeditation.com.au',
  null,
  array['Yoga']::text[],
  null,
  null,
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=10159448525291464&set=a.426785121463',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('berenice.tan@delvemeditation.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Beck',
  'Hall',
  'Beck Hall',
  'beck@spiritbreathwork.com',
  null,
  array['Yoga']::text[],
  null,
  '0400 576 960',
  '{}'::text[],
  'https://www.facebook.com/photo?fbid=10159585779606860&set=a.440144196859',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('beck@spiritbreathwork.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Ashton',
  'Gyde',
  'Ashton Gyde',
  'ashtongydeinfo@gmail.com',
  '01/09/2003',
  array['Hip Hop']::text[],
  null,
  '0426167255',
  '{}'::text[],
  'https://www.instagram.com/p/CNo0Rc0hEX0/?img_index=1',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('ashtongydeinfo@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Ashlee',
  'Lawson',
  'Ashlee Lawson',
  'ashlee.lawson13@gmail.com',
  '13/06/86',
  array['Jazz', 'Contemporary', 'Lyrical']::text[],
  null,
  '0408 845 288',
  '{}'::text[],
  'http://bookaninstructor.com/wp-content/uploads/2023/08/22.png',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('ashlee.lawson13@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Ash',
  'Gauci',
  'Ash Gauci',
  'ashleighgauci@bigpond.com',
  null,
  array['Popping', 'Locking', 'Burlesque']::text[],
  null,
  null,
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=2803106066424753&set=a.104187539649966',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('ashleighgauci@bigpond.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Arturo',
  'Flores',
  'Arturo Flores',
  'imarturoflores@gmail.com',
  null,
  '{}'::text[],
  null,
  '0466 895 462',
  '{}'::text[],
  'https://www.facebook.com/badboyofsalsa/photos/pb.100063556542202.-2207520000/621353321408970/?type=3',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('imarturoflores@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Anna',
  'Johnston',
  'Anna Johnston',
  'annaleahjohnston@gmail.com',
  null,
  '{}'::text[],
  null,
  '0413551551',
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=689491869849760&set=a.448884150577201',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('annaleahjohnston@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Angelique',
  'Marie',
  'Angelique Marie',
  'evokedanceandtheatre@gmail.com',
  null,
  array['Cabaret']::text[],
  null,
  '0423 386 355',
  '{}'::text[],
  'https://www.instagram.com/p/Clib3o4vT-w/',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('evokedanceandtheatre@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Andrea',
  'Lam',
  'Andrea Lam',
  'hello@dancemasala.com.au',
  null,
  array['Indian', 'Bollywood']::text[],
  null,
  null,
  '{}'::text[],
  'https://images.squarespace-cdn.com/content/v1/6405be1a30109a4f6456fa5a/df1e2e43-48ed-4c04-9199-af5e335b229e/Andrea_Lam.png?format=500w',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('hello@dancemasala.com.au'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Anandi',
  'De Waal',
  'Anandi De Waal',
  'anandidw@gmail.com',
  null,
  '{}'::text[],
  null,
  '0408757313',
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('anandidw@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Amy',
  'Kauler',
  'Amy Kauler',
  'amy.kauler@gmail.com',
  null,
  '{}'::text[],
  null,
  '0420 988 185',
  '{}'::text[],
  null,
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('amy.kauler@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Amy',
  'Mcinturff',
  'Amy Mcinturff',
  'amcin103@gmail.com',
  '24/11/2001',
  array['Commercial Jazz']::text[],
  null,
  '0466672559',
  '{}'::text[],
  'https://i0.wp.com/bookaninstructor.com/wp-content/uploads/2023/08/1-3.png?resize=300%2C250&ssl=1',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('amcin103@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Alex',
  null,
  'Alex',
  'aussietwerk@gmail.com',
  null,
  array['Twerk']::text[],
  null,
  null,
  '{}'::text[],
  'https://www.facebook.com/photo/?fbid=2005778776335113&set=a.587147636107561',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('aussietwerk@gmail.com'));
insert into public.instructors
  (first_name, last_name, name, email, location, categories, bio, mobile, service_areas, headshot_url, working_with_children_card, working_with_children_expiry, terms_accepted, approved)
select
  'Alex',
  'Shelley',
  'Alex Shelley',
  'alexshelley365@gmail.com',
  null,
  array['Hip Hop', 'Break Dance']::text[],
  null,
  '0434 648 048',
  '{}'::text[],
  'http://bookaninstructor.com/wp-content/uploads/2023/08/27.png',
  null,
  null,
  false,
  false
where not exists (select 1 from public.instructors where lower(email) = lower('alexshelley365@gmail.com'));
