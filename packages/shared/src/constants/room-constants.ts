export const ROOMS_QUERY_KEY = {
  sidebar: ['rooms', 'sidebar'] as const,
  all: ['rooms', 'all'] as const,
};

export const roomExpiryOptions = [
  '10m',
  '30m',
  '1h',
  '6h',
  '12h',
  '3d',
  '7d',
  'never',
] as const;
