import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { FirebaseProvider } from './context/Firebase'; // Adjust the import path as necessary
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Questions from './components/Questions';
import Ask from './components/Ask';
import Login from './components/Login';
import Profile from './components/Profile';
import Signup from './components/Signup'; // Import the Signup component
import VerifyEmail from './components/VerifyEmail'; // Import the VerifyEmail component

function App() {
  return (
    <FirebaseProvider> {/* Wrap your app with FirebaseProvider */}
      <Router>
        <div className="bg-gray-100 min-h-screen flex flex-col">
          <Header />
          <main className="container mx-auto px-4 py-8 flex-grow">
            <div className="bg-white rounded-lg shadow-md p-6">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/questions" element={<Questions />} />
                <Route path="/ask" element={<Ask />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
              </Routes>
            </div>
          </main>
          <Footer />
        </div>
      </Router>
    </FirebaseProvider>
  );
}

export default App;
