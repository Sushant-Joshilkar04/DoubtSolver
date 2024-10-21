import React, { useEffect, useState } from 'react';
import { useFirebase } from '../context/Firebase';
import QuestionCard from './QuestionCard';
import Login from './Login';

function Home() {
  const { user, fetchQuestions, updateUpvote } = useFirebase(); // Get user, fetchQuestions, and updateUpvote from Firebase context
  const [questions, setQuestions] = useState([]); // State to hold fetched questions
  const [loading, setLoading] = useState(true); // State to manage loading status
  const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term
  const [filteredQuestions, setFilteredQuestions] = useState([]); // State to hold filtered questions

  // Fetch questions when the component mounts, regardless of user state
  useEffect(() => {
    const loadQuestions = async () => {
      setLoading(true); // Start loading
      try {
        const fetchedQuestions = await fetchQuestions(); // Fetch questions from Firestore
        setQuestions(fetchedQuestions); // Update state with fetched questions
        setFilteredQuestions(fetchedQuestions); // Set the initial filtered questions as all questions
      } catch (error) {
        console.error('Failed to load questions:', error); // Handle any errors during fetching
      } finally {
        setLoading(false); // End loading
      }
    };

    loadQuestions(); // Call the loadQuestions function
  }, [fetchQuestions]); // Dependency array ensures this effect runs only once

  const handleUpvote = async (id, currentUpvotes) => {
    try {
      await updateUpvote(id, currentUpvotes + 1); // Update the upvote count in Firestore
      setQuestions((prevQuestions) =>
        prevQuestions.map((question) =>
          question.id === id ? { ...question, upvotes: currentUpvotes + 1 } : question
        )
      );
    } catch (error) {
      console.error('Error upvoting question:', error); // Handle any errors during upvoting
    }
  };

  // Filter questions based on the search term
  useEffect(() => {
    if (searchTerm) {
      setFilteredQuestions(
        questions.filter((question) =>
          question.title.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredQuestions(questions); // Reset to all questions if no search term
    }
  }, [searchTerm, questions]);

  // Render the Home component
  if (!user) {
    return <Login />; // Render Login if user is not authenticated
  }

  return (
    <div>
      {/* Search Bar */}
      <div className="sticky top-0 z-10  p-4  mb-6">
        <input
          type="text"
          placeholder="Search questions by title..."
          value={searchTerm} // Bind the input value to the searchTerm state
          onChange={(e) => setSearchTerm(e.target.value)} // Update the search term on input change
          className="px-6 py-2 border border-gray-300 rounded-full w-full max-w-2xl mx-auto block focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
        />
      </div>

      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-4">Welcome to DoubtSolver</h1>
        <p className="text-gray-600 mb-6">Ask questions, get answers, and learn from others in our community.</p>

        {loading ? ( // Conditional rendering based on loading state
          <p>Loading questions...</p>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.length > 0 ? ( // Check if there are questions to display
              filteredQuestions.map((question) => (
                <QuestionCard
                  key={question.id}
                  id={question.id}
                  title={question.title}
                  author={question.userEmail}
                  upvotes={question.upvotes}
                  answers={question.answers || []} // Fallback to an empty array
                  onUpvote={handleUpvote} // Pass the upvote handler to QuestionCard
                />
              ))
            ) : (
              <p className="text-gray-600">No questions found matching your search criteria.</p> // Message when no questions are found
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
