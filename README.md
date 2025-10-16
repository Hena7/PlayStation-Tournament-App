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

## Frontend Setup

### package.json
```json
{
  "name": "tournament-frontend",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "@radix-ui/react-icons": "^1.3.0",
    "@radix-ui/react-slot": "^1.1.0",
    "axios": "^1.7.7",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.2",
    "tailwind-merge": "^2.5.2",
    "tailwindcss-animate": "^1.0.7"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.47",
    "tailwindcss": "^3.4.13",
    "vite": "^5.4.8"
  }
}
```

### vite.config.js
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000'
    }
  }
})
```

### tailwind.config.js
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a73e8',
        secondary: '#f5f5f5',
        accent: '#ff6b6b',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
```

### postcss.config.js
```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: 'Inter', sans-serif;
  background-color: #0f172a;
  color: #ffffff;
}
```

### src/App.jsx
```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import AuthForm from './components/AuthForm'
import UserDashboard from './components/UserDashboard'
import AdminPanel from './components/AdminPanel'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AuthForm />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
```

### src/main.jsx
```jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

### src/components/AuthForm.jsx
```jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './ui/button'
import { Input } from './ui/input'
import axios from 'axios'

function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({ username: '', email: '', password: '' })
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const url = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await axios.post(url, formData)
      localStorage.setItem('token', response.data.token)
      navigate(response.data.user.isAdmin ? '/admin' : '/dashboard')
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 to-black">
      <div className="bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">{isLogin ? 'Login' : 'Register'}</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <Input
              type="text"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full"
            />
          )}
          <Input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full"
          />
          <Input
            type="password"
            placeholder="Password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full"
          />
          <Button type="submit" className="w-full bg-primary hover:bg-blue-700">
            {isLogin ? 'Login' : 'Register'}
          </Button>
        </form>
        <Button
          variant="link"
          onClick={() => setIsLogin(!isLogin)}
          className="mt-4 w-full text-blue-400"
        >
          {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
        </Button>
      </div>
    </div>
  )
}

export default AuthForm
```

### src/components/UserDashboard.jsx
```jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

function UserDashboard() {
  const [rankings, setRankings] = useState([])
  const [matches, setMatches] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token')
        const [rankingsRes, matchesRes] = await Promise.all([
          axios.get('/api/ranking', { headers: { Authorization: `Bearer ${token}` } }),
          axios.get('/api/tournament/matches', { headers: { Authorization: `Bearer ${token}` } }),
        ])
        setRankings(rankingsRes.data)
        setMatches(matchesRes.data)
      } catch (error) {
        console.error(error)
      }
    }
    fetchData()
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 to-black">
      <h1 className="text-4xl font-bold mb-8 text-center">User Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-none">
          <CardHeader>
            <CardTitle>Your Rankings</CardTitle>
          </CardHeader>
          <CardContent>
            {rankings.map((ranking) => (
              <p key={ranking.id}>
                Tournament: {ranking.tournament_id} - Rank: {ranking.rank}
              </p>
            ))}
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-none">
          <CardHeader>
            <CardTitle>Match History</CardTitle>
          </CardHeader>
          <CardContent>
            {matches.map((match) => (
              <p key={match.id}>
                Round {match.round}: {match.player1_id} vs {match.player2_id} - Winner: {match.winner_id || 'Pending'}
              </p>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default UserDashboard
```

### src/components/AdminPanel.jsx
```jsx
import { useState, useEffect } from 'react'
import axios from 'axios'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'

function AdminPanel() {
  const [participantsCount, setParticipantsCount] = useState(10)
  const [tournament, setTournament] = useState(null)
  const [matches, setMatches] = useState([])
  const [rankings, setRankings] = useState([])

  const handleCreateTournament = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await axios.post(
        '/api/tournament/create',
        { name: `Tournament ${new Date().toISOString()}`, count: participantsCount },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setTournament(response.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleUpdateRanking = async (userId, rank) => {
    try {
      const token = localStorage.getItem('token')
      await axios.post(
        '/api/ranking',
        { user_id: userId, tournament_id: tournament.id, rank },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setRankings([...rankings, { user_id: userId, rank }])
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    const fetchMatches = async () => {
      if (tournament) {
        const token = localStorage.getItem('token')
        const response = await axios.get(`/api/tournament/${tournament.id}/matches`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        setMatches(response.data)
      }
    }
    fetchMatches()
  }, [tournament])

  return (
    <div className="min-h-screen p-8 bg-gradient-to-br from-blue-900 to-black">
      <h1 className="text-4xl font-bold mb-8 text-center">Admin Panel</h1>
      <Card className="bg-gray-800 border-none mb-6">
        <CardHeader>
          <CardTitle>Create Tournament</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            placeholder="Number of participants (10 or 50)"
            value={participantsCount}
            onChange={(e) => setParticipantsCount(Number(e.target.value))}
            className="mb-4"
          />
          <Button onClick={handleCreateTournament} className="bg-primary hover:bg-blue-700">
            Create Tournament
          </Button>
        </CardContent>
      </Card>
      <Card className="bg-gray-800 border-none">
        <CardHeader>
          <CardTitle>Manage Rankings</CardTitle>
        </CardHeader>
        <CardContent>
          {matches.map((match) => (
            <div key={match.id} className="mb-4">
              <p>
                Round {match.round}: {match.player1_id} vs {match.player2_id}
              </p>
              <Input
                type="number"
                placeholder="Winner ID"
                onChange={(e) => handleUpdateRanking(Number(e.target.value), matches.length - match.round + 1)}
                className="mt-2"
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminPanel
```

### src/components/ui/button.jsx
```jsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        default: "bg-primary text-white hover:bg-primary/90",
        link: "underline-offset-4 hover:underline text-primary",
      },
      size: {
        default: "h-10 py-2 px-4",
        sm: "h-9 px-3 rounded-md",
        lg: "h-11 px-8 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }
```

### src/components/ui/card.jsx
```jsx
import * as React from "react"
import { cn } from "../../lib/utils"

const Card = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("rounded-lg border bg-card text-card-foreground shadow-sm", className)}
    {...props}
  />
))
Card.displayName = "Card"

const CardHeader = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
CardContent.displayName = "CardContent"

export { Card, CardHeader, CardTitle, CardContent }
```

### src/components/ui/input.jsx
```jsx
import * as React from "react"
import { cn } from "../../lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
```

### src/lib/utils.js
```javascript
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}
```

## Backend Setup

### package.json
```json
{
  "name": "tournament-backend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js"
  },
  "dependencies": {
    "bcrypt": "^5.1.1",
    "cors": "^2.8.5",
    "dotenv": "^16.4.5",
    "express": "^4.21.0",
    "jsonwebtoken": "^9.0.2",
    "pg": "^8.13.0"
  },
  "devDependencies": {
    "nodemon": "^3.1.4"
  }
}
```

### .env
```
DATABASE_URL=postgresql://user:password@localhost:5432/tournament_db
JWT_SECRET=your_jwt_secret_key
```

### src/server.js
```javascript
import express from 'express'
import cors from 'cors'
import authRoutes from './routes/auth.js'
import tournamentRoutes from './routes/tournament.js'
import rankingRoutes from './routes/ranking.js'

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/tournament', tournamentRoutes)
app.use('/api/ranking', rankingRoutes)

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
```

### src/config/db.js
```javascript
import pkg from 'pg'
const { Pool } = pkg
import dotenv from 'dotenv'

dotenv.config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

export default pool
```

### src/middleware/auth.js
```javascript
import jwt from 'jsonwebtoken'

export const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ message: 'Unauthorized' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' })
  }
}

export const adminMiddleware = (req, res, next) => {
  if (!req.user.isAdmin) return res.status(403).json({ message: 'Admin access required' })
  next()
}
```

### src/routes/auth.js
```javascript
import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import pool from '../config/db.js'

const router = express.Router()

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body
  try {
    const hashedPassword = await bcrypt.hash(password, 10)
    const result = await pool.query(
      'INSERT INTO users (username, email, password, is_admin) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, hashedPassword, false]
    )
    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET)
    res.json({ token, user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/login', async (req, res) => {
  const { email, password } = req.body
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email])
    const user = result.rows[0]
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }
    const token = jwt.sign({ id: user.id, isAdmin: user.is_admin }, process.env.JWT_SECRET)
    res.json({ token, user })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
```

### src/routes/tournament.js
```javascript
import express from 'express'
import pool from '../config/db.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.post('/create', authMiddleware, adminMiddleware, async (req, res) => {
  const { name, count } = req.body
  try {
    const tournamentResult = await pool.query(
      'INSERT INTO tournaments (name, admin_id) VALUES ($1, $2) RETURNING *',
      [name, req.user.id]
    )
    const tournament = tournamentResult.rows[0]

    const participantsResult = await pool.query(
      'SELECT id FROM users WHERE id != $1 ORDER BY RANDOM() LIMIT $2',
      [req.user.id, count]
    )
    const participants = participantsResult.rows

    for (const participant of participants) {
      await pool.query(
        'INSERT INTO participants (user_id, tournament_id) VALUES ($1, $2)',
        [participant.id, tournament.id]
      )
    }

    const selectedParticipants = participants.slice(0, 2)
    await pool.query(
      'INSERT INTO matches (tournament_id, player1_id, player2_id, round) VALUES ($1, $2, $3, $4)',
      [tournament.id, selectedParticipants[0].id, selectedParticipants[1].id, 1]
    )

    res.json(tournament)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/:tournamentId/matches', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM matches WHERE tournament_id = $1',
      [req.params.tournamentId]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
```

### src/routes/ranking.js
```javascript
import express from 'express'
import pool from '../config/db.js'
import { authMiddleware, adminMiddleware } from '../middleware/auth.js'

const router = express.Router()

router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
  const { user_id, tournament_id, rank } = req.body
  try {
    const result = await pool.query(
      'INSERT INTO rankings (user_id, tournament_id, rank) VALUES ($1, $2, $3) RETURNING *',
      [user_id, tournament_id, rank]
    )
    res.json(result.rows[0])
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM rankings WHERE user_id = $1',
      [req.user.id]
    )
    res.json(result.rows)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router
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
