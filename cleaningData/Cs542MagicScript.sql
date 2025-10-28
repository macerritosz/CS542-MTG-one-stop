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

CREATE TABLE Players_Save_Decks (
    pid INT,
    deckID INT,
    PRIMARY KEY (pid, deckID),
    FOREIGN KEY (pid) REFERENCES Player(pid) ON DELETE CASCADE,
    FOREIGN KEY (deckID) REFERENCES Deck(deckID) ON DELETE CASCADE
);

CREATE TABLE Players_Build_Decks (
    pid INT,
    deckID INT,
    PRIMARY KEY (pid, deckID),
    FOREIGN KEY (pid) REFERENCES Player(pid) ON DELETE CASCADE,
    FOREIGN KEY (deckID) REFERENCES Deck(deckID) ON DELETE CASCADE
);