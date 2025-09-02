import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import axios from 'axios';

function App() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <div className="login-container">
      <h1>Let's Go!</h1>
      <div className="login-form">
        <div>
          <h2>Username</h2>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <h2>Password</h2>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="login-button-group">
          <button type="button" onClick={() => alert('Log in clicked')}>Log in</button>
          <button type="button" onClick={() => alert('Sign Up clicked')}>Sign Up</button>
        </div>
      </div>
    </div>
  );
}

export default App
