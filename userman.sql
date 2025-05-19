-- Bestehende Tabellen löschen (wichtig für sauberen Neustart)
DROP TABLE IF EXISTS Pet;
DROP TABLE IF EXISTS User;

-- Tabelle: User
CREATE TABLE User
(
    firstName TEXT         NOT NULL,
    lastName  TEXT         NOT NULL,
    password  TEXT         NOT NULL,
    email     VARCHAR(320) NOT NULL
        PRIMARY KEY
);

-- Tabelle: Pet
CREATE TABLE Pet
(
    name  VARCHAR(25)  NOT NULL
        PRIMARY KEY,
    kind  TEXT         NOT NULL,
    email VARCHAR(320) NOT NULL,
    CONSTRAINT Pet_User_email_fk
        FOREIGN KEY (email) REFERENCES User (email)
);

-- Beispiel-User (aus der echten DB)
INSERT INTO User (firstName, lastName, password, email) VALUES
('Glen', 'Schmitt', '56743254678', 'Glen.55@web.de'),
('Peter', 'Maron', '567432', 'markmaron55@web.de'),
('Mark', 'Maron', '567432', 'markmaron77@web.de'),
('Maya', 'Schrein', '56743254678jhgfdjmh', 'Maya.schrein54@web.de'),
('Willi', 'Wink', '56743254678jhgfd', 'wink.willi55@web.de');

-- Haustiere (aus der echten DB)
INSERT INTO Pet (name, kind, email) VALUES
('Mascha', 'Katze', 'Maya.schrein54@web.de'),
('Molly', 'hund', 'markmaron55@web.de'),
('Rocky', 'Hase', 'markmaron77@web.de');