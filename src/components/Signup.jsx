// Signup.jsx
import React, { useState } from 'react';
import { useFirebase } from '../context/Firebase'; // Ensure the import path is correct
import { useNavigate } from 'react-router-dom';

const Signup = () => {
    const [firstName, setFirstName] = useState(''); // State for first name
    const [lastName, setLastName] = useState(''); // State for last name
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const { signup } = useFirebase(); // Destructure signup from useFirebase
    const navigate = useNavigate(); // Use useNavigate for redirection

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission
        setLoading(true);
        setError(null);

        try {
            if (!email.endsWith('@pccoepune.org')) {
                throw new Error('Please use your college email (@pccoepune.org)');
            }

            if (password.length < 6) {
                throw new Error('Password should be at least 6 characters long');
            }

            const result = await signup(email, password, firstName, lastName);
            alert(result.message || 'Please check your college email for verification link');
            navigate('/login');
        } catch (error) {
            setError(error.message);
            if (error.message.includes('operation-not-allowed')) {
                setError('Sign-up is temporarily disabled. Please try again later or contact support.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
            {error && <p className="text-red-600 mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label className="block text-gray-700" htmlFor="firstName">First Name:</label>
                    <input
                        type="text"
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        required
                        className="border rounded w-full py-2 px-3"
                        placeholder="Enter your first name"
                        disabled={loading}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700" htmlFor="lastName">Last Name:</label>
                    <input
                        type="text"
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        required
                        className="border rounded w-full py-2 px-3"
                        placeholder="Enter your last name"
                        disabled={loading}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700" htmlFor="email">College Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="username@pccoepune.org"
                        className="border rounded w-full py-2 px-3"
                        disabled={loading}
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700" htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="border rounded w-full py-2 px-3"
                        placeholder="Enter your password"
                        disabled={loading}
                    />
                </div>
                <button
                    type="submit"
                    className={`w-full bg-red-600 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-700'}`}
                    disabled={loading}
                >
                    {loading ? 'Sending verification...' : 'Sign Up'}
                </button>
            </form>
        </div>
    );
};

export default Signup; // Ensure default export
