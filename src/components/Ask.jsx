import React, { useState, useEffect } from 'react';
import { useFirebase } from '../context/Firebase';
import { useNavigate } from 'react-router-dom';

function Ask() {
  const { user, createQuestion, fetchCategories, updateCategories } = useFirebase();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [existingCategories, setExistingCategories] = useState([]);
  const [isAddingNewCategory, setIsAddingNewCategory] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Fetch existing categories when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categories = await fetchCategories();
        console.log('Loaded categories:', categories);
        setExistingCategories(categories || []);
      } catch (error) {
        console.error('Error loading categories:', error);
        setError('Failed to load categories');
      }
    };
    loadCategories();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!user) {
        throw new Error('Please login to ask a question');
      }

      let finalCategory = isAddingNewCategory ? newCategory.trim() : category;

      if (isAddingNewCategory && !newCategory.trim()) {
        throw new Error('Please enter a category name');
      }
      if (!isAddingNewCategory && !category) {
        throw new Error('Please select a category');
      }

      // If adding new category, update categories list first
      if (isAddingNewCategory) {
        await updateCategories(newCategory.trim());
        // Refresh categories list
        const updatedCategories = await fetchCategories();
        setExistingCategories(updatedCategories);
      }

      // Create the question with the category
      await createQuestion(title, finalCategory);
      
      // Reset form
      setTitle('');
      setCategory('');
      setNewCategory('');
      setIsAddingNewCategory(false);
      
      // Navigate to home page
      navigate('/');
    } catch (error) {
      console.error('Error submitting question:', error);
      setError(error.message || 'Failed to submit question. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Ask a Question</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title Input */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Question Title
          </label>
          <input
            type="text"
            placeholder="Enter your question title"
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            disabled={loading}
          />
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Category
          </label>
          {!isAddingNewCategory ? (
            <div className="space-y-2">
              <select
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                disabled={loading}
              >
                <option value="">Select a category</option>
                {existingCategories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setIsAddingNewCategory(true)}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                disabled={loading}
              >
                + Create New Category
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Enter new category name"
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => {
                  setIsAddingNewCategory(false);
                  setNewCategory('');
                }}
                className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                disabled={loading}
              >
                Back to Existing Categories
              </button>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button 
          type="submit" 
          className={`w-full bg-blue-600 text-white px-6 py-3 rounded-md transition-colors duration-200 
            ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit Question'}
        </button>
      </form>
    </div>
  );
}

export default Ask;
