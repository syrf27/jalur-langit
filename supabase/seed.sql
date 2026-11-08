-- Default content for a fresh Jalur Langit database.
insert into ibadah_categories (name, icon, color, sort_order)
select name, icon, color, sort_order
from (values
	('Shalat Wajib', 'moon', '#173F35', 1),
	('Shalat Sunnah', 'sparkles', '#C6A46A', 2),
	('Al-Qur''an', 'book-open', '#6B8F71', 3),
	('Dzikir dan Doa', 'heart', '#8A9A91', 4),
	('Puasa', 'sun', '#B28A52', 5),
	('Amal Kebaikan', 'hand-heart', '#66849B', 6)
) as defaults(name, icon, color, sort_order)
where not exists (select 1 from ibadah_categories c where c.name = defaults.name);

insert into ibadah_activities (category_id, name, sort_order)
select c.id, a.name, a.sort_order
from ibadah_categories c
join (values
	('Shalat Wajib', 'Subuh', 1),
	('Shalat Wajib', 'Dzuhur', 2),
	('Shalat Wajib', 'Ashar', 3),
	('Shalat Wajib', 'Maghrib', 4),
	('Shalat Wajib', 'Isya', 5),
	('Shalat Sunnah', 'Tahajud', 1),
	('Shalat Sunnah', 'Dhuha', 2),
	('Al-Qur''an', 'Membaca Al-Qur''an', 1),
	('Dzikir dan Doa', 'Dzikir pagi', 1),
	('Dzikir dan Doa', 'Dzikir petang', 2),
	('Amal Kebaikan', 'Sedekah', 1)
) as a(name, activity_name, sort_order) on c.name = a.name
where not exists (
	select 1 from ibadah_activities existing
	where existing.category_id = c.id and existing.name = a.activity_name
);
