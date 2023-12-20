CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY,
    username VARCHAR(255),
    message TEXT,
    date TIMESTAMP
);

