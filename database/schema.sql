-- Table: agency
CREATE TABLE agency (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255),
    word_count INT DEFAULT 0
);

-- Table: regulation
CREATE TABLE regulation (
    id INT AUTO_INCREMENT PRIMARY KEY,
    text TEXT NOT NULL,
    last_updated DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    agency_id INT,
    FOREIGN KEY (agency_id) REFERENCES agency(id) ON DELETE SET NULL
);
