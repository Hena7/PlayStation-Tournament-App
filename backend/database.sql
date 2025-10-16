CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL, 
    is_admin BOOLEAN DEFAULT false
);

CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    admin_id INTEGER REFERENCES users(id)
);

CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    tournament_id INTEGER REFERENCES tournaments(id)
);

CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER REFERENCES tournaments(id),
    player1_id INTEGER REFERENCES users(id),
    player2_id INTEGER REFERENCES users(id),
    winner_id INTEGER REFERENCES users(id),
    round INTEGER NOT NULL
);

CREATE TABLE rankings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),
    tournament_id INTEGER REFERENCES tournaments(id),
    rank INTEGER NOT NULL
);