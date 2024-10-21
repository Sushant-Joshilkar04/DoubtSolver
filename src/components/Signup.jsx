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
    const { signup } = useFirebase(); // Destructure signup from useFirebase
    const navigate = useNavigate(); // Use useNavigate for redirection

    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent default form submission

        try {
            await signup(email, password, firstName, lastName); // Call the signup method from context
            navigate('/'); // Redirect to home on successful signup
        } catch (error) {
            setError(error.message); // Set error message if signup fails
            console.error('Signup failed:', error);
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
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-gray-700" htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="border rounded w-full py-2 px-3"
                        placeholder="Enter your email"
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
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-red-600 text-white py-2 rounded"
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default Signup; // Ensure default export
