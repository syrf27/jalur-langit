export { cn } from "cn";

/** Reads a category name from the shapes Supabase returns for joined relations. */
export function categoryName(category: unknown): string {
	if (typeof category === 'string') return category;
	if (Array.isArray(category)) {
		const first = category[0];
		return first && typeof first === 'object' && 'name' in first ? String(first.name) : 'Ibadah';
	}
	return category && typeof category === 'object' && 'name' in category ? String(category.name) : 'Ibadah';
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };
