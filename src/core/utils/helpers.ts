import { SelectQueryBuilder } from 'typeorm';

export function applyDynamicConditions(
  qb: SelectQueryBuilder<any>,
  conditions: { [key: string]: any },
): SelectQueryBuilder<any> {
  Object.keys(conditions).forEach((key) => {
    qb.andWhere(`${key} = :${key}`, { [key]: conditions[key] });
  });
  return qb;
}

export function buildFilters(query: Record<string, any>) {
  const filters: Record<string, any> = {};
  for (const [key, value] of Object.entries(query)) {
    if (value) {
      filters[key] = value; // Add your filtering logic here if necessary
    }
  }
  return filters;
}
