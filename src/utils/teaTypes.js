// Tea type labels as stored in the DB (same list as the Stage-1 selector).
export const teaTypeLabels = [
	'Зелёный чай (绿茶 - Lǜ chá)',
	'Белый чай (白茶 - Bái chá)',
	'Жёлтый чай (黄茶 - Huáng chá)',
	'Улун (乌龙茶 - Wūlóng chá)',
	'Красный чай (红茶 - Hóng chá)',
	'Чёрный чай (黑茶 - Hēi chá)',
	'Пуэр (普洱茶 - Pǔěr chá)',
	'Травяной чай (草药茶 - Cǎoyào chá)',
	'Фруктовый чай (水果茶 - Shuǐguǒ chá)',
	'Мате (马黛茶 - Mǎdài chá)',
];

// URL slug and short name per type, for /blog/type/:slug.
//
// Declared rather than derived: the stored labels carry Chinese and pinyin, so
// transliterating them produces neither a usable slug nor a readable heading.
// `label` must stay byte-identical to the list above — it is what the feed
// endpoint filters on (`?type=`), and a stored value that no longer matches
// silently returns an empty page rather than an error.
export const teaTypeSlugs = [
	{ slug: 'zelenyy-chay', short: 'Зелёный чай', label: teaTypeLabels[0] },
	{ slug: 'belyy-chay', short: 'Белый чай', label: teaTypeLabels[1] },
	{ slug: 'zheltyy-chay', short: 'Жёлтый чай', label: teaTypeLabels[2] },
	{ slug: 'ulun', short: 'Улун', label: teaTypeLabels[3] },
	{ slug: 'krasnyy-chay', short: 'Красный чай', label: teaTypeLabels[4] },
	{ slug: 'chernyy-chay', short: 'Чёрный чай', label: teaTypeLabels[5] },
	{ slug: 'puer', short: 'Пуэр', label: teaTypeLabels[6] },
	{ slug: 'travyanoy-chay', short: 'Травяной чай', label: teaTypeLabels[7] },
	{ slug: 'fruktovyy-chay', short: 'Фруктовый чай', label: teaTypeLabels[8] },
	{ slug: 'mate', short: 'Мате', label: teaTypeLabels[9] },
];

export const teaTypeBySlug = (slug) =>
	teaTypeSlugs.find((t) => t.slug === slug) || null;

export const teaTypeByLabel = (label) =>
	teaTypeSlugs.find((t) => t.label === label) || null;
