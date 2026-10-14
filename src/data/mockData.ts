import type { Category, Coupon, MenuItem, RestaurantTable } from '../types';

export const INITIAL_TABLES: RestaurantTable[] = [
  { id: 't1', table_number: '01', capacity: 2, is_occupied: false, qr_slug: 'table-01' },
  { id: 't2', table_number: '02', capacity: 2, is_occupied: false, qr_slug: 'table-02' },
  { id: 't3', table_number: '03', capacity: 4, is_occupied: true,  qr_slug: 'table-03' },
  { id: 't4', table_number: '04', capacity: 4, is_occupied: false, qr_slug: 'table-04' },
  { id: 't5', table_number: '05', capacity: 4, is_occupied: true,  qr_slug: 'table-05' },
  { id: 't6', table_number: '06', capacity: 6, is_occupied: false, qr_slug: 'table-06' },
  { id: 't7', table_number: '07', capacity: 6, is_occupied: false, qr_slug: 'table-07' },
  { id: 't8', table_number: '08', capacity: 8, is_occupied: false, qr_slug: 'table-08' },
  { id: 't9', table_number: '09', capacity: 2, is_occupied: false, qr_slug: 'table-09' },
  { id: 't10', table_number: '10', capacity: 4, is_occupied: false, qr_slug: 'table-10' },
];

export const INITIAL_CATEGORIES: Category[] = [
  { id: 'c1',  name: 'Andhra Specials',          slug: 'andhra-specials',  display_order: 1,  icon: 'Sparkles' },
  { id: 'c2',  name: 'Hyderabad Biryani',         slug: 'biryani',          display_order: 2,  icon: 'Soup' },
  { id: 'c3',  name: 'Soups',                     slug: 'soups',            display_order: 3,  icon: 'Coffee' },
  { id: 'c4',  name: 'Tandoori',                  slug: 'tandoori',         display_order: 4,  icon: 'Flame' },
  { id: 'c5',  name: 'Veg Starters',              slug: 'veg-starters',     display_order: 5,  icon: 'Salad' },
  { id: 'c6',  name: 'Non-Veg Starters',          slug: 'non-veg-starters', display_order: 6,  icon: 'UtensilsCrossed' },
  { id: 'c7',  name: 'Indian Curries (Veg)',       slug: 'curries-veg',      display_order: 7,  icon: 'CookingPot' },
  { id: 'c8',  name: 'Indian Curries (Non-Veg)',   slug: 'curries-non-veg',  display_order: 8,  icon: 'Flame' },
  { id: 'c9',  name: 'Noodles & Rice',             slug: 'noodles-rice',     display_order: 9,  icon: 'Sandwich' },
  { id: 'c10', name: 'Desserts',                   slug: 'desserts',         display_order: 10, icon: 'IceCream' },
  { id: 'c11', name: 'Beverages',                  slug: 'beverages',        display_order: 11, icon: 'GlassWater' },
];

export const INITIAL_COUPONS: Coupon[] = [
  { id: 'cp1', code: 'WELCOME10', description: 'Enjoy 10% Off on orders above ₹299', discount_type: 'percentage', discount_value: 10, min_order_amount: 299, is_active: true },
  { id: 'cp2', code: 'BIRYANI50', description: 'Flat ₹50 Off on Biryani orders above ₹399', discount_type: 'flat', discount_value: 50, min_order_amount: 399, is_active: true },
  { id: 'cp3', code: 'FEAST100',  description: 'Flat ₹100 Off on Family Dine-In above ₹799', discount_type: 'flat', discount_value: 100, min_order_amount: 799, is_active: true },
];

export const INITIAL_MENU_ITEMS: MenuItem[] = [
  // ANDHRA SPECIALS
  { id: 'm1',  category_id: 'c1', name: 'Chicken Curry',           description: 'Authentic Andhra-style chicken slow-cooked in a rich spiced onion-tomato gravy with freshly ground masalas and aromatic curry leaves.', price: 314, image_url: '/images/dishes/m1.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.8, prep_time_minutes: 20, customization_options: [{ name: 'Boneless Upgrade', price: 35 }] },
  { id: 'm2',  category_id: 'c1', name: 'Chicken Fry',             description: 'Crispy Andhra-style chicken marinated in fiery red chilli paste and curry leaves, deep-fried to a golden spiced crust.', price: 314, image_url: '/images/dishes/m2.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.7, prep_time_minutes: 18, customization_options: [] },
  { id: 'm3',  category_id: 'c1', name: 'Gongura Chicken',         description: 'Tender chicken slow-cooked with tangy Gongura (sorrel) leaves, fiery Guntur red chillies, and aromatic spices — a true Andhra village delicacy.', price: 345, image_url: '/images/dishes/m3.jpg', is_veg: false, spice_level: 'Extra Hot', is_available: true, rating: 4.9, prep_time_minutes: 22, customization_options: [{ name: 'Extra Gongura Paste', price: 20 }] },
  { id: 'm4',  category_id: 'c1', name: 'Prawns Curry',            description: 'Fresh coastal prawns simmered in a bold Andhra masala gravy with coconut, tamarind, and whole spices for a rich tangy flavour.', price: 395, image_url: '/images/dishes/m4.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.7, prep_time_minutes: 18, customization_options: [] },
  { id: 'm5',  category_id: 'c1', name: 'Gongura Mutton',          description: 'Succulent mutton pieces braised with tangy sorrel (Gongura) leaves and fiery Andhra spices. Best paired with steamed rice.', price: 425, image_url: '/images/dishes/m5.jpg', is_veg: false, spice_level: 'Extra Hot', is_available: true, rating: 4.8, prep_time_minutes: 25, customization_options: [] },
  { id: 'm6',  category_id: 'c1', name: 'Mutton Fry',              description: 'Spice-crusted mutton pieces dry-fried with curry leaves, ginger-garlic, and cracked black peppercorns until crispy and aromatic.', price: 425, image_url: '/images/dishes/m6.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.7, prep_time_minutes: 22, customization_options: [{ name: 'Extra Masala Toss', price: 15 }] },

  // HYDERABAD BIRYANI
  { id: 'm7',  category_id: 'c2', name: 'Veg. Biryani',            description: 'Fragrant basmati rice dum-cooked with seasonal vegetables, saffron milk, caramelized birista, and whole aromatic spices. Served with raitha.', price: 289, image_url: '/images/dishes/m7.jpg', is_veg: true,  spice_level: 'Medium',    is_available: true, rating: 4.6, prep_time_minutes: 20, customization_options: [{ name: 'Extra Raitha', price: 20 }] },
  { id: 'm8',  category_id: 'c2', name: 'Chicken Biryani',         description: 'Classic Hyderabadi dum biryani with marinated chicken layered in aged basmati rice, sealed and slow-cooked with saffron, birista, and fresh mint.', price: 344, image_url: '/images/dishes/m8.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.9, prep_time_minutes: 20, customization_options: [{ name: 'Extra Boiled Egg', price: 20 }, { name: 'Extra Mirchi ka Salan', price: 25 }, { name: 'Double Raitha Bowl', price: 20 }] },
  { id: 'm9',  category_id: 'c2', name: 'Chicken Tikka Biryani',   description: 'Charcoal-grilled chicken tikka pieces layered in saffron basmati rice with fresh mint and caramelized onions — a smoky Hyderabadi treat.', price: 394, image_url: '/images/dishes/m9.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.8, prep_time_minutes: 22, customization_options: [{ name: 'Extra Raitha Bowl', price: 20 }] },
  { id: 'm10', category_id: 'c2', name: 'Prawn Biryani',           description: 'Juicy tiger prawns marinated in spiced yoghurt and dum-cooked with saffron basmati rice, caramelized onions, and fresh coriander.', price: 404, image_url: '/images/dishes/m10.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.8, prep_time_minutes: 22, customization_options: [] },
  { id: 'm11', category_id: 'c2', name: 'Mutton Dum Biryani',      description: 'Bone-in mutton marinated overnight and dum-cooked in a sealed handi with aged basmati rice, whole spices, and pure saffron milk.', price: 434, image_url: '/images/dishes/m11.jpg', is_veg: false, spice_level: 'Medium',    is_available: true, rating: 4.9, prep_time_minutes: 25, customization_options: [{ name: 'Extra Raitha Bowl', price: 20 }] },

  // SOUPS
  { id: 'm12', category_id: 'c3', name: 'Tomato Soup',             description: 'Velvety smooth soup made with sun-ripened tomatoes, fresh cream, and herbs — a comforting classic served piping hot.', price: 144, image_url: '/images/dishes/m12.jpg', is_veg: true,  spice_level: 'Mild',      is_available: true, rating: 4.5, prep_time_minutes: 10, customization_options: [{ name: 'Extra Croutons', price: 10 }] },
  { id: 'm13', category_id: 'c3', name: 'Veg. Hot & Sour Soup',    description: 'Bold tangy Chinese-style soup loaded with crunchy vegetables, vinegar heat, and silky cornstarch broth with a spicy kick.', price: 144, image_url: '/images/dishes/m13.jpg', is_veg: true,  spice_level: 'Hot',       is_available: true, rating: 4.6, prep_time_minutes: 10, customization_options: [] },
  { id: 'm14', category_id: 'c3', name: 'Chicken Corn Soup',       description: 'Warm comforting soup with shredded chicken, sweet corn kernels, and aromatic ginger in a silky light broth.', price: 173, image_url: '/images/dishes/m14.jpg', is_veg: false, spice_level: 'Mild',      is_available: true, rating: 4.7, prep_time_minutes: 12, customization_options: [] },
  { id: 'm15', category_id: 'c3', name: 'Chicken Hot & Sour Soup', description: 'Spicy and tangy chicken broth with vinegar, shredded chicken, mushrooms, and cracked pepper — a restaurant favourite.', price: 173, image_url: '/images/dishes/m15.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.6, prep_time_minutes: 12, customization_options: [] },

  // TANDOORI
  { id: 'm16', category_id: 'c4', name: 'Tandoori Chicken (Full)', description: 'Whole chicken marinated in yoghurt, Kashmiri chilli, and aromatic spices, slow-roasted in our clay tandoor until smoky and perfectly charred.', price: 495, image_url: '/images/dishes/m16.jpg', is_veg: false, spice_level: 'Medium',    is_available: true, rating: 4.9, prep_time_minutes: 25, customization_options: [{ name: 'Mint Chutney & Salad', price: 20 }] },
  { id: 'm17', category_id: 'c4', name: 'Tandoori Chicken (Half)', description: 'Half chicken marinated in yoghurt and Kashmiri chilli spice mix, grilled to smoky perfection in our clay tandoor.', price: 354, image_url: '/images/dishes/m17.jpg', is_veg: false, spice_level: 'Medium',    is_available: true, rating: 4.8, prep_time_minutes: 20, customization_options: [] },
  { id: 'm18', category_id: 'c4', name: 'Chicken Tikka',           description: 'Boneless chicken chunks marinated in spiced hung curd, grilled on skewers in the tandoor until juicy inside and charred outside.', price: 354, image_url: '/images/dishes/m18.jpg', is_veg: false, spice_level: 'Medium',    is_available: true, rating: 4.8, prep_time_minutes: 20, customization_options: [{ name: 'Extra Mint Dip', price: 15 }] },
  { id: 'm19', category_id: 'c4', name: 'Kalmi Kebab',             description: 'Chicken drumsticks marinated in cream, mace, and aromatic spices, slow-charred in the tandoor to melt-in-mouth perfection.', price: 354, image_url: '/images/dishes/m19.jpg', is_veg: false, spice_level: 'Mild',      is_available: true, rating: 4.7, prep_time_minutes: 20, customization_options: [] },

  // VEG STARTERS
  { id: 'm20', category_id: 'c5', name: 'Veg. Manchurian',         description: 'Crispy mixed vegetable balls tossed in a tangy spicy Manchurian sauce with garlic, ginger, and soy sauce.', price: 249, image_url: '/images/dishes/m20.jpg', is_veg: true,  spice_level: 'Medium',    is_available: true, rating: 4.6, prep_time_minutes: 12, customization_options: [{ name: 'Gravy Style', price: 0 }] },
  { id: 'm21', category_id: 'c5', name: 'Gobi Manchurian',         description: 'Crispy cauliflower florets tossed in a tangy spicy Indo-Chinese Manchurian sauce with spring onions, garlic, and soy.', price: 249, image_url: '/images/dishes/m21.jpg', is_veg: true,  spice_level: 'Medium',    is_available: true, rating: 4.7, prep_time_minutes: 15, customization_options: [{ name: 'Gravy Style', price: 0 }] },
  { id: 'm22', category_id: 'c5', name: 'Chilli Paneer',           description: 'Golden-fried cottage cheese cubes tossed in a fiery Indo-Chinese sauce with capsicum, onions, soy, and green chillies.', price: 313, image_url: '/images/dishes/m22.jpg', is_veg: true,  spice_level: 'Hot',       is_available: true, rating: 4.8, prep_time_minutes: 15, customization_options: [{ name: 'Gravy Style', price: 0 }] },
  { id: 'm23', category_id: 'c5', name: 'Paneer 65',               description: 'Spiced cottage cheese marinated in yoghurt and South Indian spices, deep-fried to crispy golden perfection with curry leaves.', price: 313, image_url: '/images/dishes/m23.jpg', is_veg: true,  spice_level: 'Hot',       is_available: true, rating: 4.6, prep_time_minutes: 12, customization_options: [] },
  { id: 'm24', category_id: 'c5', name: 'Veg Spring Rolls',        description: 'Crispy golden rolls stuffed with seasoned cabbage, carrots, bean sprouts, and glass noodles — served with sweet chilli dipping sauce.', price: 249, image_url: '/images/dishes/m24.jpg', is_veg: true,  spice_level: 'Mild',      is_available: true, rating: 4.5, prep_time_minutes: 12, customization_options: [] },
  { id: 'm25', category_id: 'c5', name: 'Baby Corn Manchurian',    description: 'Tender baby corn coated in crispy batter and tossed in a bold Manchurian sauce with garlic, ginger, and spring onions.', price: 274, image_url: '/images/dishes/m25.jpg', is_veg: true,  spice_level: 'Medium',    is_available: true, rating: 4.5, prep_time_minutes: 12, customization_options: [] },

  // NON-VEG STARTERS
  { id: 'm26', category_id: 'c6', name: 'Chicken 65',              description: 'Iconic South Indian crispy boneless chicken chunks marinated with ginger, garlic, and crushed spices, flash-fried with curry leaves and green chillies.', price: 349, image_url: '/images/dishes/m26.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.9, prep_time_minutes: 15, customization_options: [{ name: 'Extra Spicy Masala Toss', price: 15 }, { name: 'Lemon Onion Platter', price: 10 }] },
  { id: 'm27', category_id: 'c6', name: 'Chilli Chicken',          description: 'Crispy fried chicken tossed in a bold Indo-Chinese sauce with capsicum, green chillies, and spring onions.', price: 349, image_url: '/images/dishes/m27.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.8, prep_time_minutes: 15, customization_options: [{ name: 'Gravy Style', price: 0 }] },
  { id: 'm28', category_id: 'c6', name: 'Chicken Manchurian',      description: 'Juicy minced chicken balls in a tangy spicy Indo-Chinese Manchurian sauce with garlic, ginger, and soy sauce.', price: 349, image_url: '/images/dishes/m28.jpg', is_veg: false, spice_level: 'Medium',    is_available: true, rating: 4.7, prep_time_minutes: 15, customization_options: [{ name: 'Gravy Style', price: 0 }] },
  { id: 'm29', category_id: 'c6', name: 'Ginger Prawns',           description: 'Fresh tiger prawns stir-fried with julienned ginger, garlic, curry leaves, and cracked pepper in a dry spiced masala.', price: 394, image_url: '/images/dishes/m29.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.8, prep_time_minutes: 18, customization_options: [] },
  { id: 'm30', category_id: 'c6', name: 'Apollo Fish',             description: 'Boneless fish strips marinated in yoghurt and spices, deep-fried and tossed in a signature spicy masala with curry leaves.', price: 384, image_url: '/images/dishes/m30.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.7, prep_time_minutes: 18, customization_options: [] },
  { id: 'm31', category_id: 'c6', name: 'Pepper Chicken',          description: 'Tender chicken dry-fried with freshly cracked black pepper, curry leaves, fennel, and a bold South Indian spice blend.', price: 364, image_url: '/images/dishes/m31.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.7, prep_time_minutes: 15, customization_options: [] },

  // INDIAN CURRIES VEG
  { id: 'm32', category_id: 'c7', name: 'Paneer Butter Masala',    description: 'Fresh cottage cheese cubes simmered in a satin-smooth gravy of vine-ripened tomatoes, butter, cashew paste, and aromatic kasuri methi.', price: 304, image_url: '/images/dishes/m32.jpg', is_veg: true,  spice_level: 'Mild',      is_available: true, rating: 4.9, prep_time_minutes: 15, customization_options: [{ name: 'Extra Butter Swirl', price: 25 }] },
  { id: 'm33', category_id: 'c7', name: 'Palak Paneer',            description: 'Silky pureed spinach gravy with fresh paneer cubes, tempered with cumin, garlic, and a touch of cream — rich and nutritious.', price: 304, image_url: '/images/dishes/m33.jpg', is_veg: true,  spice_level: 'Mild',      is_available: true, rating: 4.7, prep_time_minutes: 15, customization_options: [] },
  { id: 'm34', category_id: 'c7', name: 'Shahi Paneer',            description: 'Royal Mughlai-style paneer in a rich cashew-onion gravy with cream, saffron, and whole aromatic spices — a feast fit for royals.', price: 304, image_url: '/images/dishes/m34.jpg', is_veg: true,  spice_level: 'Mild',      is_available: true, rating: 4.8, prep_time_minutes: 15, customization_options: [] },
  { id: 'm35', category_id: 'c7', name: 'Malai Kofta',             description: 'Soft cottage cheese and potato dumplings in a rich creamy tomato-cashew gravy with cardamom and kasuri methi.', price: 304, image_url: '/images/dishes/m35.jpg', is_veg: true,  spice_level: 'Mild',      is_available: true, rating: 4.6, prep_time_minutes: 18, customization_options: [] },
  { id: 'm36', category_id: 'c7', name: 'Kadai Paneer',            description: 'Paneer cooked in a bold kadai masala with freshly ground coriander, cumin, whole red chillies, and chunky capsicum.', price: 304, image_url: '/images/dishes/m36.jpg', is_veg: true,  spice_level: 'Medium',    is_available: true, rating: 4.7, prep_time_minutes: 15, customization_options: [] },

  // INDIAN CURRIES NON-VEG
  { id: 'm37', category_id: 'c8', name: 'Butter Chicken',          description: 'Tandoor-roasted chicken in legendary silky makhani gravy loaded with butter, cream, and hints of green cardamom and fenugreek.', price: 349, image_url: '/images/dishes/m37.jpg', is_veg: false, spice_level: 'Mild',      is_available: true, rating: 4.9, prep_time_minutes: 15, customization_options: [{ name: 'Extra Cream Float', price: 20 }, { name: 'Boneless Upgrade', price: 40 }] },
  { id: 'm38', category_id: 'c8', name: 'Kadai Chicken',           description: 'Chicken cooked in a bold kadai masala with freshly ground coriander, cumin, whole red chillies, and chunky capsicum.', price: 349, image_url: '/images/dishes/m38.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.7, prep_time_minutes: 18, customization_options: [] },
  { id: 'm39', category_id: 'c8', name: 'Chicken Chettinad',       description: 'Fiery Chettinad-style chicken cooked with freshly ground kalpasi, marathi mokku, and aromatic whole spices in a tangy onion base.', price: 349, image_url: '/images/dishes/m39.jpg', is_veg: false, spice_level: 'Extra Hot', is_available: true, rating: 4.8, prep_time_minutes: 20, customization_options: [] },
  { id: 'm40', category_id: 'c8', name: 'Mutton Roghan Josh',      description: 'Classic Kashmiri mutton braised with Kashmiri chillies, fennel, and whole spices in a deep red aromatic gravy.', price: 434, image_url: '/images/dishes/m40.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.8, prep_time_minutes: 25, customization_options: [] },
  { id: 'm41', category_id: 'c8', name: 'Prawns Masala',           description: 'Fresh prawns cooked in a bold onion-tomato masala with coastal spices, coconut, and curry leaves.', price: 413, image_url: '/images/dishes/m41.jpg', is_veg: false, spice_level: 'Hot',       is_available: true, rating: 4.7, prep_time_minutes: 20, customization_options: [] },

  // NOODLES & RICE
  { id: 'm42', category_id: 'c9', name: 'Veg. Fried Rice',         description: 'Wok-tossed long-grain rice with fresh vegetables, soy sauce, and sesame oil on a blazing high flame.', price: 285, image_url: '/images/dishes/m42.jpg', is_veg: true,  spice_level: 'Mild',      is_available: true, rating: 4.5, prep_time_minutes: 12, customization_options: [{ name: 'Schezwan Style', price: 10 }] },
  { id: 'm43', category_id: 'c9', name: 'Chicken Fried Rice',      description: 'Fragrant wok-tossed rice with shredded chicken, spring onions, eggs, and house seasoning on a blazing hot wok.', price: 329, image_url: '/images/dishes/m43.jpg', is_veg: false, spice_level: 'Mild',      is_available: true, rating: 4.7, prep_time_minutes: 15, customization_options: [{ name: 'Schezwan Style', price: 10 }] },
  { id: 'm44', category_id: 'c9', name: 'Veg. Noodles',            description: 'Stir-fried hakka noodles tossed with fresh vegetables, soy sauce, chilli sauce, and sesame oil.', price: 285, image_url: '/images/dishes/m44.jpg', is_veg: true,  spice_level: 'Mild',      is_available: true, rating: 4.5, prep_time_minutes: 12, customization_options: [{ name: 'Schezwan Style', price: 10 }] },
  { id: 'm45', category_id: 'c9', name: 'Chicken Noodles',         description: 'Wok-tossed hakka noodles with tender chicken strips, fresh vegetables, soy, and chilli sauce.', price: 309, image_url: '/images/dishes/m45.jpg', is_veg: false, spice_level: 'Medium',    is_available: true, rating: 4.6, prep_time_minutes: 15, customization_options: [{ name: 'Schezwan Style', price: 10 }] },
  { id: 'm46', category_id: 'c9', name: 'Prawn Fried Rice',        description: 'Wok-tossed fragrant rice with juicy prawns, spring onions, soy sauce, and sesame oil on a high flame.', price: 380, image_url: '/images/dishes/m46.jpg', is_veg: false, spice_level: 'Mild',      is_available: true, rating: 4.7, prep_time_minutes: 15, customization_options: [] },

  // DESSERTS
  { id: 'm47', category_id: 'c10', name: 'Angoor Basundi',         description: 'Soft chhena dumplings soaked in thickened sweetened milk infused with cardamom, saffron, and crushed pistachios.', price: 90,  image_url: '/images/dishes/m47.jpg', is_veg: true, spice_level: 'Mild', is_available: true, rating: 4.8, prep_time_minutes: 5, customization_options: [] },
  { id: 'm48', category_id: 'c10', name: 'Apricot Delight',        description: 'A specialty dessert with slow-cooked dried apricots in jaggery syrup, topped with fresh cream and crushed nuts.', price: 120, image_url: '/images/dishes/m48.jpg', is_veg: true, spice_level: 'Mild', is_available: true, rating: 4.6, prep_time_minutes: 5, customization_options: [] },

  // BEVERAGES
  { id: 'm49', category_id: 'c11', name: 'Mango Lassi',            description: 'Thick churned yoghurt smoothie blended with ripe Alphonso mango pulp, a hint of cardamom, and garnished with pistachios.', price: 124, image_url: '/images/dishes/m49.jpg', is_veg: true, spice_level: 'Mild', is_available: true, rating: 4.8, prep_time_minutes: 5, customization_options: [{ name: 'Add Chia Seeds', price: 15 }] },
  { id: 'm50', category_id: 'c11', name: 'Butter Milk',            description: 'Chilled spiced chaas made with beaten curd, roasted cumin, fresh ginger, green chilli, and curry leaves.', price: 68,  image_url: '/images/dishes/m50.jpg', is_veg: true, spice_level: 'Mild', is_available: true, rating: 4.6, prep_time_minutes: 3, customization_options: [] },
  { id: 'm51', category_id: 'c11', name: 'Chocolate Milkshake',    description: 'Rich creamy milkshake blended with premium chocolate ice cream, full-fat milk, and topped with chocolate syrup.', price: 128, image_url: '/images/dishes/m51.jpg', is_veg: true, spice_level: 'Mild', is_available: true, rating: 4.7, prep_time_minutes: 5, customization_options: [{ name: 'Extra Scoop', price: 35 }] },
  { id: 'm52', category_id: 'c11', name: 'Fresh Lemon Soda',       description: 'Refreshing chilled soda with freshly squeezed lemon juice, served sweet or salted — the perfect accompaniment to a spicy meal.', price: 105, image_url: '/images/dishes/m52.jpg', is_veg: true, spice_level: 'Mild', is_available: true, rating: 4.5, prep_time_minutes: 3, customization_options: [{ name: 'Sweet', price: 0 }, { name: 'Salt', price: 0 }] },
  { id: 'm53', category_id: 'c11', name: 'Lassi (Sweet)',           description: 'Chilled thick churned yoghurt drink sweetened with sugar and flavoured with rose water and cardamom.', price: 86, image_url: '/images/dishes/m53.jpg', is_veg: true, spice_level: 'Mild', is_available: true, rating: 4.5, prep_time_minutes: 3, customization_options: [] },
];

export const INITIAL_ORDERS = [
  {
    id: 'ord-101', order_number: '#SD-4821', table_number: '05',
    subtotal: 738.00, tax: 36.90, service_fee: 15.00, discount: 50.00, coupon_code: 'BIRYANI50', total_amount: 739.90,
    order_status: 'preparing' as const, payment_status: 'completed' as const, payment_method: 'razorpay' as const,
    notes: 'Extra aromatic with fried onions please.', created_at: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    items: [
      { id: 'oi-1', order_id: 'ord-101', menu_item_id: 'm8', item_name: 'Chicken Biryani', quantity: 2, unit_price: 344, total_price: 688, spice_level: 'Hot' as const, customizations: [{ name: 'Double Raitha Bowl', price: 20 }], special_instructions: 'Less oil please' },
      { id: 'oi-2', order_id: 'ord-101', menu_item_id: 'm49', item_name: 'Mango Lassi', quantity: 1, unit_price: 124, total_price: 124, spice_level: 'Mild' as const, customizations: [] },
    ],
  },
  {
    id: 'ord-102', order_number: '#SD-3190', table_number: '03',
    subtotal: 698.00, tax: 34.90, service_fee: 15.00, discount: 0.00, total_amount: 747.90,
    order_status: 'received' as const, payment_status: 'pending' as const, payment_method: 'pay_at_table' as const,
    notes: 'Birthday dinner table.', created_at: new Date(Date.now() - 3 * 60 * 1000).toISOString(),
    items: [
      { id: 'oi-3', order_id: 'ord-102', menu_item_id: 'm37', item_name: 'Butter Chicken', quantity: 1, unit_price: 349, total_price: 349, spice_level: 'Mild' as const, customizations: [] },
      { id: 'oi-4', order_id: 'ord-102', menu_item_id: 'm26', item_name: 'Chicken 65', quantity: 1, unit_price: 349, total_price: 349, spice_level: 'Hot' as const, customizations: [{ name: 'Extra Spicy Masala Toss', price: 15 }] },
    ],
  },
];
