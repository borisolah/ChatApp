CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    user_color VARCHAR(7),
    text_color VARCHAR(7),
    default_search VARCHAR(16) DEFAULT 'duck',
    chat_nick VARCHAR(255) UNIQUE,
    mood VARCHAR(255),
    substance VARCHAR(255),
    activity VARCHAR(255),
    chat_active TIMESTAMP,
    pw_salt VARCHAR(64),
    pw_hash VARCHAR(1024)
);
INSERT INTO users (id, username, chat_nick, user_color, text_color, mood, substance, activity)
VALUES (0, 'Kikker', 'Kikker', '#c8abb6', '#91be6c', 'pleased', 'bufo', 'vision')
;
INSERT INTO users (username, pw_hash) VALUES
    ('The Traveler', '1234'),
    ('justB612', '1234'),
    ('dreamer042', '1234'),
    ('sprout', '1234'),
    ('Homo Trypens', '1234'),
    ('bIRD_', '1234')
;


CREATE TABLE IF NOT EXISTS groups (
    id SERIAL PRIMARY KEY,
    name VARCHAR(16) UNIQUE
);
INSERT INTO groups (id, name) VALUES
    (0, 'kikker'),
    (3, 'admin'),
    (7, 'mod'),
    (11, 'senior'),
    (17, 'welcome'),
    (23, 'user'),
    (29, 'sprout')
;


CREATE TABLE IF NOT EXISTS channels (
    id SERIAL PRIMARY KEY,
    name VARCHAR(32) UNIQUE,
    privilege int REFERENCES groups
);
INSERT INTO channels (id, name, privilege) VALUES
    (1, 'Welcome Area', 29),
    (2, 'Questionnaire', 23),
    (3, 'Fun and Offtopic', 23),
    (4, 'Hyperspace Chat', 23)
;

CREATE TABLE IF NOT EXISTS channel_subscriptions (
    id SERIAL PRIMARY KEY,
    channel int REFERENCES channels,
    userid int REFERENCES users
);

CREATE TABLE IF NOT EXISTS channel_users (
    id SERIAL PRIMARY KEY,
    channel int REFERENCES channels,
    userid int REFERENCES users
);

CREATE TABLE IF NOT EXISTS group_users (
    id SERIAL PRIMARY KEY,
    groupid int REFERENCES groups,
    userid int REFERENCES users
);
INSERT INTO group_users (groupid, userid) VALUES
    (0, 0),  -- kikker kikker
    (3, 1),  -- trav admin
    (11, 2), -- justB612 senior
    (7, 3),  -- dreamer042 mod
    (29, 4), -- sprout sprout
    (11, 5), -- HT senior
    (23, 6), -- bIRD_ user
    (23, 1), -- trav user
    (23, 2), -- justB612 user
    (23, 3), -- dreamer042 user
    (23, 5), -- HT user
    (17, 5)  -- HT welcome committee
;

CREATE TABLE IF NOT EXISTS channel_uploads (
    id UUID PRIMARY KEY,
    channel int REFERENCES channels,
    userid int REFERENCES users,
    username VARCHAR(255),
    user_color VARCHAR(7),
    name VARCHAR(255),
--  path VARCHAR(255), // can be constructed from id and name
    date TIMESTAMP
);

CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,
    channel int REFERENCES channels,
    userid int REFERENCES users,
    username VARCHAR(255),
    type VARCHAR(16),
    message TEXT,
    user_color VARCHAR(7),
    text_color VARCHAR(7),
    date TIMESTAMP
);
