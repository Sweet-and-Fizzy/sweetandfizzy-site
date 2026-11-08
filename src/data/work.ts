import { getCollection, type CollectionEntry } from 'astro:content';

export type Work = CollectionEntry<'work'>;

export async function getPhase1Work(): Promise<Work[]> {
  const all = await getCollection('work', (e) => e.data.phase === 1);
  return all.sort((a, b) => a.data.order - b.data.order);
}
