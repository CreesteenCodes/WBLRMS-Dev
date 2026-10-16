export async function prioritizeMaintenance(items: Array<{ id: string; name: string; condition: string; lastInspection?: string }>) {
  return items
    .map((item, index) => ({
      ...item,
      priority: index + 1,
      score: item.condition === 'Poor' ? 95 : item.condition === 'Fair' ? 70 : 45,
      recommendation: item.condition === 'Poor' ? 'Immediate repair' : item.condition === 'Fair' ? 'Schedule maintenance' : 'Routine monitoring',
    }))
    .sort((a, b) => b.score - a.score);
}
