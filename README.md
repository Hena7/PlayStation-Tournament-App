# PlayStation Tournament App

## Project Structure

```
tournament-app/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── AuthForm.jsx
│   │   │   ├── UserDashboard.jsx
│   │   │   └── AdminPanel.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── lib/
│   │       └── utils.js
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── tournament.js
│   │   │   └── ranking.js
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   └── server.js
│   ├── package.json
│   └── .env
└── README.md
```

## Database Setup

Run the following SQL commands in your PostgreSQL database to create the necessary tables:

```sql
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

CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  tournament_id INTEGER REFERENCES tournaments(id),
  message VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Setup Instructions

1. **Backend**:

   - Navigate to the `backend` folder and run `npm install`.
   - Create a `.env` file with the `DATABASE_URL` and `JWT_SECRET`.
   - Run `npm run dev` to start the backend server.

2. **Frontend**:

   - Navigate to the `frontend` folder and run `npm install`.
   - Run `npm run dev` to start the Vite development server.

3. **Database**:
   - Set up a PostgreSQL database and run the provided SQL commands.
   - Update the `.env` file with your database credentials.

## Scalability Notes

- **Backend**: Uses Express with a modular route structure and PostgreSQL for scalability. Connection pooling is handled by the `pg` library.
- **Frontend**: Vite and React ensure fast builds and a responsive UI. Tailwind CSS and Shadcn/ui components provide a scalable and maintainable UI.
- **Database**: PostgreSQL supports large datasets and concurrent connections, with foreign keys ensuring data integrity.

## UI/UX Design

- The interface uses a dark theme with a blue gradient for a modern, gaming-inspired aesthetic.
- Shadcn/ui components ensure a polished and accessible UI.
- Responsive design works on both desktop and mobile devices.
