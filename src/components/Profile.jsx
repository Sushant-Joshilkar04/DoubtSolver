import React, { useEffect, useState } from 'react';
import { useFirebase } from '../context/Firebase';
import { CgProfile } from 'react-icons/cg';
import { FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const [userData, setUserData] = useState(null);
    const [error, setError] = useState(null);
    const [askedQuestions, setAskedQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedQuestions, setExpandedQuestions] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [categories, setCategories] = useState([]);
    const { user, fetchUserData, fetchAskedQuestions, deleteQuestion } = useFirebase();
    const navigate = useNavigate();

    // Helper function to format date
    const formatDate = (dateValue) => {
        if (!dateValue) return 'Unknown date';
        
        try {
            if (typeof dateValue === 'string') {
                return new Date(dateValue).toLocaleDateString();
            }
            
            if (dateValue.seconds) {
                return new Date(dateValue.seconds * 1000).toLocaleDateString();
            }
            
            if (dateValue instanceof Date) {
                return dateValue.toLocaleDateString();
            }
            
            return 'Unknown date';
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Unknown date';
        }
    };

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        loadUserDataAndQuestions();
    }, [user]);

    const loadUserDataAndQuestions = async () => {
        setLoading(true);
        try {
            if (!user) {
                throw new Error('Please log in to view your profile');
            }

            const data = await fetchUserData();
            console.log("Fetched user data:", data);
            
            if (data) {
                setUserData(data);
                const questions = await fetchAskedQuestions();
                console.log("Fetched questions:", questions);
                setAskedQuestions(questions || []);
                
                const uniqueCategories = [...new Set(questions.map(q => q.category))];
                setCategories(uniqueCategories);
            }
        } catch (error) {
            console.error('Error loading profile data:', error);
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteQuestion = async (questionId) => {
        if (window.confirm('Are you sure you want to delete this question?')) {
            try {
                await deleteQuestion(questionId);
                const updatedQuestions = await fetchAskedQuestions();
                setAskedQuestions(updatedQuestions);
            } catch (error) {
                setError('Failed to delete question');
                console.error('Error deleting question:', error);
            }
        }
    };

    const getFilteredQuestions = () => {
        if (selectedCategory === 'all') {
            return askedQuestions;
        }
        return askedQuestions.filter(q => q.category === selectedCategory);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mb-4"></div>
                    <p>Loading your profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-start min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 p-8">
            <div className="w-full max-w-4xl bg-white rounded-lg shadow-xl p-8">
                {/* Profile Header */}
                <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col items-start">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">Profile Overview</h1>
                        <h2 className="text-xl font-semibold text-gray-600">
                            Welcome, {userData?.name} {userData?.surname}!
                        </h2>
                        <div className="text-gray-500 mt-1 space-y-1">
                            <p>Email: <span className="text-gray-700 font-medium">{userData?.email || user?.email}</span></p>
                            {userData?.createdAt && (
                                <p>Member since: <span className="text-gray-700 font-medium">
                                    {formatDate(userData.createdAt)}
                                </span></p>
                            )}
                            <p>Questions Asked: <span className="text-gray-700 font-medium">{askedQuestions.length}</span></p>
                        </div>
                    </div>
                    <div className="ml-4">
                        <CgProfile className="text-blue-600" size={72} />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {/* Questions Section */}
                <div className="bg-white w-full p-6 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-gray-700">
                            Your Asked Questions ({getFilteredQuestions().length})
                        </h3>
                        <button
                            onClick={() => setExpandedQuestions(!expandedQuestions)}
                            className="flex items-center text-blue-600 hover:text-blue-800"
                        >
                            {expandedQuestions ? <FaChevronUp /> : <FaChevronDown />}
                        </button>
                    </div>

                    {/* Category Filter */}
                    <div className="mb-4">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="all">All Categories</option>
                            {categories.map(category => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Questions List */}
                    <div className={`space-y-4 transition-all duration-300 ${expandedQuestions ? 'block' : 'hidden'}`}>
                        {getFilteredQuestions().length > 0 ? (
                            getFilteredQuestions().map((question) => (
                                <div key={question.id} 
                                     className="flex justify-between items-center p-4 border rounded-lg hover:bg-gray-50 transition-colors duration-200">
                                    <div className="flex-grow">
                                        <h4 className="text-lg font-medium text-gray-800">
                                            {question.title}
                                        </h4>
                                        <div className="text-sm text-gray-600">
                                            <p>Posted on: {question.createdAt}</p>
                                            <p>Category: <span className="font-medium">{question.category}</span></p>
                                            <p>Answers: {question.answers?.length || 0}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleDeleteQuestion(question.id)}
                                        className="ml-4 p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition-colors duration-200"
                                        title="Delete question"
                                    >
                                        <FaTrash size={16} />
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-4">
                                No questions found in this category.
                            </p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
