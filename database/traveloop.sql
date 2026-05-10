-- ============================================================
--  TRAVELOOP DATABASE SCHEMA
--  Local MySQL | Version 1.0
-- ============================================================

CREATE DATABASE IF NOT EXISTS traveloop CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE traveloop;

-- ── 1. users ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  profile_photo VARCHAR(255) DEFAULT NULL,
  role          ENUM('user','admin') DEFAULT 'user',
  language      VARCHAR(10) DEFAULT 'en',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
);

-- ── 2. cities ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cities (
  id               INT AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(100) NOT NULL,
  country          VARCHAR(100) NOT NULL,
  region           VARCHAR(100) DEFAULT NULL,
  cost_index       DECIMAL(8,2) DEFAULT 50.00,
  popularity       INT DEFAULT 0,
  suggested_season VARCHAR(50) DEFAULT NULL,
  image_url        VARCHAR(500) DEFAULT NULL,
  description      TEXT DEFAULT NULL,
  INDEX idx_name (name),
  INDEX idx_country (country)
);

-- ── 3. trips ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT NOT NULL,
  name        VARCHAR(200) NOT NULL,
  description TEXT DEFAULT NULL,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  cover_photo VARCHAR(255) DEFAULT NULL,
  is_public   TINYINT(1) DEFAULT 0,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- ── 4. trip_stops ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_stops (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  trip_id        INT NOT NULL,
  city_id        INT NOT NULL,
  arrival_date   DATE DEFAULT NULL,
  departure_date DATE DEFAULT NULL,
  order_index    INT DEFAULT 0,
  notes          TEXT DEFAULT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE RESTRICT,
  INDEX idx_trip_id (trip_id)
);

-- ── 5. activities ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS activities (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  name           VARCHAR(200) NOT NULL,
  category       ENUM('Adventure','Food','Sightseeing','Culture','Shopping','Wellness','Nightlife','Other') DEFAULT 'Other',
  description    TEXT DEFAULT NULL,
  duration_hrs   DECIMAL(5,2) DEFAULT 1.00,
  estimated_cost DECIMAL(10,2) DEFAULT 0.00,
  image_url      VARCHAR(500) DEFAULT NULL,
  city_id        INT DEFAULT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE SET NULL,
  INDEX idx_category (category),
  INDEX idx_city_id (city_id)
);

-- ── 6. trip_activities ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trip_activities (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  stop_id        INT NOT NULL,
  activity_id    INT NOT NULL,
  scheduled_date DATE DEFAULT NULL,
  custom_cost    DECIMAL(10,2) DEFAULT NULL,
  notes          TEXT DEFAULT NULL,
  created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE CASCADE,
  FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
  INDEX idx_stop_id (stop_id)
);

-- ── 7. budgets ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS budgets (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  trip_id       INT NOT NULL UNIQUE,
  total_budget  DECIMAL(12,2) DEFAULT 0.00,
  transport     DECIMAL(12,2) DEFAULT 0.00,
  stay          DECIMAL(12,2) DEFAULT 0.00,
  activities    DECIMAL(12,2) DEFAULT 0.00,
  meals         DECIMAL(12,2) DEFAULT 0.00,
  miscellaneous DECIMAL(12,2) DEFAULT 0.00,
  updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
);

-- ── 8. packing_items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS packing_items (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  trip_id    INT NOT NULL,
  user_id    INT NOT NULL,
  name       VARCHAR(200) NOT NULL,
  category   ENUM('Clothing','Documents','Electronics','Medicines','Toiletries','Accessories','General') DEFAULT 'General',
  is_packed  TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trip_id (trip_id)
);

-- ── 9. notes ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notes (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  trip_id    INT NOT NULL,
  stop_id    INT DEFAULT NULL,
  user_id    INT NOT NULL,
  content    TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  FOREIGN KEY (stop_id) REFERENCES trip_stops(id) ON DELETE SET NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_trip_id (trip_id)
);

-- ── 10. shared_itineraries ────────────────────────────────────
CREATE TABLE IF NOT EXISTS shared_itineraries (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  trip_id      INT NOT NULL,
  public_token VARCHAR(36) NOT NULL UNIQUE,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
  INDEX idx_token (public_token)
);

-- ── 11. saved_destinations ────────────────────────────────────
CREATE TABLE IF NOT EXISTS saved_destinations (
  id       INT AUTO_INCREMENT PRIMARY KEY,
  user_id  INT NOT NULL,
  city_id  INT NOT NULL,
  saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_city (user_id, city_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (city_id) REFERENCES cities(id) ON DELETE CASCADE
);


-- ============================================================
--  SEED DATA
-- ============================================================

-- Admin user (password: Admin@123)
INSERT IGNORE INTO users (name, email, password_hash, role) VALUES
('Admin', 'admin@traveloop.com', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj0NqPqxT0VC', 'admin');

-- Cities
INSERT IGNORE INTO cities (name, country, region, cost_index, popularity, suggested_season, image_url, description) VALUES
('Paris', 'France', 'Europe', 120.00, 98, 'Spring', 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800', 'The City of Light, known for art, fashion, and the Eiffel Tower.'),
('Tokyo', 'Japan', 'Asia', 100.00, 96, 'Autumn', 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800', 'A vibrant metropolis blending tradition and cutting-edge modernity.'),
('New York', 'USA', 'North America', 150.00, 95, 'Fall', 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=800', 'The city that never sleeps — iconic skyline and cultural melting pot.'),
('Bali', 'Indonesia', 'Asia', 40.00, 93, 'Summer', 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800', 'Tropical paradise with stunning temples, beaches, and rice terraces.'),
('London', 'UK', 'Europe', 130.00, 94, 'Summer', 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=800', 'Historic city with iconic landmarks, museums, and royal heritage.'),
('Rome', 'Italy', 'Europe', 95.00, 91, 'Spring', 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?w=800', 'The Eternal City — where ancient history meets vibrant street life.'),
('Barcelona', 'Spain', 'Europe', 90.00, 89, 'Summer', 'https://images.unsplash.com/photo-1583422409516-2895a77efded?w=800', 'Gaudí architecture, beach vibes, and world-class gastronomy.'),
('Dubai', 'UAE', 'Middle East', 110.00, 88, 'Winter', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800', 'Futuristic skyline, luxury shopping, and desert adventures.'),
('Sydney', 'Australia', 'Oceania', 115.00, 87, 'Spring', 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?w=800', 'Iconic Opera House, harbour bridge, and stunning beaches.'),
('Singapore', 'Singapore', 'Asia', 105.00, 90, 'Any Season', 'https://images.unsplash.com/photo-1565967511849-76a60a516170?w=800', 'Clean, green, and vibrant city-state with world-class food.'),
('Amsterdam', 'Netherlands', 'Europe', 100.00, 85, 'Spring', 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=800', 'Canal city famous for museums, bicycles, and tulip fields.'),
('Istanbul', 'Turkey', 'Europe/Asia', 55.00, 86, 'Spring', 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=800', 'Where East meets West — mosques, bazaars, and Bosphorus views.'),
('Kyoto', 'Japan', 'Asia', 85.00, 88, 'Spring', 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800', 'Ancient capital with thousands of temples and traditional culture.'),
('Cape Town', 'South Africa', 'Africa', 50.00, 82, 'Summer', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800', 'Dramatic landscapes, Table Mountain, and vibrant culture.'),
('Prague', 'Czech Republic', 'Europe', 60.00, 84, 'Spring', 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=800', 'Fairy-tale old town with Gothic architecture and rich history.'),
('Santorini', 'Greece', 'Europe', 130.00, 91, 'Summer', 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800', 'Iconic white-washed buildings and breathtaking caldera views.'),
('Marrakech', 'Morocco', 'Africa', 35.00, 80, 'Spring', 'https://images.unsplash.com/photo-1489493887464-892be6d1daae?w=800', 'Vibrant souks, riads, and the exotic Jemaa el-Fna square.'),
('Bangkok', 'Thailand', 'Asia', 35.00, 89, 'Winter', 'https://images.unsplash.com/photo-1563492065599-3520f775eeed?w=800', 'Ornate temples, street food paradise, and electric nightlife.'),
('Maldives', 'Maldives', 'Asia', 300.00, 92, 'Winter', 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800', 'Crystal-clear waters, overwater bungalows, and coral reefs.'),
('New Delhi', 'India', 'Asia', 25.00, 78, 'Winter', 'https://images.unsplash.com/photo-1587474260584-136574528ed5?w=800', 'Chaotic, colorful capital with Mughal heritage and street food.');

-- Activities
INSERT IGNORE INTO activities (name, category, description, duration_hrs, estimated_cost, city_id) VALUES
-- Paris (1)
('Eiffel Tower Visit', 'Sightseeing', 'Visit the iconic iron tower with panoramic city views.', 3.0, 30.00, 1),
('Louvre Museum Tour', 'Culture', 'Explore the world-famous museum housing the Mona Lisa.', 4.0, 20.00, 1),
('Seine River Cruise', 'Sightseeing', 'A scenic boat tour along the River Seine at sunset.', 1.5, 15.00, 1),
('Croissant Baking Class', 'Food', 'Learn to bake authentic French pastries with a local chef.', 3.0, 80.00, 1),
-- Tokyo (2)
('Shibuya Crossing Walk', 'Sightseeing', 'Experience the world''s busiest pedestrian crossing.', 1.0, 0.00, 2),
('Tsukiji Market Food Tour', 'Food', 'Sample fresh sushi and seafood at the famous fish market.', 2.5, 50.00, 2),
('TeamLab Planets', 'Culture', 'Immersive digital art museum experience.', 2.0, 35.00, 2),
('Mount Fuji Day Trip', 'Adventure', 'Day hike or sightseeing around iconic Mount Fuji.', 10.0, 80.00, 2),
-- New York (3)
('Central Park Walk', 'Sightseeing', 'Stroll through the iconic 843-acre urban park.', 2.0, 0.00, 3),
('Statue of Liberty Tour', 'Culture', 'Ferry to Liberty Island and tour the iconic statue.', 4.0, 25.00, 3),
('Broadway Show', 'Culture', 'Catch a world-class Broadway performance.', 3.0, 120.00, 3),
('NYC Food Crawl', 'Food', 'Sample diverse cuisines from street vendors across boroughs.', 4.0, 60.00, 3),
-- Bali (4)
('Uluwatu Temple Sunset', 'Culture', 'Watch the sunset at the cliff-top Uluwatu temple.', 3.0, 5.00, 4),
('Rice Terrace Trek', 'Adventure', 'Trek through the stunning Tegalalang rice terraces.', 4.0, 10.00, 4),
('Balinese Cooking Class', 'Food', 'Learn to cook traditional Balinese dishes.', 4.0, 35.00, 4),
('Surfing Lesson', 'Adventure', 'Learn to surf on Kuta or Seminyak beach.', 2.0, 25.00, 4),
-- London (5)
('Tower of London', 'Culture', 'Explore the historic castle and see the Crown Jewels.', 3.0, 30.00, 5),
('British Museum', 'Culture', 'World-class museum with artifacts from across history.', 3.0, 0.00, 5),
('Afternoon Tea', 'Food', 'Experience the quintessential British afternoon tea tradition.', 2.0, 55.00, 5),
-- Rome (6)
('Colosseum Tour', 'Culture', 'Guided tour of the ancient Roman amphitheater.', 3.0, 25.00, 6),
('Vatican Museums', 'Culture', 'Explore the vast Vatican collections including the Sistine Chapel.', 4.0, 30.00, 6),
('Trevi Fountain Visit', 'Sightseeing', 'Toss a coin in the famous Baroque fountain.', 1.0, 0.00, 6),
-- Barcelona (7)
('Sagrada Familia', 'Culture', 'Gaudí''s breathtaking unfinished basilica.', 2.5, 30.00, 7),
('Park Güell Walk', 'Sightseeing', 'Explore Gaudí''s colorful mosaic park with city views.', 2.0, 14.00, 7),
('La Boqueria Market', 'Food', 'Vibrant food market with local produce and tapas.', 1.5, 20.00, 7),
-- Dubai (8)
('Burj Khalifa Top', 'Sightseeing', 'Visit the observation deck of the world''s tallest building.', 2.0, 40.00, 8),
('Desert Safari', 'Adventure', 'Thrilling dune bashing, camel ride, and BBQ dinner.', 6.0, 80.00, 8),
('Dubai Mall Shopping', 'Shopping', 'Shop at one of the world''s largest shopping malls.', 4.0, 100.00, 8),
-- Singapore (10)
('Gardens by the Bay', 'Sightseeing', 'Futuristic nature park with Supertrees and domes.', 3.0, 15.00, 10),
('Hawker Centre Food Tour', 'Food', 'Sample Singapore''s incredible street food culture.', 2.0, 15.00, 10),
-- Generic activities (no city)
('City Walking Tour', 'Sightseeing', 'Guided walk through the city highlights.', 3.0, 20.00, NULL),
('Local Market Visit', 'Shopping', 'Explore the local market for souvenirs and street food.', 2.0, 30.00, NULL),
('Photography Walk', 'Sightseeing', 'Capture the city''s best photo spots with a guide.', 3.0, 25.00, NULL),
('Yoga & Meditation Session', 'Wellness', 'Sunrise yoga and meditation experience.', 1.5, 15.00, NULL),
('Cooking Class', 'Food', 'Learn to cook local dishes with a chef.', 3.5, 60.00, NULL),
('Bicycle City Tour', 'Adventure', 'Explore the city by bicycle with a local guide.', 3.0, 25.00, NULL);
