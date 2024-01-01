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
INSERT INTO users (id, username, pw_hash) VALUES
    (1, 'The Traveler', '1234'),
    (2, 'justB612', '1234'),
    (3, 'dreamer042', '1234'),
    (4, 'sprout', '1234'),
    (5, 'Homo Trypens', '1234'),
    (6, 'bIRD_', '1234')
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
    (0, 0),
    (3, 1),
    (11, 2),
    (7, 3),
    (29, 4),
    (11, 5),
    (23, 6),
    (23, 1),
    (23, 2),
    (23, 3),
    (23, 5),
    (17, 5)
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
