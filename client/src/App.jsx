import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import './App.css';
import axios from 'axios';
import Home from './Home';

function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Username and password cannot be empty');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4040/api/login', { username, password });
      localStorage.setItem('userData', JSON.stringify(response.data));
      navigate('/home', { state: { userData: response.data } });
    } catch (error) {
      alert('Error logging in: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSignUp = async () => {
    if (!username || !password) {
      alert('Username and password cannot be empty');
      return;
    }

    try {
      const response = await axios.post('http://localhost:4040/api/signup', { username, password });
      console.log('signup response: ', response.data);
      navigate('/home',);
    } catch (error) {
      alert('Error signing up: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="start-page"> 
      <div className="login-container">
        <h1>Training Arc | Start Your Saga.</h1>
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
            <button type="button" onClick={handleLogin}>Log in</button>
            <button type="button" onClick={handleSignUp}>Sign Up</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App
