CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL
);

INSERT INTO messages (text)
SELECT 'Hello, World!'
WHERE NOT EXISTS (SELECT 1 FROM messages);
