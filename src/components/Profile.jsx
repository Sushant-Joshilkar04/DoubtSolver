import React, { useEffect, useState } from 'react';
import { useFirebase } from '../context/Firebase'; // Ensure the import path is correct
import { CgProfile } from 'react-icons/cg'; // Import the profile icon

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [askedQuestions, setAskedQuestions] = useState([]); // State to hold asked questions
    const { fetchUserData, fetchAskedQuestions } = useFirebase(); // Destructure fetchUserData and fetchAskedQuestions

    useEffect(() => {
        const getUserData = async () => {
            try {
                const data = await fetchUserData(); // Fetch user data
                if (data) {
                    setUserData(data); // Set userData if data is not null
                } else {
                    setError('User not authenticated'); // Set an error message if user is null
                }
            } catch (error) {
                setError(error.message); // Set error if fetching fails
                console.error('Error fetching user data:', error);
            }
        };

        const getAskedQuestions = async () => {
            try {
                const questions = await fetchAskedQuestions(); // Fetch asked questions
                setAskedQuestions(questions); // Set the state with the asked questions
            } catch (error) {
                setError('Error fetching asked questions'); // Set error if fetching fails
                console.error('Error fetching asked questions:', error);
            }
        };

        getUserData(); // Call the function to fetch user data
        getAskedQuestions(); // Call the function to fetch asked questions
    }, [fetchUserData, fetchAskedQuestions]);

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-8">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8">
                <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col items-start">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile Overview</h1>
                        <h2 className="text-xl font-semibold text-gray-600">Welcome, {userData?.name} {userData?.surname}!</h2>
                        <p className="text-gray-500 mt-1">Email: <span className="text-gray-700 font-medium">{userData?.email}</span></p>
                    </div>
                    <div className="ml-4">
                        <CgProfile className="text-blue-600" size={72} />
                    </div>
                </div>

                {error && <p className="text-red-600 mb-4">{error}</p>} {/* Display error if any */}

                {!userData ? (
                    <div className="flex flex-col items-center">
                        <div className="loader mb-4">
                            <div className="spinner"></div>
                        </div>
                        <p className="text-gray-600">Loading your profile...</p>
                    </div>
                ) : (
                    <div className="bg-white w-full p-6 rounded-lg shadow-md">
                        {/* Display asked questions */}
                        <div className="w-full">
                            <h3 className="text-xl font-bold mb-4 text-gray-700">Your Asked Questions</h3>
                            {askedQuestions.length > 0 ? (
                                <ul className="list-inside list-disc text-gray-700 space-y-2">
                                    {askedQuestions.map((question, index) => (
                                        <li key={index} className="border-b pb-2">
                                            {question}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500">You haven't asked any questions yet.</p>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Profile;
