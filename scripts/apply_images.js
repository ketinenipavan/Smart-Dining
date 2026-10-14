import fs from 'fs';

// 1. Update mockData.ts
let mock = fs.readFileSync('src/data/mockData.ts', 'utf8');

mock = mock.replace(/\{ id: '(m\d+)',[\s\S]*?prep_time_minutes: \d+, customization_options: [^}]+\}/g, (block) => {
  const idMatch = block.match(/id: '(m\d+)'/);
  if (!idMatch) return block;
  const id = idMatch[1];
  return block.replace(/image_url: '[^']+'/, `image_url: '/images/dishes/${id}.jpg'`);
});

fs.writeFileSync('src/data/mockData.ts', mock, 'utf8');
console.log('src/data/mockData.ts updated successfully!');

// 2. Update seed.sql
let seed = fs.readFileSync('supabase/seed.sql', 'utf8');

seed = seed.replace(/\('(m1000000-0000-0000-0000-0000000000(\d{2}))',[\s\S]*?'\[.*?\]'::jsonb\)/g, (row, fullId, numStr) => {
  const num = parseInt(numStr, 10);
  const id = 'm' + num;
  return row.replace(/https:\/\/images\.unsplash\.com\/[^']+/g, `/images/dishes/${id}.jpg`);
});

fs.writeFileSync('supabase/seed.sql', seed, 'utf8');
console.log('supabase/seed.sql updated successfully!');
