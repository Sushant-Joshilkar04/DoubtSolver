import React from 'react';
import { Link } from 'react-router-dom';

const Nav = () => {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-red-600">DoubtSolver</Link>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search DoubtSolver"
            className="border rounded-full px-4 py-1 focus:outline-none focus:ring-2 focus:ring-red-500"
          />
          <Link to="/questions" className="text-gray-600 hover:text-red-600">
            <i className="fas fa-question-circle"></i>
          </Link>
          <Link to="/ask" className="text-gray-600 hover:text-red-600">
            <i className="fas fa-pen"></i>
          </Link>
          <Link to="/profile" className="text-gray-600 hover:text-red-600">
            <i className="fas fa-user-circle"></i>
          </Link>
          <button className="text-gray-600 hover:text-red-600">
            <i className="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Nav;
