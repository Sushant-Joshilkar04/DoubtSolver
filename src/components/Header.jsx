import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg'; // Importing the profile icon
import { IoLogOutOutline } from 'react-icons/io5'; // Importing the logout icon
import { useFirebase } from '../context/Firebase'; // Adjust the import path as needed

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useFirebase(); // Access user and logout function from Firebase context

  const handleLogout = () => {
    logout()
      .then(() => {
        alert('Logged out successfully');
        navigate('/'); // Redirect to home after logout
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left: Logo */}
        <Link to="/" className="text-2xl font-bold text-red-600">DoubtSolver</Link>

        {/* Right: Conditional rendering based on user authentication */}
        <div className="flex items-center space-x-4">
          {user ? ( // Check if user is logged in
            <>
              <Link to="/questions" className="text-gray-600 hover:text-red-600">
                <i className="fas fa-question-circle"></i>
              </Link>
              <Link to="/ask" className="text-gray-600 hover:text-red-600">
                <i className="fas fa-pen"></i>
              </Link>
              <Link to="/profile" className="text-gray-600 hover:text-red-600">
                <CgProfile size={24} />
              </Link>
              <button onClick={handleLogout} className="text-gray-600 hover:text-red-600">
                <IoLogOutOutline size={24} />
              </button>
              <Link to="/ask" className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700">
                Ask Q
              </Link> {/* Ask Q button */}
            </>
          ) : (
            <>
              <Link to="/login" className="text-gray-600 hover:text-red-600">Login</Link>
              <Link to="/signup" className="text-gray-600 hover:text-red-600">Signup</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;
