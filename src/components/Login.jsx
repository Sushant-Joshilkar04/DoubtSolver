 // components/Login.jsx

import React, { useState } from 'react';
import { useFirebase } from '../context/Firebase'; // Ensure the import path is correct
import { useNavigate } from 'react-router-dom';

function Login() {
  const { login } = useFirebase(); // Destructure login from useFirebase
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Use useNavigate for redirection

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission
    try {
      await login(email, password); // Call the login method from context
      setEmail(''); // Clear email field
      setPassword(''); // Clear password field
      setError(null); // Clear any previous errors
      navigate('/'); // Redirect to home on successful login
    } catch (error) {
      setError(error.message); // Set error message if login fails
      console.error('Authentication error:', error);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full p-2 border rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-2 border rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Login
        </button>
      </form>
      <button
        onClick={() => navigate('/signup')} // Navigate to the Signup page
        className="mt-4 text-blue-500"
      >
        Don't have an account? Sign Up
      </button>
    </div>
  );
}

export default Login; // Ensure default export
