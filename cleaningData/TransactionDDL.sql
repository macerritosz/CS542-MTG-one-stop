Drop table Transaction;
Drop table Cards_In_Transactions;
drop table Transaction_Staging;
drop table Players_In_Transactions;

CREATE TABLE Transaction (
     transaction_time   TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) PRIMARY KEY ,
     total_price        DECIMAL(10, 2) NOT NULL
);

CREATE TABLE Cards_In_Transactions (
    transaction_time TIMESTAMP(6),
    cardID VARCHAR(36),
    ct_quantity INT,
    item_price DECIMAL(10,2),
    is_foil tinyint(1) DEFAULT 0,
    PRIMARY KEY (transaction_time, cardID),
    FOREIGN KEY (transaction_time) REFERENCES Transaction(transaction_time) ON DELETE CASCADE,
    FOREIGN KEY (cardID) REFERENCES Card(cardID) ON DELETE CASCADE
);


CREATE TABLE Players_In_Transactions (
     transaction_time  TIMESTAMP(6) primary key,
     buyerName       VARCHAR(100) NOT NULL,
     sellerName      VARCHAR(100) NOT NULL,

     FOREIGN KEY (transaction_time) REFERENCES Transaction(transaction_time)
         ON DELETE CASCADE
);

CREATE TABLE Transaction_Staging (
    staging_id        INT AUTO_INCREMENT PRIMARY KEY,
    transaction_time TIMESTAMP(6)
        NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
    cardID            VARCHAR(36) NOT NULL,
    quantity          INT NOT NULL,
    card_price        DECIMAL(10,2) NOT NULL,
    is_foil           tinyint(1) DEFAULT 0,
    total_price DECIMAL(10,2),
    buyerName         VARCHAR(100) NOT NULL,
    sellerName        VARCHAR(100) NOT NULL
);


DELIMITER $$

CREATE TRIGGER create_related_transaction_tables
    AFTER INSERT ON Transaction_Staging
    FOR EACH ROW
BEGIN
    INSERT INTO Transaction (transaction_time, total_price)
    VALUES (NEW.transaction_time, NEW.total_price);

    -- Insert into Cards table
    INSERT INTO Cards_In_Transactions (
        transaction_time, cardID, ct_quantity, item_price, is_foil
    )
    VALUES (
               NEW.transaction_time,
               NEW.cardID,
               NEW.quantity,
               NEW.card_price,
                NEW.is_foil
           );

    -- Insert into Players table
    INSERT INTO Players_In_Transactions (
        transaction_time, buyerName, sellerName
    )
    VALUES (
               NEW.transaction_time,
               NEW.buyerName,
               NEW.sellerName
           );
END$$

DELIMITER ;
show triggers;

CREATE INDEX idx_buyerName ON Players_In_Transactions(buyerName, transaction_time);
CREATE INDEX idx_sellerName ON Players_In_Transactions(sellerName, transaction_time);