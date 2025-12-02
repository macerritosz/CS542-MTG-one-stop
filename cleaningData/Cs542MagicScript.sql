-- Drop Views
DROP VIEW IF EXISTS vw_leaderboard_decks_most_saved;
DROP VIEW IF EXISTS vw_leaderboard_cards_most_expensive;
DROP VIEW IF EXISTS vw_leaderboard_cards_most_used;
DROP VIEW IF EXISTS vw_leaderboard_players_popular_builders;
DROP VIEW IF EXISTS vw_leaderboard_players_decks_built;

-- Drop Tables
DROP TABLE IF EXISTS Players_Build_Decks;
DROP TABLE IF EXISTS Players_Save_Decks;
DROP TABLE IF EXISTS Cards_In_Combos;
DROP TABLE IF EXISTS Cards_In_Decks;
DROP TABLE IF EXISTS Cards_In_Transactions;
DROP TABLE IF EXISTS Produced_Mana;
DROP TABLE IF EXISTS Color_Identity;
DROP TABLE IF EXISTS Colors_To_Card;
DROP TABLE IF EXISTS Keywords_To_Card;
DROP TABLE IF EXISTS Legalities;
DROP TABLE IF EXISTS Keywords;
DROP TABLE IF EXISTS Colors;
DROP TABLE IF EXISTS Combo;
DROP TABLE IF EXISTS Transaction;
DROP TABLE IF EXISTS Deck;
DROP TABLE IF EXISTS Card;
DROP TABLE IF EXISTS Player;

CREATE TABLE Card (
    cardID VARCHAR(36) PRIMARY KEY,
    oracle_id VARCHAR(36),
    name VARCHAR(50) NOT NULL,
    released_at DATE NOT NULL,
    `set` VARCHAR(12) NOT NULL,
    set_name VARCHAR(54) NOT NULL,
    set_type VARCHAR(16) NOT NULL,
    collector_number INT NOT NULL,
    rarity VARCHAR(8) NOT NULL,
    mana_cost VARCHAR(50),
    mv INT DEFAULT 0 NOT NULL,
    oracle_text VARCHAR(1500),
    power VARCHAR(5),
    loyalty VARCHAR(5),
    toughness VARCHAR(5),
    price_usd DECIMAL(10,2),
    price_foil_usd DECIMAL(10,2),
    image_uris VARCHAR(255) NOT NULL,
    flavor_text VARCHAR(500),
    artist VARCHAR(50) NOT NULL,
    full_art BOOLEAN,
    scryfall_uri VARCHAR(255) NOT NULL,
    rulings_uri VARCHAR(255) NOT NULL,
    purchase_uris VARCHAR(255) NOT NULL,
    edhrec_rank INT
);

CREATE TABLE Deck (
    deckID INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255),
    format VARCHAR(32),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_private BOOLEAN DEFAULT FALSE
);

CREATE TABLE Transaction (
    transaction_time TIMESTAMP PRIMARY KEY DEFAULT CURRENT_TIMESTAMP,
    total_price DECIMAL(10,2)
);

CREATE TABLE Combo (
    comboID VARCHAR(36) PRIMARY KEY,
    description VARCHAR(500)
);

CREATE TABLE Player (
    pid INT AUTO_INCREMENT PRIMARY KEY,
    display_name VARCHAR(100),
    email VARCHAR(100),
    password VARCHAR(100)
);

CREATE TABLE Colors (
    colorId INT PRIMARY KEY,
    colorChar VARCHAR(2),
    colorName VARCHAR(10)
);

INSERT INTO Colors VALUES
    (1, 'W', 'White'),
    (2, 'U', 'Blue'),
    (3, 'B', 'Black'),
    (4, 'R', 'Red'),
    (5, 'G', 'Green'),
    (6, 'C', 'Colorless');

CREATE TABLE Keywords (
    keywordID INT AUTO_INCREMENT PRIMARY KEY,
    keyword VARCHAR(128)
);

CREATE TABLE Colors_To_Card (
    cardID VARCHAR(36),
    colorID INT,
    PRIMARY KEY (cardID, colorID),
    FOREIGN KEY (cardID) REFERENCES Card(cardID) ON DELETE CASCADE,
    FOREIGN KEY (colorID) REFERENCES Colors(colorId) ON DELETE CASCADE
);

CREATE TABLE Color_Identity (
    cardID VARCHAR(36),
    colorID INT,
    PRIMARY KEY (cardID, colorID),
    FOREIGN KEY (cardID) REFERENCES Card(cardID) ON DELETE CASCADE,
    FOREIGN KEY (colorID) REFERENCES Colors(colorId) ON DELETE CASCADE
);

CREATE TABLE Produced_Mana (
    cardID VARCHAR(36),
    colorID INT,
    PRIMARY KEY (cardID, colorID),
    FOREIGN KEY (cardID) REFERENCES Card(cardID) ON DELETE CASCADE,
    FOREIGN KEY (colorID) REFERENCES Colors(colorId) ON DELETE CASCADE
);

CREATE TABLE Legalities (
   cardID VARCHAR(36),
   standard BOOLEAN,
   future BOOLEAN,
   historic BOOLEAN,
   timeless BOOLEAN,
   gladiator BOOLEAN,
   pioneer BOOLEAN,
   modern BOOLEAN,
   legacy BOOLEAN,
   pauper BOOLEAN,
   vintage BOOLEAN,
   penny BOOLEAN,
   commander BOOLEAN,
   oathbreaker BOOLEAN,
   standardbrawl BOOLEAN,
   brawl BOOLEAN,
   alchemy BOOLEAN,
   paupercommander BOOLEAN,
   duel BOOLEAN,
   oldschool BOOLEAN,
   premodern BOOLEAN,
   predh BOOLEAN,
   FOREIGN KEY (cardID) REFERENCES Card(cardID) ON DELETE CASCADE
);

CREATE TABLE Keywords_To_Card (
    cardID VARCHAR(36),
    keywordID INT,
    PRIMARY KEY (cardID, keywordID),
    FOREIGN KEY (cardID) REFERENCES Card(cardID) ON DELETE CASCADE,
    FOREIGN KEY (keywordID) REFERENCES Keywords(keywordID) ON DELETE CASCADE
);

CREATE TABLE Cards_In_Transactions (
   transaction_time TIMESTAMP,
   cardID VARCHAR(36),
   ct_quantity INT,
   item_price DECIMAL(10,2),
   PRIMARY KEY (transaction_time, cardID),
   FOREIGN KEY (transaction_time) REFERENCES Transaction(transaction_time) ON DELETE CASCADE,
   FOREIGN KEY (cardID) REFERENCES Card(cardID) ON DELETE CASCADE
);

CREATE TABLE Cards_In_Decks (
    deckID INT,
    cardID VARCHAR(36),
    quantity INT,
    PRIMARY KEY (deckID, cardID),
    FOREIGN KEY (deckID) REFERENCES Deck(deckID) ON DELETE CASCADE,
    FOREIGN KEY (cardID) REFERENCES Card(cardID) ON DELETE CASCADE
);

CREATE TABLE Cards_In_Combos (
    cardID VARCHAR(36),
    comboID VARCHAR(36),
    PRIMARY KEY (cardID, comboID),
    FOREIGN KEY (cardID) REFERENCES Card(cardID) ON DELETE CASCADE,
    FOREIGN KEY (comboID) REFERENCES Combo(comboID) ON DELETE CASCADE
);

CREATE TABLE Players_Build_Decks (
    pid INT,
    deckID INT,
    display_name VARCHAR(100),
    PRIMARY KEY (pid, deckID),
    FOREIGN KEY (pid) REFERENCES Player(pid) ON DELETE CASCADE,
    FOREIGN KEY (deckID) REFERENCES Deck(deckID) ON DELETE CASCADE
);

CREATE TABLE Players_Save_Decks (
    pid INT,
    deckID INT,
    display_name VARCHAR(100),
    PRIMARY KEY (pid, deckID),
    FOREIGN KEY (pid) REFERENCES Player(pid) ON DELETE CASCADE,
    FOREIGN KEY (deckID) REFERENCES Deck(deckID) ON DELETE CASCADE
);

-- ============================================================================
-- LEADERBOARD VIEWS
-- ============================================================================

-- PLAYER LEADERBOARDS

-- View 1: Top Players by Decks Built
-- Shows players ranked by the number of decks they have created
CREATE VIEW vw_leaderboard_players_decks_built AS
SELECT 
    pbd.display_name AS display_name,
    COUNT(DISTINCT pbd.deckID) AS total_decks_built,
    COUNT(DISTINCT CASE WHEN d.is_private = 0 THEN d.deckID END) AS public_decks,
    COUNT(DISTINCT CASE WHEN d.is_private = 1 THEN d.deckID END) AS private_decks,
    MAX(d.created_at) AS most_recent_deck
FROM Players_Build_Decks pbd
JOIN Deck d ON pbd.deckID = d.deckID
GROUP BY pbd.display_name
ORDER BY total_decks_built DESC, most_recent_deck DESC;

-- View 2: Top Players by Decks Saved
-- Shows players ranked by the number of decks they have saved/favorited
-- View 3: Most Popular Deck Builders
-- Shows players whose decks have been saved the most by other players
CREATE VIEW vw_leaderboard_players_popular_builders AS
SELECT 
    pbd.display_name AS display_name,
    COUNT(DISTINCT pbd.deckID) AS decks_built,
    COUNT(DISTINCT psd.deckID) AS total_saves_received,
    COUNT(DISTINCT psd.display_name) AS unique_savers,
    ROUND(COUNT(DISTINCT psd.deckID) / NULLIF(COUNT(DISTINCT pbd.deckID), 0), 2) AS avg_saves_per_deck
FROM Players_Build_Decks pbd
LEFT JOIN Deck d ON pbd.deckID = d.deckID AND d.is_private = 0
LEFT JOIN Players_Save_Decks psd ON d.deckID = psd.deckID
GROUP BY pbd.display_name
HAVING decks_built > 0
ORDER BY total_saves_received DESC, avg_saves_per_deck DESC;

-- CARD LEADERBOARDS

-- View 4: Most Used Cards in Decks
-- Shows cards ranked by how many decks they appear in and total quantity
CREATE VIEW vw_leaderboard_cards_most_used AS
SELECT 
    c.cardID,
    c.name,
    c.rarity,
    c.mv AS mana_value,
    c.price_usd,
    COUNT(DISTINCT cid.deckID) AS decks_using_card,
    SUM(cid.quantity) AS total_quantity_in_decks,
    AVG(cid.quantity) AS avg_quantity_per_deck,
    MAX(cid.quantity) AS max_quantity_in_single_deck
FROM Card c
JOIN Cards_In_Decks cid ON c.cardID = cid.cardID
GROUP BY c.cardID, c.name, c.rarity, c.mv, c.price_usd
HAVING decks_using_card > 0
ORDER BY decks_using_card DESC, total_quantity_in_decks DESC;

-- View 5: Most Expensive Cards
-- Shows cards ranked by price (USD)
CREATE VIEW vw_leaderboard_cards_most_expensive AS
SELECT 
    cardID,
    name,
    rarity,
    mv AS mana_value,
    price_usd,
    price_foil_usd,
    set_name,
    image_uris
FROM Card
WHERE price_usd IS NOT NULL
ORDER BY price_usd DESC;

-- View 6: Highest Mana Value Cards
-- Shows cards ranked by mana value (converted mana cost)
-- View 7: Most Popular Cards by Format
-- Shows cards ranked by usage in decks of specific formats
-- DECK LEADERBOARDS

-- View 8: Most Saved/Favorited Decks
-- Shows decks ranked by how many players have saved them
CREATE VIEW vw_leaderboard_decks_most_saved AS
SELECT 
    d.deckID,
    d.title,
    d.format,
    d.created_at,
    pbd.display_name AS builder_name,
    COUNT(DISTINCT psd.deckID) AS total_saves,
    COUNT(DISTINCT psd.display_name) AS unique_savers,
    (SELECT COUNT(*) FROM Cards_In_Decks WHERE deckID = d.deckID) AS total_cards
FROM Deck d
JOIN Players_Save_Decks psd ON d.deckID = psd.deckID
LEFT JOIN Players_Build_Decks pbd ON d.deckID = pbd.deckID
WHERE d.is_private = 0
GROUP BY d.deckID, d.title, d.format, d.created_at, pbd.display_name
ORDER BY total_saves DESC, unique_savers DESC;

-- View 9: Most Recent Public Decks
-- Shows recently created public decks
-- View 10: Decks by Format (Most Popular)
-- Shows the most popular decks in each format
-- View 11: Largest Decks (by card count)
-- Shows decks ranked by total number of cards