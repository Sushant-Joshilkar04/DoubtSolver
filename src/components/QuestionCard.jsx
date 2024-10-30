import React, { useState } from 'react';
import { useFirebase } from '../context/Firebase';
import { FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';

function QuestionCard({ id, title, author, answers = [], category, createdAt }) {
  const { user, updateAnswers, deleteAnswer, updateExistingAnswer } = useFirebase();
  const [comment, setComment] = useState('');
  const [comments, setComments] = useState(
    Array.isArray(answers) ? [...answers].reverse() : []
  );
  const [errorMessage, setErrorMessage] = useState('');
  const [showAnswers, setShowAnswers] = useState(false);
  const [editingAnswer, setEditingAnswer] = useState(null);
  const [editText, setEditText] = useState('');

  const handleAnswerSubmit = async (e) => {
    e.preventDefault();
    if (comment.trim()) {
      try {
        if (!user) throw new Error("You must be logged in to submit an answer.");
        const authorEmail = user.email;
        const newAnswer = await updateAnswers(id, authorEmail, comment);
        setComments((prevComments) => [...prevComments, newAnswer]);
        setComment('');
      } catch (error) {
        console.error('Error submitting answer:', error);
        setErrorMessage(error.message);
      }
    } else {
      setErrorMessage('Please enter an answer.');
    }
  };

  const handleEditAnswer = (answer, index) => {
    setEditingAnswer(index);
    setEditText(answer.answer);
  };

  const handleCancelEdit = () => {
    setEditingAnswer(null);
    setEditText('');
  };

  const handleUpdateAnswer = async (index, originalAnswer) => {
    try {
      if (!editText.trim()) {
        alert('Please enter an answer');
        return;
      }

      await updateExistingAnswer(id, originalAnswer, editText);
      
      setComments((prevComments) => {
        const newComments = [...prevComments];
        newComments[index] = {
          ...newComments[index],
          answer: editText
        };
        return newComments;
      });
      
      setEditingAnswer(null);
      setEditText('');
    } catch (error) {
      console.error('Error updating answer:', error);
      alert('Failed to update answer');
    }
  };

  const handleDeleteAnswer = async (index, answer) => {
    if (window.confirm('Are you sure you want to delete this answer?')) {
      try {
        await deleteAnswer(id, answer);
        setComments((prevComments) => 
          prevComments.filter((_, i) => i !== index)
        );
      } catch (error) {
        console.error('Error deleting answer:', error);
        alert('Failed to delete answer');
      }
    }
  };

  const isUserAnswer = (answerAuthor) => {
    return user && user.email === answerAuthor;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-200">
      <div className="flex justify-between items-start mb-2">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
          {category}
        </span>
      </div>
      <div className="text-sm text-gray-600 mb-2">
        <p>Asked by: <span className="font-medium">{author}</span></p>
        <p>Posted on: {createdAt}</p>
        <p>Category: <span className="font-medium">{category}</span></p>
      </div>
      {errorMessage && <p className="text-red-600">{errorMessage}</p>}

      <button
        onClick={() => setShowAnswers(!showAnswers)}
        className="font-bold text-black px-2 rounded-md mb-2 hover:underline transition duration-200"
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
        <button 
          type="submit" 
          className="bg-blue-600 text-white px-4 py-2 rounded-md mt-2 hover:bg-blue-700 transition duration-200"
        >
          Submit Answer
        </button>
      </form>

      {showAnswers && (
        <div className="mt-4 space-y-4">
          {comments.length > 0 ? (
            comments.map((answer, index) => (
              <div key={index} className="p-4 border border-gray-200 rounded-md bg-gray-50">
                {editingAnswer === index ? (
                  <div className="space-y-2">
                    <textarea
                      className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      rows="3"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleUpdateAnswer(index, answer)}
                        className="flex items-center px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
                      >
                        <FaSave className="mr-1" /> Save
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="flex items-center px-3 py-1 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                      >
                        <FaTimes className="mr-1" /> Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-700">{answer.answer}</p>
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-gray-500">
                        <p>by {answer.author}</p>
                        {answer.updatedAt && <p>Updated: {new Date(answer.updatedAt).toLocaleDateString()}</p>}
                      </div>
                      {isUserAnswer(answer.author) && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditAnswer(answer, index)}
                            className="flex items-center px-2 py-1 text-blue-600 hover:text-blue-800"
                          >
                            <FaEdit className="mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => handleDeleteAnswer(index, answer)}
                            className="flex items-center px-2 py-1 text-red-600 hover:text-red-800"
                          >
                            <FaTrash className="mr-1" /> Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
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
