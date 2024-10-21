import React, { useState } from 'react';
import { useFirebase } from '../context/Firebase';
import { useNavigate } from 'react-router-dom'; // Import useNavigate

function Ask() {
  const { createQuestion } = useFirebase(); // Use Firebase context to call createQuestion method
  const [title, setTitle] = useState('');   // State for question title
  const [details, setDetails] = useState(''); // State for question details
  const [error, setError] = useState(null); // State for error handling
  const navigate = useNavigate(); // Initialize useNavigate

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      // Create the question by calling createQuestion method
      await createQuestion(title, details);
      
      // Reset input fields on successful submission
      setTitle('');
      setDetails('');
      setError(null);

      // Navigate to home page after submission
      navigate('/'); // Redirect to home
    } catch (error) {
      setError(error.message); // Set error message if submission fails
      console.error('Error submitting question:', error); // Log error
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Ask a Question</h1>
      {error && <p className="text-red-600 mb-4">{error}</p>} {/* Display error message if exists */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Enter your question title"
          className="w-full p-2 border rounded"
          value={title} // Bind input value to title state
          onChange={(e) => setTitle(e.target.value)} // Update title state on change
          required
        />
        {/* <textarea
          placeholder="Provide more details about your question"
          className="w-full p-2 border rounded h-32"
          value={details} // Bind textarea value to details state
          onChange={(e) => setDetails(e.target.value)} // Update details state on change
          required
        ></textarea> */}
        <button 
          type="submit" 
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Submit Question
        </button>
      </form>
    </div>
  );
}

export default Ask;
