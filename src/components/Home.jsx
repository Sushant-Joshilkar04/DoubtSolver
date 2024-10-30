import React, { useEffect, useState, useCallback } from 'react';
import { useFirebase } from '../context/Firebase';
import QuestionCard from './QuestionCard';
import Login from './Login';

function Home() {
  const { 
    user, 
    fetchQuestions, 
    fetchCategories
  } = useFirebase();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [filteredQuestions, setFilteredQuestions] = useState([]);

  // Create memoized fetch function
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [fetchedQuestions, fetchedCategories] = await Promise.all([
        fetchQuestions(),
        fetchCategories()
      ]);
      
      console.log('Fetched categories:', fetchedCategories);
      console.log('Fetched questions:', fetchedQuestions);
      
      setQuestions(fetchedQuestions || []);
      setCategories(fetchedCategories || []);
      setFilteredQuestions(fetchedQuestions || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchQuestions, fetchCategories]);

  // Initial data load
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user, loadData]);

  // Filter questions based on search term and category
  useEffect(() => {
    let filtered = questions;

    if (selectedCategory) {
      filtered = filtered.filter(question => question.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredQuestions(filtered);
  }, [searchTerm, selectedCategory, questions]);

  if (!user) {
    return <Login />;
  }

  return (
    <div>
      <div className="sticky top-0 z-10 bg-white p-4 space-y-4">
        {/* Search and Filter Controls */}
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-6 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to DoubtSolver</h1>
        <p className="text-gray-600 mb-6">
          Ask questions, get answers, and learn from others in our community.
        </p>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  {...question}
                />
              ))
            ) : (
              <p className="text-gray-600 text-center py-8">
                No questions found matching your criteria.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
