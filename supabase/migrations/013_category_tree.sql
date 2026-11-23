-- Jiji-style category tree: parent_slug, depth, aliases, seed, legacy remap.

alter table categories
  add column if not exists parent_slug text references categories (slug),
  add column if not exists depth smallint not null default 0;

alter table categories drop constraint if exists categories_label_check;
alter table categories
  add constraint categories_label_check
  check (char_length(trim(label)) between 2 and 60);

alter table categories drop constraint if exists categories_depth_check;
alter table categories
  add constraint categories_depth_check check (depth >= 0 and depth <= 3);

alter table categories drop constraint if exists categories_parent_not_self;
alter table categories
  add constraint categories_parent_not_self check (parent_slug is null or parent_slug <> slug);

create table if not exists category_aliases (
  alias_slug text primary key,
  canonical_slug text not null references categories (slug) on delete cascade,
  note text
);

-- Roots (new); existing rows updated below.
insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order, parent_slug, depth)
values
  ('vehicles', 'Vehicles', 'official', 'cars', true, false, 10, null, 0),
  ('real-estate', 'Real Estate', 'official', 'property', true, false, 20, null, 0),
  ('mobile-phones-tablets', 'Mobile Phones & Tablets', 'official', 'shop', true, true, 30, null, 0),
  ('electronics', 'Electronics', 'official', 'shop', true, true, 40, null, 0),
  ('home-garden', 'Home, Furniture & Appliances', 'official', 'shop', true, true, 50, null, 0),
  ('fashion-and-beauty', 'Fashion & Beauty', 'official', 'shop', true, true, 60, null, 0),
  ('health-and-beauty', 'Health & Beauty', 'official', 'shop', true, true, 70, null, 0),
  ('babies-and-kids', 'Babies & Kids', 'official', 'shop', true, true, 80, null, 0),
  ('animals-and-pets', 'Animals & Pets', 'official', 'shop', true, true, 90, null, 0),
  ('agriculture-and-foodstuff', 'Agriculture & Food', 'official', 'shop', true, true, 100, null, 0),
  ('hobbies-art-sport', 'Hobbies, Sports & Outdoors', 'official', 'shop', true, true, 110, null, 0),
  ('office-and-commercial-equipment-tools', 'Commercial Equipment', 'official', 'shop', true, true, 120, null, 0),
  ('repair-and-construction', 'Repair & Construction', 'official', 'services', true, true, 130, null, 0),
  ('business-and-industry', 'Business & Industry', 'official', 'shop', true, true, 140, null, 0),
  ('jobs', 'Jobs', 'official', 'services', true, false, 150, null, 0),
  ('seeking-work-cvs', 'Seeking Work & CVs', 'official', 'services', true, false, 160, null, 0)
on conflict (slug) do update
set label = excluded.label,
    listing_mode = excluded.listing_mode,
    parent_slug = excluded.parent_slug,
    depth = excluded.depth,
    sort_order = excluded.sort_order;

update categories
set parent_slug = null, depth = 0
where slug in ('services', 'stays', 'taxi', 'rider');

-- Nest legacy cars under vehicles.
update categories
set parent_slug = 'vehicles', depth = 1, sort_order = 12
where slug = 'cars';

insert into categories (slug, label, kind, listing_mode, visible, open_for_apply, sort_order, parent_slug, depth)
values
  ('buses', 'Buses', 'official', 'cars', true, false, 11, 'vehicles', 1),
  ('car-parts-and-accessories', 'Car Parts & Accessories', 'official', 'cars', true, false, 13, 'vehicles', 1),
  ('motorcycles-and-scooters', 'Motorcycles & Scooters', 'official', 'cars', true, false, 14, 'vehicles', 1),
  ('houses-apartments-for-rent', 'Houses & Apartments for Rent', 'official', 'property', true, false, 21, 'real-estate', 1),
  ('houses-apartments-for-sale', 'Houses & Apartments for Sale', 'official', 'property', true, false, 22, 'real-estate', 1),
  ('new-builds', 'New Builds', 'official', 'property', true, false, 23, 'real-estate', 1),
  ('temporary-and-vacation-rentals', 'Short-term & Vacation Rentals', 'official', 'property', true, false, 24, 'real-estate', 1),
  ('cell-phones-tablets-accessories', 'Phone & Tablet Accessories', 'official', 'shop', true, true, 31, 'mobile-phones-tablets', 1),
  ('mobile-phones', 'Mobile Phones', 'official', 'shop', true, true, 32, 'mobile-phones-tablets', 1),
  ('smart-watches', 'Smart Watches', 'official', 'shop', true, true, 33, 'mobile-phones-tablets', 1),
  ('tablets', 'Tablets', 'official', 'shop', true, true, 34, 'mobile-phones-tablets', 1),
  ('audio-and-music-equipment', 'Audio & Music Equipment', 'official', 'shop', true, true, 41, 'electronics', 1),
  ('computers-and-laptops', 'Computers & Laptops', 'official', 'shop', true, true, 42, 'electronics', 1),
  ('tv-dvd-equipment', 'TV & DVD Equipment', 'official', 'shop', true, true, 43, 'electronics', 1),
  ('video-games-and-consoles', 'Video Games & Consoles', 'official', 'shop', true, true, 44, 'electronics', 1),
  ('decor-accessories', 'Decor & Accessories', 'official', 'shop', true, true, 51, 'home-garden', 1),
  ('furniture', 'Furniture', 'official', 'shop', true, true, 52, 'home-garden', 1),
  ('lighting', 'Lighting', 'official', 'shop', true, true, 53, 'home-garden', 1),
  ('storage-organization', 'Storage & Organization', 'official', 'shop', true, true, 54, 'home-garden', 1),
  ('baby-kids-fashion', 'Baby & Kids Fashion', 'official', 'shop', true, true, 61, 'fashion-and-beauty', 1),
  ('mens-fashion', 'Men''s Fashion', 'official', 'shop', true, true, 62, 'fashion-and-beauty', 1),
  ('womens-fashion', 'Women''s Fashion', 'official', 'shop', true, true, 63, 'fashion-and-beauty', 1),
  ('bath-body', 'Bath & Body', 'official', 'shop', true, true, 71, 'health-and-beauty', 1),
  ('hair-beauty', 'Hair & Beauty', 'official', 'shop', true, true, 72, 'health-and-beauty', 1),
  ('oral-care', 'Oral Care', 'official', 'shop', true, true, 73, 'health-and-beauty', 1),
  ('skin-care', 'Skin Care', 'official', 'shop', true, true, 74, 'health-and-beauty', 1),
  ('childrens-clothing', 'Children''s Clothing', 'official', 'shop', true, true, 81, 'babies-and-kids', 1),
  ('childrens-furniture', 'Children''s Furniture', 'official', 'shop', true, true, 82, 'babies-and-kids', 1),
  ('childrens-shoes', 'Children''s Shoes', 'official', 'shop', true, true, 83, 'babies-and-kids', 1),
  ('toys', 'Toys', 'official', 'shop', true, true, 84, 'babies-and-kids', 1),
  ('cats-and-kittens', 'Cats & Kittens', 'official', 'shop', true, true, 91, 'animals-and-pets', 1),
  ('dogs-and-puppies', 'Dogs & Puppies', 'official', 'shop', true, true, 92, 'animals-and-pets', 1),
  ('fish', 'Fish', 'official', 'shop', true, true, 93, 'animals-and-pets', 1),
  ('pets-accessories', 'Pets Accessories', 'official', 'shop', true, true, 94, 'animals-and-pets', 1),
  ('farm-machinery-equipment', 'Farm Machinery', 'official', 'shop', true, true, 101, 'agriculture-and-foodstuff', 1),
  ('feeds-supplements-seeds', 'Feeds, Supplements & Seeds', 'official', 'shop', true, true, 102, 'agriculture-and-foodstuff', 1),
  ('livestock-and-poultry', 'Livestock & Poultry', 'official', 'shop', true, true, 103, 'agriculture-and-foodstuff', 1),
  ('meals-and-drinks', 'Meals & Drinks', 'official', 'shop', true, true, 104, 'agriculture-and-foodstuff', 1),
  ('massagers', 'Massagers', 'official', 'shop', true, true, 111, 'hobbies-art-sport', 1),
  ('musical-instruments', 'Musical Instruments', 'official', 'shop', true, true, 112, 'hobbies-art-sport', 1),
  ('personal-mobility', 'Personal Mobility', 'official', 'shop', true, true, 113, 'hobbies-art-sport', 1),
  ('sports-bicycles-and-fitness', 'Sports, Bicycles & Fitness', 'official', 'shop', true, true, 114, 'hobbies-art-sport', 1),
  ('manufacturing-equipments', 'Manufacturing Equipment', 'official', 'shop', true, true, 121, 'office-and-commercial-equipment-tools', 1),
  ('manufacturing-materials-and-tools', 'Materials & Tools', 'official', 'shop', true, true, 122, 'office-and-commercial-equipment-tools', 1),
  ('medical-equipment', 'Medical Equipment', 'official', 'shop', true, true, 123, 'office-and-commercial-equipment-tools', 1),
  ('safety-equipment', 'Safety Equipment', 'official', 'shop', true, true, 124, 'office-and-commercial-equipment-tools', 1),
  ('building-materials', 'Building Materials', 'official', 'services', true, true, 131, 'repair-and-construction', 1),
  ('plumbing-and-water-supply', 'Plumbing & Water Supply', 'official', 'services', true, true, 132, 'repair-and-construction', 1),
  ('power-equipments', 'Power Equipment', 'official', 'services', true, true, 133, 'repair-and-construction', 1),
  ('power-tools', 'Power Tools', 'official', 'services', true, true, 134, 'repair-and-construction', 1),
  ('business-for-sale-and-investment', 'Business for Sale', 'official', 'shop', true, true, 141, 'business-and-industry', 1),
  ('business-services', 'Business Services', 'official', 'shop', true, true, 142, 'business-and-industry', 1),
  ('import-export-and-logistics', 'Import, Export & Logistics', 'official', 'shop', true, true, 143, 'business-and-industry', 1),
  ('wholesale-and-bulk', 'Wholesale & Bulk', 'official', 'shop', true, true, 144, 'business-and-industry', 1),
  ('general-merchandise', 'General Merchandise', 'official', 'shop', true, true, 145, 'business-and-industry', 1),
  ('accounting-and-finance-jobs', 'Accounting & Finance Jobs', 'official', 'services', true, false, 151, 'jobs', 1),
  ('advertising-and-marketing-jobs', 'Advertising & Marketing Jobs', 'official', 'services', true, false, 152, 'jobs', 1),
  ('arts-and-entertainment-jobs', 'Arts & Entertainment Jobs', 'official', 'services', true, false, 153, 'jobs', 1),
  ('childcare-and-babysitting-jobs', 'Childcare & Babysitting Jobs', 'official', 'services', true, false, 154, 'jobs', 1),
  ('accounting-and-finance-cvs', 'Accounting & Finance CVs', 'official', 'services', true, false, 161, 'seeking-work-cvs', 1),
  ('advertising-and-marketing-cvs', 'Advertising & Marketing CVs', 'official', 'services', true, false, 162, 'seeking-work-cvs', 1),
  ('arts-and-entertainment-cvs', 'Arts & Entertainment CVs', 'official', 'services', true, false, 163, 'seeking-work-cvs', 1),
  ('childcare-and-babysitting-cvs', 'Childcare & Babysitting CVs', 'official', 'services', true, false, 164, 'seeking-work-cvs', 1),
  ('automotive-services', 'Automotive Services', 'official', 'services', true, true, 171, 'services', 1),
  ('building-and-trades-services', 'Building & Trades', 'official', 'services', true, true, 172, 'services', 1),
  ('computer-and-it-services', 'Computer & IT Services', 'official', 'services', true, true, 173, 'services', 1),
  ('repair-services', 'Repair Services', 'official', 'services', true, true, 174, 'services', 1),
  ('bnb-apartments', 'BnBs & Apartments', 'official', 'shop', true, true, 181, 'stays', 1),
  ('hotels', 'Hotels', 'official', 'shop', true, true, 182, 'stays', 1),
  ('short-stays', 'Short Stays', 'official', 'shop', true, true, 183, 'stays', 1),
  ('all-stays', 'All Stays', 'official', 'shop', true, true, 184, 'stays', 1),
  ('airport-rides', 'Airport Rides', 'official', 'services', true, true, 191, 'taxi', 1),
  ('town-rides', 'Town Rides', 'official', 'services', true, true, 192, 'taxi', 1),
  ('boda', 'Boda', 'official', 'services', true, true, 193, 'taxi', 1),
  ('all-taxi', 'All Taxi', 'official', 'services', true, true, 194, 'taxi', 1),
  ('delivery-rider', 'Delivery Rider', 'official', 'services', true, true, 196, 'rider', 1),
  ('courier', 'Courier', 'official', 'services', true, true, 197, 'rider', 1),
  ('boda-rider', 'Boda Rider', 'official', 'services', true, true, 198, 'rider', 1),
  ('all-riders', 'All Riders', 'official', 'services', true, true, 199, 'rider', 1)
on conflict (slug) do update
set label = excluded.label,
    listing_mode = excluded.listing_mode,
    parent_slug = excluded.parent_slug,
    depth = excluded.depth,
    sort_order = excluded.sort_order,
    visible = true;

-- Legacy product remap.
update products set category = 'general-merchandise' where category = 'shop';

update products set category = 'houses-apartments-for-rent'
where category = 'property'
  and coalesce(attributes->>'intent', attributes->>'type', '') ilike '%rent%';

update products set category = 'houses-apartments-for-sale'
where category = 'property';

update products set category = 'repair-services' where category = 'services';

update products set category = 'bnb-apartments' where category = 'stays';

update products set category = 'airport-rides' where category = 'taxi';

update products set category = 'delivery-rider' where category = 'rider';

-- Vendor profile roots.
update vendors v
set categories = mapped.cats
from (
  select v2.id,
    array(
      select distinct case u
        when 'shop' then 'business-and-industry'
        when 'property' then 'real-estate'
        when 'cars' then 'vehicles'
        else u
      end
      from unnest(v2.categories) as u
    ) as cats
  from vendors v2
) mapped
where v.id = mapped.id;

-- Community rows hang under business-and-industry.
update categories
set parent_slug = 'business-and-industry', depth = 1
where kind = 'community' and parent_slug is null;

insert into category_aliases (alias_slug, canonical_slug, note)
values
  ('shop', 'business-and-industry', 'legacy flat shop'),
  ('property', 'real-estate', 'legacy flat property')
on conflict (alias_slug) do nothing;

update categories set visible = false, open_for_apply = false
where slug in ('shop', 'property');

update categories
set open_for_apply = true
where kind = 'official' and depth = 0 and slug not in ('jobs', 'seeking-work-cvs', 'vehicles', 'real-estate');