import React, { useState } from 'react';
import { useFirebase } from '../context/Firebase';

function QuestionCard({ id, title, author, answers = [] }) {
  const { user, updateAnswers } = useFirebase(); // Get user and Firebase methods from context
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(
    Array.isArray(answers) ? [...answers].reverse() : [] // Reverse the answers array initially
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [showAnswers, setShowAnswers] = useState(false); // State for showing/hiding answers

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim()) {
      try {
        if (!user) throw new Error("You must be logged in to submit an answer.");
        const authorEmail = user.email; // Get the current user's email
        await updateAnswers(id, authorEmail, comment); // Pass the user's email as the author
        setComments((prevComments) => [{ author: authorEmail, answer: comment }, ...prevComments]); // Add new answer to the top
        setComment('');
      } catch (error) {
        console.error('Error submitting answer:', error);
        alert(error.message);
      }
    } else {
      alert('Please enter an answer.');
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
      <h2 className="text-xl font-semibold mb-2 text-gray-800">{title}</h2>
      <p className="text-sm text-gray-600 mb-2">Asked by {author}</p>
      {errorMessage && <p className="text-red-600">{errorMessage}</p>} {/* Display error message */}

      <button
        onClick={() => setShowAnswers(!showAnswers)}
        className="font-bold text-black px-2  rounded-md mb-2 hover:underline  transition duration-200"
      >
        {showAnswers ? 'Hide Answers' : `Show ${comments.length} Answers`}
      </button>

      <form onSubmit={handleAnswerSubmit} className="mt-2">
        <input
          type="text"
          placeholder="Add your answer"
          className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 transition duration-200"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md mt-2 hover:bg-blue-700 transition duration-200">
          Submit Answer
        </button>
      </form>

      {/* Conditional rendering of answers */}
      {showAnswers && (
        <div className="mt-4">
          {comments.length > 0 ? (
            comments.map((answer, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md mb-2 bg-gray-50">
                <p className="text-sm text-gray-700">{answer.answer}</p>
                <p className="text-xs text-gray-500 mt-1">by {answer.author}</p>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-600 mt-2">No answers available.</p>
          )}
        </div>
      )}
    </div>
  );
}

export default QuestionCard;
