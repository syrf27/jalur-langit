export type LocalActivity = { id: string; name: string; category: string; time: string; done: boolean };
export type LocalHajat = { id: string; title: string; description: string; category: string; status: string; targetDate: string };
export type LocalJournal = { id: string; title: string; content: string; category: string; mood: string; entryDate: string };

export const defaultActivities: LocalActivity[] = [
	{ id: 'subuh', name: 'Shalat Subuh', category: 'Shalat wajib', time: '04:35', done: true },
	{ id: 'dzikir-pagi', name: 'Dzikir pagi', category: 'Dzikir & doa', time: '05:10', done: true },
	{ id: 'quran', name: 'Membaca Al-Qur’an', category: 'Al-Qur’an', time: '06:30', done: false },
	{ id: 'dzuhur', name: 'Shalat Dzuhur', category: 'Shalat wajib', time: '12:00', done: false },
	{ id: 'ashar', name: 'Shalat Ashar', category: 'Shalat wajib', time: '15:15', done: false },
	{ id: 'maghrib', name: 'Shalat Maghrib', category: 'Shalat wajib', time: '17:55', done: false }
];

function read<T>(key: string, fallback: T): T {
	if (typeof window === 'undefined') return fallback;
	try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; } catch { return fallback; }
}
function write<T>(key: string, value: T) { if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value)); }
export const readActivities = () => read<LocalActivity[]>('jalur-langit-activities', defaultActivities);
export const writeActivities = (value: LocalActivity[]) => write('jalur-langit-activities', value);
export const readHajats = () => read<LocalHajat[]>('jalur-langit-hajats', []);
export const writeHajats = (value: LocalHajat[]) => write('jalur-langit-hajats', value);
export const readJournals = () => read<LocalJournal[]>('jalur-langit-journals', []);
export const writeJournals = (value: LocalJournal[]) => write('jalur-langit-journals', value);
