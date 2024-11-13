import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CgProfile } from 'react-icons/cg';
import { IoLogOutOutline } from 'react-icons/io5';
import { useFirebase } from '../context/Firebase';

function Header() {
  const navigate = useNavigate();
  const { user, logout } = useFirebase();
  const [prevScrollPos, setPrevScrollPos] = useState(window.pageYOffset);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isVisible = prevScrollPos > currentScrollPos;

      setPrevScrollPos(currentScrollPos);
      setVisible(isVisible);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [prevScrollPos]);

  const handleLogout = () => {
    logout()
      .then(() => {
        alert('Logged out successfully');
        navigate('/');
      })
      .catch((error) => {
        console.error('Logout error:', error);
      });
  };

  return (
    <header 
      className={`bg-white shadow-sm z-10 transition-transform duration-300 ${
        visible ? 'translate-y-0' : '-translate-y-full'
      }`}
    >
      <nav className="container mx-auto px-4 py-3 flex justify-between items-center">
        {/* Left: Logo */}
        <Link to="/" className="text-2xl font-bold text-red-600">DoubtSolver</Link>

        {/* Right: Conditional rendering based on user authentication */}
        <div className="flex items-center space-x-4">
          {user ? (
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
              </Link>
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
