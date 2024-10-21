import React, { useState } from 'react';
import QuestionCard from './QuestionCard';
import SolutionCard from './SolutionCard';

function QuestionWithSolutions({ title, author, upvotes, answers, solutions }) {
  const [showAnswers, setShowAnswers] = useState(false);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
      <QuestionCard title={title} author={author} upvotes={upvotes} answers={answers} />
      <div className="mt-4">
        <button
          className={`bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded`}
          onClick={() => setShowAnswers(!showAnswers)}
        >
          {showAnswers ? 'Hide Answers' : 'Show Answers'}
        </button>
        {showAnswers && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold mb-2">Solutions:</h3>
            {solutions.map((solution, index) => (
              <SolutionCard key={index} author={solution.author} content={solution.content} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default QuestionWithSolutions;
