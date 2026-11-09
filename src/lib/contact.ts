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

// Subject line for the notification email, so the inbox shows the request
// type and sender at a glance. Netlify uses a field named "subject" for it.
const subjectTypes: Record<string, string> = { program: 'Program', proposal: 'Proposal', startup: 'Startup', website: 'Website' };
export function emailSubject(audience: string, name: string, org: string): string {
  const type = subjectTypes[audience];
  const who = [name.trim(), org.trim()].filter(Boolean).join(', ');
  return `Website inquiry${type ? `: ${type}` : ''} from ${who}`;
}
