// Tastings of the same tea on the same day are common — the hour is what tells
// two of them apart in a list, so every place that shows when a tasting was
// saved goes through here rather than formatting its own date.
export const formatDateTime = (value) => {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return date.toLocaleString('ru-RU', {
		day: 'numeric', month: 'long', year: 'numeric',
		hour: '2-digit', minute: '2-digit',
	});
};

// Short form for dense lists (the author line, admin cards).
export const formatShortDateTime = (value) => {
	if (!value) return '';
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return date.toLocaleString('ru-RU', {
		day: 'numeric', month: 'short', year: 'numeric',
		hour: '2-digit', minute: '2-digit',
	});
};

// Seconds as m:ss — the voice quota is counted in seconds but read in minutes.
export const formatMinutes = (seconds) => {
	const whole = Math.max(0, Math.round(Number(seconds) || 0));
	return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, '0')}`;
};

export const SLIDER_WEIGHT_DATA = [[0,0],[5,5],[10,10],[50,50]]
export const SLIDER_WATER_DATA = [[0,0],[100,100],[500,500],[1000,1000]]
export const SLIDER_TEMPERATURE_DATA = [[0,0],[25,25],[50,50],[90,90],[100,100]]
export const SLIDER_PRICE_DATA = [[0,0],[5,5],[14,14],[50,50],[100,100]]

