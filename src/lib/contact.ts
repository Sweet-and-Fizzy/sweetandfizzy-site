// Pure helpers for the contact form, shared by the page script and tests.
export const audiences = ['program', 'proposal', 'startup', 'website', 'other'] as const;
export type Audience = (typeof audiences)[number];

export function audienceFromQuery(search: string): Audience | '' {
  const a = new URLSearchParams(search).get('audience') ?? '';
  return (audiences as readonly string[]).includes(a) ? (a as Audience) : '';
}

// GA4 lead event, only after the form really sent (content plan build notes).
export function onSubmitResult(ok: boolean, audience: string, dataLayer: unknown[]): void {
  if (ok) dataLayer.push({ event: 'generate_lead', lead_source: audience || 'other' });
}
