INSERT INTO agency (name, slug, word_count) VALUES 
('Environmental Protection Agency', 'epa', 47282),
('Department of Agriculture', 'usda', 28173);

INSERT INTO regulation (text, last_updated, agency_id) VALUES
('Sample regulation text for EPA...', NOW(), 1),
('Another regulation under EPA...', NOW(), 1),
('USDA regulation sample...', NOW(), 2);
