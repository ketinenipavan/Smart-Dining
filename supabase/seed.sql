-- ===================================================================
-- Smart Dining - Menu Card Items Seed Data
-- Updated to match actual restaurant menu card
-- ===================================================================

DELETE FROM order_items;
DELETE FROM orders;
DELETE FROM menu_items;
DELETE FROM coupons;
DELETE FROM categories;
DELETE FROM restaurant_tables;

-- RESTAURANT TABLES
INSERT INTO restaurant_tables (table_number, capacity, is_occupied, qr_slug) VALUES
('01', 2, false, 'table-01'), ('02', 2, false, 'table-02'), ('03', 4, true,  'table-03'),
('04', 4, false, 'table-04'), ('05', 4, true,  'table-05'), ('06', 6, false, 'table-06'),
('07', 6, false, 'table-07'), ('08', 8, false, 'table-08'), ('09', 2, false, 'table-09'),
('10', 4, false, 'table-10');

-- CATEGORIES
INSERT INTO categories (id, name, slug, display_order, icon) VALUES
('c1000000-0000-0000-0000-000000000001', 'Andhra Specials',          'andhra-specials',  1,  'Sparkles'),
('c1000000-0000-0000-0000-000000000002', 'Hyderabad Biryani',         'biryani',          2,  'Soup'),
('c1000000-0000-0000-0000-000000000003', 'Soups',                     'soups',            3,  'Coffee'),
('c1000000-0000-0000-0000-000000000004', 'Tandoori',                  'tandoori',         4,  'Flame'),
('c1000000-0000-0000-0000-000000000005', 'Veg Starters',              'veg-starters',     5,  'Salad'),
('c1000000-0000-0000-0000-000000000006', 'Non-Veg Starters',          'non-veg-starters', 6,  'UtensilsCrossed'),
('c1000000-0000-0000-0000-000000000007', 'Indian Curries (Veg)',       'curries-veg',      7,  'CookingPot'),
('c1000000-0000-0000-0000-000000000008', 'Indian Curries (Non-Veg)',   'curries-non-veg',  8,  'Flame'),
('c1000000-0000-0000-0000-000000000009', 'Noodles & Rice',             'noodles-rice',     9,  'Sandwich'),
('c1000000-0000-0000-0000-000000000010', 'Desserts',                   'desserts',         10, 'IceCream'),
('c1000000-0000-0000-0000-000000000011', 'Beverages',                  'beverages',        11, 'GlassWater');

-- COUPONS
INSERT INTO coupons (code, description, discount_type, discount_value, min_order_amount, is_active) VALUES
('WELCOME10', 'Enjoy 10% Off on orders above ₹299', 'percentage', 10.00, 299.00, true),
('BIRYANI50', 'Flat ₹50 Off on Biryani orders above ₹399', 'flat', 50.00, 399.00, true),
('FEAST100',  'Flat ₹100 Off on Family Dine-In above ₹799', 'flat', 100.00, 799.00, true);

-- ANDHRA SPECIALS
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, spice_level, is_available, rating, prep_time_minutes, customization_options) VALUES
('m1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Chicken Curry', 'Authentic Andhra-style chicken slow-cooked in a rich spiced onion-tomato gravy with freshly ground masalas and aromatic curry leaves.', 314.00, '/images/dishes/m1.jpg', false, 'Hot', true, 4.8, 20, '[{"name":"Boneless Upgrade","price":35}]'::jsonb),
('m1000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'Chicken Fry', 'Crispy Andhra-style chicken marinated in fiery red chilli paste and curry leaves, deep-fried to a golden spiced crust.', 314.00, '/images/dishes/m2.jpg', false, 'Hot', true, 4.7, 18, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000003', 'c1000000-0000-0000-0000-000000000001', 'Gongura Chicken', 'Tender chicken slow-cooked with tangy Gongura (sorrel) leaves, fiery Guntur red chillies, and aromatic spices — a true Andhra village delicacy.', 345.00, '/images/dishes/m3.jpg', false, 'Extra Hot', true, 4.9, 22, '[{"name":"Extra Gongura Paste","price":20}]'::jsonb),
('m1000000-0000-0000-0000-000000000004', 'c1000000-0000-0000-0000-000000000001', 'Prawns Curry', 'Fresh coastal prawns simmered in a bold Andhra masala gravy with coconut, tamarind, and whole spices for a rich tangy flavour.', 395.00, '/images/dishes/m4.jpg', false, 'Hot', true, 4.7, 18, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000005', 'c1000000-0000-0000-0000-000000000001', 'Gongura Mutton', 'Succulent mutton pieces braised with tangy sorrel (Gongura) leaves and fiery Andhra spices. Best paired with steamed rice.', 425.00, '/images/dishes/m5.jpg', false, 'Extra Hot', true, 4.8, 25, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000006', 'c1000000-0000-0000-0000-000000000001', 'Mutton Fry', 'Spice-crusted mutton pieces dry-fried with curry leaves, ginger-garlic, and cracked black peppercorns until crispy and aromatic.', 425.00, '/images/dishes/m6.jpg', false, 'Hot', true, 4.7, 22, '[{"name":"Extra Masala Toss","price":15}]'::jsonb);

-- HYDERABAD BIRYANI
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, spice_level, is_available, rating, prep_time_minutes, customization_options) VALUES
('m1000000-0000-0000-0000-000000000007', 'c1000000-0000-0000-0000-000000000002', 'Veg. Biryani', 'Fragrant basmati rice dum-cooked with seasonal vegetables, saffron milk, caramelized birista, and whole aromatic spices. Served with raitha.', 289.00, '/images/dishes/m7.jpg', true, 'Medium', true, 4.6, 20, '[{"name":"Extra Raitha","price":20}]'::jsonb),
('m1000000-0000-0000-0000-000000000008', 'c1000000-0000-0000-0000-000000000002', 'Chicken Biryani', 'Classic Hyderabadi dum biryani with marinated chicken layered in aged basmati rice, sealed and slow-cooked with saffron, birista, and fresh mint.', 344.00, '/images/dishes/m8.jpg', false, 'Hot', true, 4.9, 20, '[{"name":"Extra Boiled Egg","price":20},{"name":"Extra Mirchi ka Salan","price":25},{"name":"Double Raitha Bowl","price":20}]'::jsonb),
('m1000000-0000-0000-0000-000000000009', 'c1000000-0000-0000-0000-000000000002', 'Chicken Tikka Biryani', 'Charcoal-grilled chicken tikka pieces layered in saffron basmati rice with fresh mint and caramelized onions.', 394.00, '/images/dishes/m9.jpg', false, 'Hot', true, 4.8, 22, '[{"name":"Extra Raitha Bowl","price":20}]'::jsonb),
('m1000000-0000-0000-0000-000000000010', 'c1000000-0000-0000-0000-000000000002', 'Prawn Biryani', 'Juicy tiger prawns marinated in spiced yoghurt and dum-cooked with saffron basmati rice, caramelized onions, and fresh coriander.', 404.00, '/images/dishes/m10.jpg', false, 'Hot', true, 4.8, 22, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000011', 'c1000000-0000-0000-0000-000000000002', 'Mutton Dum Biryani', 'Bone-in mutton marinated overnight and dum-cooked in a sealed handi with aged basmati rice, whole spices, and pure saffron milk.', 434.00, '/images/dishes/m11.jpg', false, 'Medium', true, 4.9, 25, '[{"name":"Extra Raitha Bowl","price":20}]'::jsonb);

-- SOUPS
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, spice_level, is_available, rating, prep_time_minutes, customization_options) VALUES
('m1000000-0000-0000-0000-000000000012', 'c1000000-0000-0000-0000-000000000003', 'Tomato Soup', 'Velvety smooth soup made with sun-ripened tomatoes, fresh cream, and herbs — a comforting classic served piping hot.', 144.00, '/images/dishes/m12.jpg', true, 'Mild', true, 4.5, 10, '[{"name":"Extra Croutons","price":10}]'::jsonb),
('m1000000-0000-0000-0000-000000000013', 'c1000000-0000-0000-0000-000000000003', 'Veg. Hot & Sour Soup', 'Bold tangy Chinese-style soup loaded with crunchy vegetables, vinegar heat, and silky cornstarch broth with a spicy kick.', 144.00, '/images/dishes/m13.jpg', true, 'Hot', true, 4.6, 10, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000014', 'c1000000-0000-0000-0000-000000000003', 'Chicken Corn Soup', 'Warm comforting soup with shredded chicken, sweet corn kernels, and aromatic ginger in a silky light broth.', 173.00, '/images/dishes/m14.jpg', false, 'Mild', true, 4.7, 12, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000015', 'c1000000-0000-0000-0000-000000000003', 'Chicken Hot & Sour Soup', 'Spicy and tangy chicken broth with vinegar, shredded chicken, mushrooms, and cracked pepper.', 173.00, '/images/dishes/m15.jpg', false, 'Hot', true, 4.6, 12, '[]'::jsonb);

-- TANDOORI
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, spice_level, is_available, rating, prep_time_minutes, customization_options) VALUES
('m1000000-0000-0000-0000-000000000016', 'c1000000-0000-0000-0000-000000000004', 'Tandoori Chicken (Full)', 'Whole chicken marinated in yoghurt, Kashmiri chilli, and aromatic spices, slow-roasted in our clay tandoor until smoky and perfectly charred.', 495.00, '/images/dishes/m16.jpg', false, 'Medium', true, 4.9, 25, '[{"name":"Mint Chutney & Salad","price":20}]'::jsonb),
('m1000000-0000-0000-0000-000000000017', 'c1000000-0000-0000-0000-000000000004', 'Tandoori Chicken (Half)', 'Half chicken marinated in yoghurt and Kashmiri chilli spice mix, grilled to smoky perfection in our clay tandoor.', 354.00, '/images/dishes/m17.jpg', false, 'Medium', true, 4.8, 20, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000018', 'c1000000-0000-0000-0000-000000000004', 'Chicken Tikka', 'Boneless chicken chunks marinated in spiced hung curd, grilled on skewers in the tandoor until juicy inside and charred outside.', 354.00, '/images/dishes/m18.jpg', false, 'Medium', true, 4.8, 20, '[{"name":"Extra Mint Dip","price":15}]'::jsonb),
('m1000000-0000-0000-0000-000000000019', 'c1000000-0000-0000-0000-000000000004', 'Kalmi Kebab', 'Chicken drumsticks marinated in cream, mace, and aromatic spices, slow-charred in the tandoor to melt-in-mouth perfection.', 354.00, '/images/dishes/m19.jpg', false, 'Mild', true, 4.7, 20, '[]'::jsonb);

-- VEG STARTERS
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, spice_level, is_available, rating, prep_time_minutes, customization_options) VALUES
('m1000000-0000-0000-0000-000000000020', 'c1000000-0000-0000-0000-000000000005', 'Veg. Manchurian', 'Crispy mixed vegetable balls tossed in a tangy spicy Manchurian sauce with garlic, ginger, and soy sauce.', 249.00, '/images/dishes/m20.jpg', true, 'Medium', true, 4.6, 12, '[{"name":"Gravy Style","price":0}]'::jsonb),
('m1000000-0000-0000-0000-000000000021', 'c1000000-0000-0000-0000-000000000005', 'Gobi Manchurian', 'Crispy cauliflower florets tossed in a tangy spicy Indo-Chinese Manchurian sauce with spring onions, garlic, and soy.', 249.00, '/images/dishes/m21.jpg', true, 'Medium', true, 4.7, 15, '[{"name":"Gravy Style","price":0}]'::jsonb),
('m1000000-0000-0000-0000-000000000022', 'c1000000-0000-0000-0000-000000000005', 'Chilli Paneer', 'Golden-fried cottage cheese cubes tossed in a fiery Indo-Chinese sauce with capsicum, onions, soy, and green chillies.', 313.00, '/images/dishes/m22.jpg', true, 'Hot', true, 4.8, 15, '[{"name":"Gravy Style","price":0}]'::jsonb),
('m1000000-0000-0000-0000-000000000023', 'c1000000-0000-0000-0000-000000000005', 'Paneer 65', 'Spiced cottage cheese marinated in yoghurt and South Indian spices, deep-fried to crispy golden perfection with curry leaves.', 313.00, '/images/dishes/m23.jpg', true, 'Hot', true, 4.6, 12, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000024', 'c1000000-0000-0000-0000-000000000005', 'Veg Spring Rolls', 'Crispy golden rolls stuffed with seasoned cabbage, carrots, bean sprouts, and glass noodles — served with sweet chilli dipping sauce.', 249.00, '/images/dishes/m24.jpg', true, 'Mild', true, 4.5, 12, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000025', 'c1000000-0000-0000-0000-000000000005', 'Baby Corn Manchurian', 'Tender baby corn coated in crispy batter and tossed in a bold Manchurian sauce with garlic, ginger, and spring onions.', 274.00, '/images/dishes/m25.jpg', true, 'Medium', true, 4.5, 12, '[]'::jsonb);

-- NON-VEG STARTERS
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, spice_level, is_available, rating, prep_time_minutes, customization_options) VALUES
('m1000000-0000-0000-0000-000000000026', 'c1000000-0000-0000-0000-000000000006', 'Chicken 65', 'Iconic South Indian crispy boneless chicken chunks marinated with ginger, garlic, and crushed spices, flash-fried with curry leaves and green chillies.', 349.00, '/images/dishes/m26.jpg', false, 'Hot', true, 4.9, 15, '[{"name":"Extra Spicy Masala Toss","price":15},{"name":"Lemon Onion Platter","price":10}]'::jsonb),
('m1000000-0000-0000-0000-000000000027', 'c1000000-0000-0000-0000-000000000006', 'Chilli Chicken', 'Crispy fried chicken tossed in a bold Indo-Chinese sauce with capsicum, green chillies, and spring onions.', 349.00, '/images/dishes/m27.jpg', false, 'Hot', true, 4.8, 15, '[{"name":"Gravy Style","price":0}]'::jsonb),
('m1000000-0000-0000-0000-000000000028', 'c1000000-0000-0000-0000-000000000006', 'Chicken Manchurian', 'Juicy minced chicken balls in a tangy spicy Indo-Chinese Manchurian sauce with garlic, ginger, and soy sauce.', 349.00, '/images/dishes/m28.jpg', false, 'Medium', true, 4.7, 15, '[{"name":"Gravy Style","price":0}]'::jsonb),
('m1000000-0000-0000-0000-000000000029', 'c1000000-0000-0000-0000-000000000006', 'Ginger Prawns', 'Fresh tiger prawns stir-fried with julienned ginger, garlic, curry leaves, and cracked pepper in a dry spiced masala.', 394.00, '/images/dishes/m29.jpg', false, 'Hot', true, 4.8, 18, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000030', 'c1000000-0000-0000-0000-000000000006', 'Apollo Fish', 'Boneless fish strips marinated in yoghurt and spices, deep-fried and tossed in a signature spicy masala with curry leaves.', 384.00, '/images/dishes/m30.jpg', false, 'Hot', true, 4.7, 18, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000031', 'c1000000-0000-0000-0000-000000000006', 'Pepper Chicken', 'Tender chicken dry-fried with freshly cracked black pepper, curry leaves, fennel, and a bold South Indian spice blend.', 364.00, '/images/dishes/m31.jpg', false, 'Hot', true, 4.7, 15, '[]'::jsonb);

-- INDIAN CURRIES VEG
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, spice_level, is_available, rating, prep_time_minutes, customization_options) VALUES
('m1000000-0000-0000-0000-000000000032', 'c1000000-0000-0000-0000-000000000007', 'Paneer Butter Masala', 'Fresh cottage cheese cubes simmered in a satin-smooth gravy of vine-ripened tomatoes, butter, cashew paste, and aromatic kasuri methi.', 304.00, '/images/dishes/m32.jpg', true, 'Mild', true, 4.9, 15, '[{"name":"Extra Butter Swirl","price":25}]'::jsonb),
('m1000000-0000-0000-0000-000000000033', 'c1000000-0000-0000-0000-000000000007', 'Palak Paneer', 'Silky pureed spinach gravy with fresh paneer cubes, tempered with cumin, garlic, and a touch of cream.', 304.00, '/images/dishes/m33.jpg', true, 'Mild', true, 4.7, 15, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000034', 'c1000000-0000-0000-0000-000000000007', 'Shahi Paneer', 'Royal Mughlai-style paneer in a rich cashew-onion gravy with cream, saffron, and whole aromatic spices.', 304.00, '/images/dishes/m34.jpg', true, 'Mild', true, 4.8, 15, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000035', 'c1000000-0000-0000-0000-000000000007', 'Malai Kofta', 'Soft cottage cheese and potato dumplings in a rich creamy tomato-cashew gravy with cardamom and kasuri methi.', 304.00, '/images/dishes/m35.jpg', true, 'Mild', true, 4.6, 18, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000036', 'c1000000-0000-0000-0000-000000000007', 'Kadai Paneer', 'Paneer cooked in a bold kadai masala with freshly ground coriander, cumin, whole red chillies, and chunky capsicum.', 304.00, '/images/dishes/m36.jpg', true, 'Medium', true, 4.7, 15, '[]'::jsonb);

-- INDIAN CURRIES NON-VEG
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, spice_level, is_available, rating, prep_time_minutes, customization_options) VALUES
('m1000000-0000-0000-0000-000000000037', 'c1000000-0000-0000-0000-000000000008', 'Butter Chicken', 'Tandoor-roasted chicken in legendary silky makhani gravy loaded with butter, cream, and hints of green cardamom and fenugreek.', 349.00, '/images/dishes/m37.jpg', false, 'Mild', true, 4.9, 15, '[{"name":"Extra Cream Float","price":20},{"name":"Boneless Upgrade","price":40}]'::jsonb),
('m1000000-0000-0000-0000-000000000038', 'c1000000-0000-0000-0000-000000000008', 'Kadai Chicken', 'Chicken cooked in a bold kadai masala with freshly ground coriander, cumin, whole red chillies, and chunky capsicum.', 349.00, '/images/dishes/m38.jpg', false, 'Hot', true, 4.7, 18, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000039', 'c1000000-0000-0000-0000-000000000008', 'Chicken Chettinad', 'Fiery Chettinad-style chicken cooked with freshly ground kalpasi, marathi mokku, and aromatic whole spices in a tangy onion base.', 349.00, '/images/dishes/m39.jpg', false, 'Extra Hot', true, 4.8, 20, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000040', 'c1000000-0000-0000-0000-000000000008', 'Mutton Roghan Josh', 'Classic Kashmiri mutton braised with Kashmiri chillies, fennel, and whole spices in a deep red aromatic gravy.', 434.00, '/images/dishes/m40.jpg', false, 'Hot', true, 4.8, 25, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000041', 'c1000000-0000-0000-0000-000000000008', 'Prawns Masala', 'Fresh prawns cooked in a bold onion-tomato masala with coastal spices, coconut, and curry leaves.', 413.00, '/images/dishes/m41.jpg', false, 'Hot', true, 4.7, 20, '[]'::jsonb);

-- NOODLES & RICE
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, spice_level, is_available, rating, prep_time_minutes, customization_options) VALUES
('m1000000-0000-0000-0000-000000000042', 'c1000000-0000-0000-0000-000000000009', 'Veg. Fried Rice', 'Wok-tossed long-grain rice with fresh vegetables, soy sauce, and sesame oil on a blazing high flame.', 285.00, '/images/dishes/m42.jpg', true, 'Mild', true, 4.5, 12, '[{"name":"Schezwan Style","price":10}]'::jsonb),
('m1000000-0000-0000-0000-000000000043', 'c1000000-0000-0000-0000-000000000009', 'Chicken Fried Rice', 'Fragrant wok-tossed rice with shredded chicken, spring onions, eggs, and house seasoning on a blazing hot wok.', 329.00, '/images/dishes/m43.jpg', false, 'Mild', true, 4.7, 15, '[{"name":"Schezwan Style","price":10}]'::jsonb),
('m1000000-0000-0000-0000-000000000044', 'c1000000-0000-0000-0000-000000000009', 'Veg. Noodles', 'Stir-fried hakka noodles tossed with fresh vegetables, soy sauce, chilli sauce, and sesame oil.', 285.00, '/images/dishes/m44.jpg', true, 'Mild', true, 4.5, 12, '[{"name":"Schezwan Style","price":10}]'::jsonb),
('m1000000-0000-0000-0000-000000000045', 'c1000000-0000-0000-0000-000000000009', 'Chicken Noodles', 'Wok-tossed hakka noodles with tender chicken strips, fresh vegetables, soy, and chilli sauce.', 309.00, '/images/dishes/m45.jpg', false, 'Medium', true, 4.6, 15, '[{"name":"Schezwan Style","price":10}]'::jsonb),
('m1000000-0000-0000-0000-000000000046', 'c1000000-0000-0000-0000-000000000009', 'Prawn Fried Rice', 'Wok-tossed fragrant rice with juicy prawns, spring onions, soy sauce, and sesame oil on a high flame.', 380.00, '/images/dishes/m46.jpg', false, 'Mild', true, 4.7, 15, '[]'::jsonb);

-- DESSERTS
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, spice_level, is_available, rating, prep_time_minutes, customization_options) VALUES
('m1000000-0000-0000-0000-000000000047', 'c1000000-0000-0000-0000-000000000010', 'Angoor Basundi', 'Soft chhena dumplings soaked in thickened sweetened milk infused with cardamom, saffron, and crushed pistachios.', 90.00, '/images/dishes/m47.jpg', true, 'Mild', true, 4.8, 5, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000048', 'c1000000-0000-0000-0000-000000000010', 'Apricot Delight', 'A specialty dessert with slow-cooked dried apricots in jaggery syrup, topped with fresh cream and crushed nuts.', 120.00, '/images/dishes/m48.jpg', true, 'Mild', true, 4.6, 5, '[]'::jsonb);

-- BEVERAGES
INSERT INTO menu_items (id, category_id, name, description, price, image_url, is_veg, spice_level, is_available, rating, prep_time_minutes, customization_options) VALUES
('m1000000-0000-0000-0000-000000000049', 'c1000000-0000-0000-0000-000000000011', 'Mango Lassi', 'Thick churned yoghurt smoothie blended with ripe Alphonso mango pulp, a hint of cardamom, and garnished with pistachios.', 124.00, '/images/dishes/m49.jpg', true, 'Mild', true, 4.8, 5, '[{"name":"Add Chia Seeds","price":15}]'::jsonb),
('m1000000-0000-0000-0000-000000000050', 'c1000000-0000-0000-0000-000000000011', 'Butter Milk', 'Chilled spiced chaas made with beaten curd, roasted cumin, fresh ginger, green chilli, and curry leaves.', 68.00, '/images/dishes/m50.jpg', true, 'Mild', true, 4.6, 3, '[]'::jsonb),
('m1000000-0000-0000-0000-000000000051', 'c1000000-0000-0000-0000-000000000011', 'Chocolate Milkshake', 'Rich creamy milkshake blended with premium chocolate ice cream, full-fat milk, and topped with chocolate syrup.', 128.00, '/images/dishes/m51.jpg', true, 'Mild', true, 4.7, 5, '[{"name":"Extra Scoop","price":35}]'::jsonb),
('m1000000-0000-0000-0000-000000000052', 'c1000000-0000-0000-0000-000000000011', 'Fresh Lemon Soda', 'Refreshing chilled soda with freshly squeezed lemon juice, served sweet or salted.', 105.00, '/images/dishes/m52.jpg', true, 'Mild', true, 4.5, 3, '[{"name":"Sweet","price":0},{"name":"Salt","price":0}]'::jsonb),
('m1000000-0000-0000-0000-000000000053', 'c1000000-0000-0000-0000-000000000011', 'Lassi (Sweet)', 'Chilled thick churned yoghurt drink sweetened with sugar and flavoured with rose water and cardamom.', 86.00, '/images/dishes/m53.jpg', true, 'Mild', true, 4.5, 3, '[]'::jsonb);
