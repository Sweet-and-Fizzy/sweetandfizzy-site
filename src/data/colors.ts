export const brand = { blue: '#5abdff', orange: '#ef4326', yellow: '#fcee21' } as const;
export type BrandColor = keyof typeof brand;
