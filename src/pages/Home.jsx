import React from 'react';

const Home = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Welcome to DoubtSolver</h1>
      <p className="text-gray-600 mb-6">
        Ask questions, get answers, and learn from others in our community.
      </p>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">
          <h2 className="text-lg font-semibold mb-2">What's the best way to learn programming?</h2>
          <p className="text-sm text-gray-600 mb-2">Asked by John Doe</p>
          <div className="flex justify-between text-sm text-gray-500">
            <button className="upvote-btn">
              <i className="fas fa-arrow-up"></i> 42 upvotes
            </button>
            <span><i className="fas fa-comment"></i> 15 answers</span>
          </div>
        </div>
        {/* Repeat similar blocks for other questions */}
      </div>
    </div>
  );
};

export default Home;
