import fs from 'fs';
import path from 'path';

// Curated list of exact Wikimedia Commons titles or direct verified URLs for all 53 dishes
const DISH_MAPPING = [
  // ANDHRA SPECIALS
  { id: 'm1',  name: 'Chicken Curry',           wikiFile: 'Chicken Curry with Roti(Indian Bread).jpg' },
  { id: 'm2',  name: 'Chicken Fry',             wikiFile: 'Spicy chicken dry roast.jpg' },
  { id: 'm3',  name: 'Gongura Chicken',         wikiFile: 'Steamed Rice with Gongura chicken.jpg' },
  { id: 'm4',  name: 'Prawns Curry',            wikiFile: 'Indian Shrimp Curry 1.jpg' },
  { id: 'm5',  name: 'Gongura Mutton',          wikiFile: 'Mutton curry Andhra.jpg' },
  { id: 'm6',  name: 'Mutton Fry',              wikiFile: 'Dry-Fry Mutton.jpg' },

  // HYDERABAD BIRYANI
  { id: 'm7',  name: 'Veg. Biryani',            wikiFile: 'Veg Curry Biriyani.jpg' },
  { id: 'm8',  name: 'Chicken Biryani',         wikiFile: 'Hyderabadi Chicken Biryani.jpg' },
  { id: 'm9',  name: 'Chicken Tikka Biryani',   wikiFile: 'Chicken tikka biryani.jpg' },
  { id: 'm10', name: 'Prawn Biryani',           wikiFile: 'Shrimp Biriyani.JPG' },
  { id: 'm11', name: 'Mutton Dum Biryani',      wikiFile: 'Mutton Dum biryani.jpg' },

  // SOUPS
  { id: 'm12', name: 'Tomato Soup',             wikiFile: 'Tomato soup.jpg' },
  { id: 'm13', name: 'Veg. Hot & Sour Soup',    wikiFile: 'Hot-and-Sour-Soup-Bowl.jpg' },
  { id: 'm14', name: 'Chicken Corn Soup',       wikiFile: 'Chicken sweet corn soup.jpg' },
  { id: 'm15', name: 'Chicken Hot & Sour Soup', directUrl: 'https://images.unsplash.com/photo-1547592180-85f173990554?w=800&auto=format&fit=crop&q=80' },

  // TANDOORI
  { id: 'm16', name: 'Tandoori Chicken (Full)', wikiFile: 'Tandoori Chicken 01.jpg' },
  { id: 'm17', name: 'Tandoori Chicken (Half)', wikiFile: 'Tandoori Chicken cooked in Melbourne.JPG' },
  { id: 'm18', name: 'Chicken Tikka',           wikiFile: 'Chicken Malai Tikka.JPG' },
  { id: 'm19', name: 'Kalmi Kebab',             wikiFile: 'Murg tangri kebab.jpg' },

  // VEG STARTERS
  { id: 'm20', name: 'Veg. Manchurian',         wikiFile: 'Manchurian.jpg' },
  { id: 'm21', name: 'Gobi Manchurian',         wikiFile: 'Home made crispy Gobi Manchurian.jpg' },
  { id: 'm22', name: 'Chilli Paneer',           wikiFile: 'Indian Style Chilly Paneer.jpg' },
  { id: 'm23', name: 'Paneer 65',               directUrl: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8?w=800&auto=format&fit=crop&q=80' },
  { id: 'm24', name: 'Veg Spring Rolls',        wikiFile: 'Golden Vegetable Spring Rolls Served with Dipping Sauce.jpg' },
  { id: 'm25', name: 'Baby Corn Manchurian',    wikiFile: 'Crispy chilli baby corn.....jpg' },

  // NON-VEG STARTERS
  { id: 'm26', name: 'Chicken 65',              wikiFile: 'Chicken 65 (Dish).jpg' },
  { id: 'm27', name: 'Chilli Chicken',          wikiFile: 'Chilli chicken pakoda.jpg' },
  { id: 'm28', name: 'Chicken Manchurian',      wikiFile: 'Chicken manchurian 02.JPG' },
  { id: 'm29', name: 'Ginger Prawns',           directUrl: 'https://images.unsplash.com/photo-1559742811-822863cb4cb0?w=800&auto=format&fit=crop&q=80' },
  { id: 'm30', name: 'Apollo Fish',             wikiFile: 'South-Indian Masala Fish Fry.jpg' },
  { id: 'm31', name: 'Pepper Chicken',          directUrl: 'https://images.unsplash.com/photo-1610057099443-fde8c4d50f91?w=800&auto=format&fit=crop&q=80' },

  // INDIAN CURRIES VEG
  { id: 'm32', name: 'Paneer Butter Masala',    wikiFile: 'Paneer butter masala 2.jpg' },
  { id: 'm33', name: 'Palak Paneer',            wikiFile: 'Palak Paneer (Cottage cheese in spinach gravy).jpg' },
  { id: 'm34', name: 'Shahi Paneer',            wikiFile: 'Shahi paneer and palak paneer.JPG' },
  { id: 'm35', name: 'Malai Kofta',             wikiFile: 'MalaiKofta.jpg' },
  { id: 'm36', name: 'Kadai Paneer',            wikiFile: 'Kadai Paneer Recipe.JPG' },

  // INDIAN CURRIES NON-VEG
  { id: 'm37', name: 'Butter Chicken',          wikiFile: 'Chicken makhani.jpg' },
  { id: 'm38', name: 'Kadai Chicken',           wikiFile: 'Chicken Masala - In Kadai.jpg' },
  { id: 'm39', name: 'Chicken Chettinad',       directUrl: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&auto=format&fit=crop&q=80' },
  { id: 'm40', name: 'Mutton Roghan Josh',      wikiFile: 'Mutton rogan josh.jpg' },
  { id: 'm41', name: 'Prawns Masala',           wikiFile: 'Masala Prawn.jpg' },

  // NOODLES & RICE
  { id: 'm42', name: 'Veg. Fried Rice',         wikiFile: 'Vegetable Fried Rice.jpg' },
  { id: 'm43', name: 'Chicken Fried Rice',      wikiFile: 'Fried rice with chicken (17234644521).jpg' },
  { id: 'm44', name: 'Veg. Noodles',            wikiFile: 'Veg Hakka Noodles.jpg' },
  { id: 'm45', name: 'Chicken Noodles',         wikiFile: 'Chicken Chow mein 1.jpg' },
  { id: 'm46', name: 'Prawn Fried Rice',        wikiFile: 'Shrimp Paste Fried Rice.jpg' },

  // DESSERTS
  { id: 'm47', name: 'Angoor Basundi',         wikiFile: 'Basundi Indian Dessert Mithai Sweets.jpg' },
  { id: 'm48', name: 'Apricot Delight',        wikiFile: 'Khobani Ka Meetha.JPG' },

  // BEVERAGES
  { id: 'm49', name: 'Mango Lassi',            directUrl: 'https://images.unsplash.com/photo-1619898804188-e7bad4bd2127?w=800&auto=format&fit=crop&q=80' },
  { id: 'm50', name: 'Butter Milk',            directUrl: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=800&auto=format&fit=crop&q=80' },
  { id: 'm51', name: 'Chocolate Milkshake',    directUrl: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=800&auto=format&fit=crop&q=80' },
  { id: 'm52', name: 'Fresh Lemon Soda',       wikiFile: 'Nimbu Pani.JPG' },
  { id: 'm53', name: 'Lassi (Sweet)',          wikiFile: 'Lassi Sweet or Salted.JPG' },
];

async function resolveWikiUrl(filename) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(filename)}&prop=imageinfo&iiprop=url|thumburl&iiurlwidth=800&format=json`;
  const res = await fetch(url, { headers: { 'User-Agent': 'SmartDiningImageDownloader/1.0 (contact@smartdining.local)' } });
  const data = await res.json();
  const pages = Object.values(data.query?.pages || {});
  if (pages.length > 0 && pages[0].imageinfo?.[0]) {
    const info = pages[0].imageinfo[0];
    return info.thumburl || info.url;
  }
  return null;
}

async function downloadFile(url, destPath) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
  }
  const buffer = await res.arrayBuffer();
  fs.writeFileSync(destPath, Buffer.from(buffer));
}

async function main() {
  const outDir = path.resolve('public/images/dishes');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  console.log(`Processing ${DISH_MAPPING.length} dishes...`);
  const finalDishData = [];

  for (const dish of DISH_MAPPING) {
    let sourceUrl = dish.directUrl;
    if (!sourceUrl && dish.wikiFile) {
      sourceUrl = await resolveWikiUrl(dish.wikiFile);
    }

    if (!sourceUrl) {
      console.error(`[ERROR] Could not resolve URL for ${dish.id}: ${dish.name}`);
      continue;
    }

    const localFileName = `${dish.id}.jpg`;
    const localFilePath = path.join(outDir, localFileName);
    const localWebPath = `/images/dishes/${localFileName}`;

    console.log(`Downloading [${dish.id}] ${dish.name} from: ${sourceUrl.substring(0, 70)}...`);
    try {
      await downloadFile(sourceUrl, localFilePath);
      const stats = fs.statSync(localFilePath);
      console.log(`  -> Saved ${localFileName} (${(stats.size / 1024).toFixed(1)} KB)`);
      finalDishData.push({
        ...dish,
        localWebPath,
        resolvedUrl: sourceUrl,
        sizeKb: stats.size / 1024,
      });
    } catch (err) {
      console.error(`  -> Failed: ${err.message}`);
    }
  }

  fs.writeFileSync('scripts/download_report.json', JSON.stringify(finalDishData, null, 2));
  console.log(`\nSuccessfully downloaded ${finalDishData.length}/${DISH_MAPPING.length} images!`);
}

main().catch(console.error);
