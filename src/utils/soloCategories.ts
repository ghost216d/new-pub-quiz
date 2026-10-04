export const normalizeSoloCategory = <T extends { name: string }>(
  selectedName: string,
  categories: T[],
): string => categories.some((category) => category.name === selectedName)
  ? selectedName
  : categories[0]?.name || 'General Knowledge';
