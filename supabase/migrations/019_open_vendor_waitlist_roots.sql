-- Open official roots that showed as "(soon)" on vendor apply (Sell on NakuruHub).
update categories
set open_for_apply = true
where kind = 'official'
  and depth = 0
  and slug in ('vehicles', 'real-estate', 'jobs', 'seeking-work-cvs');