import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/Firebase';
import QuestionCard from '../components/QuestionCard';
import { Link } from 'react-router-dom';

function Home() {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const { fetchQuestions, fetchCategories } = useFirebase();

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    loadQuestions();
  }, [selectedCategory]);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      // Load categories first
      const categoriesList = await fetchCategories();
      console.log('Loaded categories in Home:', categoriesList);
      if (Array.isArray(categoriesList)) {
        setCategories(categoriesList);
      } else {
        console.error('Categories is not an array:', categoriesList);
        setCategories([]);
      }
      
      // Then load questions
      await loadQuestions();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async () => {
    try {
      const categoryFilter = selectedCategory === 'all' ? null : selectedCategory;
      const fetchedQuestions = await fetchQuestions(categoryFilter);
      console.log('Fetched questions:', fetchedQuestions);
      setQuestions(fetchedQuestions);
    } catch (error) {
      console.error('Error loading questions:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Questions Dashboard</h1>
        <Link 
          to="/ask" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
        >
          Ask Question
        </Link>
      </div>

      {/* Categories Section */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Categories</h2>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full transition-colors ${
              selectedCategory === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {questions.length > 0 ? (
          questions.map(question => (
            <QuestionCard
              key={question.id}
              id={question.id}
              title={question.title}
              author={question.userEmail}
              category={question.category}
              createdAt={question.createdAt}
              answers={question.answers}
            />
          ))
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600">
              No questions found in this category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
