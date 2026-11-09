export const site = {
  name: 'Sweet & Fizzy Digital',
  email: 'hello@sweetandfizzy.com',
  city: 'Florence, MA',
  gtm: 'GTM-TZHC8GN',
  services: [
    { label: 'AI agents and integrations', href: '/services/ai-agents/' },
    { label: 'Connect.CI platform', href: '/connect-ci/' },
  ],
  nav: [
    { label: 'Case stories', href: '/work/' },
    { label: 'Publications', href: '/publications/' },
  ],
  footer: [
    { label: 'Contact', href: '/contact/' },
    { label: 'Planning a proposal?', href: '/planning-a-proposal/' },
    { label: 'Case stories', href: '/work/' },
    { label: 'Publications', href: '/publications/' },
    { label: 'Privacy', href: '/privacy/' },
    { label: 'Accessibility', href: '/accessibility/' },
  ],
  social: {
    github: 'https://github.com/Sweet-and-Fizzy',
    linkedin: 'https://www.linkedin.com/company/sweet-and-fizzy/',
  },
} as const;
