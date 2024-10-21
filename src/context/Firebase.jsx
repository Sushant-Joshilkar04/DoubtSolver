 // Firebase.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, arrayUnion, setDoc, getDoc } from 'firebase/firestore';
import { increment } from 'firebase/firestore'; // Import increment if you're using it

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB0GXiwak-t2QFbl2pZTD-z4vBaP7-ZWAk",
  authDomain: "doubt-solver-d3574.firebaseapp.com",
  projectId: "doubt-solver-d3574",
  storageBucket: "doubt-solver-d3574.appspot.com",
  messagingSenderId: "1024391377463",
  appId: "1:1024391377463:web:f142bfafd8b8fc7c7bc5b2",
  measurementId: "G-8916FHZDTD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Create a Firebase context
const FirebaseContext = createContext(null);

// Firebase Provider component
export const FirebaseProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribe(); // Cleanup subscription on unmount
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Logging in with:', email, password); // Log the credentials
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      console.log('Login successful:', userCredential.user);
    } catch (error) {
      console.error('Error logging in:', error);
      if (error.code === 'auth/wrong-password') {
        alert('Incorrect password. Please try again.');
      } else if (error.code === 'auth/user-not-found') {
        alert('No user found with this email. Please sign up.');
      } else if (error.code === 'auth/user-disabled') {
        alert('This user has been disabled.');
      } else {
        alert('Login failed. Please try again later.');
      }
      throw new Error(error.message);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const signup = async (email, password, name, surname) => {
    try {
        // Create a new user with email and password
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        setUser(userCredential.user); // Set the user state with the newly created user

        // Create a user document in Firestore with name, surname, and email
        await setDoc(doc(db, 'users', userCredential.user.uid), {
            name,
            surname,
            email: userCredential.user.email,
        });

        console.log('User signed up and stored in Firestore:', userCredential.user.uid);
    } catch (error) {
        console.error('Error signing up:', error);
        throw new Error(error.message); // Throw the error to be handled in the Signup component
    }
};





  const fetchQuestions = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'questions'));
      const questions = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        answers: doc.data().answers || [],
      }));
      return questions;
    } catch (error) {
      console.error('Error fetching questions:', error);
      throw new Error('Failed to fetch questions');
    }
  };

  const updateUpvote = async (questionId) => {
    const currentUser = auth.currentUser;

    if (!currentUser) throw new Error("User must be logged in to upvote.");

    const userId = currentUser.uid;
    const userRef = doc(db, 'users', userId);
    const questionRef = doc(db, 'questions', questionId);

    try {
      const userSnapshot = await getDoc(userRef);
      const questionSnapshot = await getDoc(questionRef);

      if (!questionSnapshot.exists()) {
        throw new Error("Question does not exist.");
      }

      if (!userSnapshot.exists()) {
        await setDoc(userRef, { upvotedQuestions: [] });
      }

      let upvotedQuestions = userSnapshot.data().upvotedQuestions || [];

      if (upvotedQuestions.includes(questionId)) {
        throw new Error("You have already upvoted this question.");
      }

      await updateDoc(userRef, {
        upvotedQuestions: arrayUnion(questionId)
      });

      await updateDoc(questionRef, {
        upvotes: increment(1)
      });

      console.log("Upvote successfully recorded.");
    } catch (error) {
      console.error('Error updating upvotes:', error);
      throw new Error('Failed to update upvotes: ' + error.message);
    }
  };

  const updateAnswers = async (questionId, author, answer) => {
    try {
      const questionRef = doc(db, 'questions', questionId);
      await updateDoc(questionRef, {
        answers: arrayUnion({ author, answer })
      });
      console.log('Answer added successfully');
    } catch (error) {
      console.error('Error updating answers:', error);
      throw new Error('Failed to update answers: ' + error.message);
    }
  };

// Firebase.jsx
const fetchUserData = async () => {
  if (!user) {
      console.warn('User is not authenticated, returning null.'); // Log a warning
      return null; // Return null if the user is not authenticated
  }

  const userRef = doc(db, 'users', user.uid);
  const userSnapshot = await getDoc(userRef);

  if (!userSnapshot.exists()) {
      throw new Error('User data not found');
  }

  return userSnapshot.data(); // Return the user data
};

// Add this method inside the FirebaseProvider
const createQuestion = async (title, details) => {
  if (!user) throw new Error('User not authenticated');

  const questionData = {
    title,
    details,
    upvotes: 0,
    answers: [],
    userEmail: user.email,
    createdAt: new Date(),
  };

  try {
    // Add question to 'questions' collection
    const docRef = await addDoc(collection(db, 'questions'), questionData);
    console.log('Question submitted with ID:', docRef.id);
    
    // Store question in 'asked' collection
    await storeAskedQuestion(title);
  } catch (error) {
    console.error('Error submitting question:', error);
    throw new Error('Failed to submit question');
  }
};

// Method to store asked question in 'asked' collection
// Method to store asked question in 'asked' collection (with array of titles)
const storeAskedQuestion = async (title) => {
  if (!user) throw new Error('User not authenticated');

  const userEmail = user.email;
  const askedRef = doc(db, 'asked', userEmail); // Use the user's email as the document ID
  const askedData = {
    userEmail,
    titles: arrayUnion(title), // Add the question title to the array of titles
    updatedAt: new Date(), // Record the time of the last update
  };

  try {
    // Check if the document exists
    const docSnapshot = await getDoc(askedRef);
    if (docSnapshot.exists()) {
      // If document exists, update the array of titles
      await updateDoc(askedRef, {
        titles: arrayUnion(title), // Add new title to the existing array of titles
        updatedAt: new Date(),
      });
    } else {
      // If document doesn't exist, create it with the first title
      await setDoc(askedRef, askedData);
    }

    console.log('Question stored in asked collection:', askedData);
  } catch (error) {
    console.error('Error storing asked question:', error);
    throw new Error('Failed to store asked question');
  }
};

// Fetch asked questions for the logged-in user
const fetchAskedQuestions = async () => {
  if (!user) throw new Error('User not authenticated');

  const userEmail = user.email;
  const askedRef = doc(db, 'asked', userEmail); // Use user's email as document ID

  try {
      const docSnapshot = await getDoc(askedRef);

      if (docSnapshot.exists()) {
          return docSnapshot.data().titles || []; // Return the array of asked titles
      } else {
          return []; // Return empty array if no document exists
      }
  } catch (error) {
      console.error('Error fetching asked questions:', error);
      throw new Error('Failed to fetch asked questions');
  }
};



  return (
    <FirebaseContext.Provider value={{ user, login,fetchAskedQuestions, logout, storeAskedQuestion,signup, createQuestion, fetchQuestions, updateAnswers, fetchUserData,updateUpvote }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);
