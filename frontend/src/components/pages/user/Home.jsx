
import React from 'react';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <section className="hero">
        <div className="hero-content">
          <h1>PlayStation Tournament</h1>
          <p>Join the ultimate PlayStation tournament and compete against the best.</p>
          <button className="btn btn-primary">Register Now</button>
        </div>
      </section>

      <section className="features">
        <div className="feature-card">
          <h2>Compete</h2>
          <p>Challenge other players and prove your skills.</p>
        </div>
        <div className="feature-card">
          <h2>Win</h2>
          <p>Win amazing prizes and earn your place on the leaderboard.</p>
        </div>
        <div className="feature-card">
          <h2>Rank Up</h2>
          <p>Climb the ranks and become a PlayStation champion.</p>
        </div>
      </section>
    </div>
  );
};

export default Home;
