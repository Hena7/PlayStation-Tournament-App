import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import './index.css';

import Header from './components/layouts/Header';
import Footer from './components/layouts/Footer';

// Placeholder components for routing
import Home from './components/pages/user/Home';
import Register from './components/pages/user/Register';
import Form from './components/pages/user/Form';
import Login from './components/pages/admin/Login';
import Dashboard from './components/pages/admin/Dashboard';

const Layout = () => {
  return (
    <>
      <Header />
      <main className="container">
        <Outlet />
      </main>
      <Footer />
    </>
  );
};

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="register" element={<Register />} />
          <Route path="form" element={<Form />} />
          <Route path="login" element={<Login />} />
          <Route path="admin" element={<Dashboard />} />
        </Route>
      </Routes>
    </Router>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);