// components/Login.jsx

import React, { useState } from 'react';
import { useFirebase } from '../context/Firebase';
import { useNavigate } from 'react-router-dom';

function Login() {
  const { login } = useFirebase();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);

    try {
      // Validate email format
      if (!email.endsWith('@pccoepune.org')) {
        throw new Error('Please use your college email (@pccoepune.org)');
      }

      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Authentication error:', error);
      
      // Handle different error cases
      if (error.message.includes('not found') || 
          error.message.includes('sign up')) {
        setError(
          <div>
            <p>{error.message}</p>
            <button
              onClick={() => navigate('/signup')}
              className="text-blue-600 hover:text-blue-800 underline mt-2"
            >
              Click here to sign up
            </button>
          </div>
        );
      } else {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Login</h1>
      
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          {typeof error === 'string' ? <p className="text-red-700">{error}</p> : error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-gray-700 mb-2">College Email</label>
          <input
            id="email"
            type="email"
            placeholder="username@pccoepune.org"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-gray-700 mb-2">Password</label>
          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white px-4 py-2 rounded transition-colors
            ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">Don't have an account?</p>
        <button
          onClick={() => navigate('/signup')}
          className="text-blue-600 hover:text-blue-800 font-medium"
          disabled={isLoading}
        >
          Sign up here
        </button>
      </div>
    </div>
  );
}

export default Login;
