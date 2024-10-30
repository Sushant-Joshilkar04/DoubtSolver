// Firebase.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut, createUserWithEmailAndPassword, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink, fetchSignInMethodsForEmail, updatePassword, sendEmailVerification } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, doc, updateDoc, arrayUnion, setDoc, getDoc, deleteDoc, query, where, orderBy, serverTimestamp } from 'firebase/firestore';
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

// Add this function definition before the FirebaseProvider component
const verifyEmailLink = async () => {
  try {
    const pendingSignupStr = sessionStorage.getItem('pendingSignup');
    if (!pendingSignupStr) {
      throw new Error('No pending signup found');
    }

    const pendingSignup = JSON.parse(pendingSignupStr);
    const { email, name, surname, uid } = pendingSignup;

    // Update user document with verified status and user data
    await setDoc(doc(db, 'users', uid), {
      name,
      surname,
      email,
      verified: true,
      emailVerified: true,
      createdAt: new Date(),
      role: 'student',
      questionsAsked: 0,
      answersGiven: 0,
      lastLogin: new Date(),
      profileComplete: true,
      collegeDetails: {
        institution: 'PCCOE',
        domain: 'pccoepune.org'
      }
    }, { merge: true });

    // Clear session storage
    sessionStorage.removeItem('pendingSignup');

    console.log('User verified and data updated successfully');
    return true;
  } catch (error) {
    console.error('Error in verifyEmailLink:', error);
    throw error;
  }
};

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
      // First attempt to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Get user document
      const userRef = doc(db, 'users', userCredential.user.uid);
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error('Account not found. Please sign up first.');
      }

      // Update last login time and verification status
      await updateDoc(userRef, {
        lastLogin: new Date(),
        emailVerified: true, // Set this to true on successful login
        verified: true // Set this to true as well
      });

      // Log login activity
      await logUserActivity(userCredential.user.uid, 'user_login');

      return userCredential;
    } catch (error) {
      console.error('Login error:', error);
      
      // Handle specific error cases
      switch (error.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          throw new Error('Invalid email or password. Please try again.');
        case 'auth/too-many-requests':
          throw new Error('Too many failed login attempts. Please try again later.');
        default:
          if (error.message) {
            throw error;
          } else {
            throw new Error('Failed to login. Please try again.');
          }
      }
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

  const validateCollegeEmail = (email) => {
    const domain = email.split('@')[1];
    return domain === 'pccoepune.org';
  };

  const sendVerificationEmail = async (email, password, name, surname) => {
    if (!validateCollegeEmail(email)) {
      throw new Error('Please use your college email (@pccoepune.org)');
    }

    try {
      // Create user with email/password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create initial user document
      await setDoc(doc(db, 'users', user.uid), {
        name,
        surname,
        email,
        verified: false,
        createdAt: new Date(),
        role: 'student',
        questionsAsked: 0,
        answersGiven: 0,
        lastLogin: new Date(),
        profileComplete: false,
        collegeDetails: {
          institution: 'PCCOE',
          domain: 'pccoepune.org'
        }
      });

      // Send verification email
      await sendEmailVerification(user);

      // Store user data temporarily
      sessionStorage.setItem('pendingSignup', JSON.stringify({
        email,
        name,
        surname,
        uid: user.uid
      }));

      return {
        success: true,
        message: 'Verification email sent. Please check your college email.'
      };
    } catch (error) {
      console.error('Error in sendVerificationEmail:', error);
      throw error;
    }
  };

  const signup = async (email, password, name, surname) => {
    try {
      if (!validateCollegeEmail(email)) {
        throw new Error('Please use your college email (@pccoepune.org)');
      }

      // Check if email already exists
      const methods = await fetchSignInMethodsForEmail(auth, email);
      if (methods.length > 0) {
        throw new Error('Email already registered');
      }

      // Send verification email and create pending user
      return await sendVerificationEmail(email, password, name, surname);
    } catch (error) {
      console.error('Error in signup:', error);
      throw new Error(getAuthErrorMessage(error));
    }
  };

  const fetchQuestions = async (categoryFilter = null) => {
    try {
      let questionsQuery;
      
      if (categoryFilter) {
        questionsQuery = query(
          collection(db, 'questions'),
          where('category', '==', categoryFilter),
          orderBy('createdAt', 'desc')
        );
      } else {
        questionsQuery = query(
          collection(db, 'questions'),
          orderBy('createdAt', 'desc')
        );
      }

      const [questionsSnapshot, usersSnapshot] = await Promise.all([
        getDocs(questionsQuery),
        getDocs(collection(db, 'users'))
      ]);

      // Create a map of user data
      const userMap = {};
      usersSnapshot.docs.forEach(doc => {
        userMap[doc.id] = doc.data();
      });

      const questions = questionsSnapshot.docs.map(doc => {
        const data = doc.data();
        const userData = userMap[data.userId] || {};
        
        return {
          id: doc.id,
          title: data.title,
          category: data.category,
          createdAt: data.createdAt?.toDate()?.toLocaleDateString() || 'Unknown date',
          answers: data.answers || [],
          author: `${userData.name || ''} ${userData.surname || ''}`.trim() || userData.email || 'Unknown User'
        };
      });
      
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

  const updateAnswers = async (questionId, authorEmail, answer) => {
    try {
      const answerData = {
        author: authorEmail,
        answer: answer,
        createdAt: new Date().toISOString(), // Use ISO string instead of serverTimestamp
        userId: user.uid,
        updatedAt: new Date().toISOString()
      };

      const questionRef = doc(db, 'questions', questionId);
      
      // First get the current answers
      const questionDoc = await getDoc(questionRef);
      if (!questionDoc.exists()) {
        throw new Error('Question not found');
      }

      const currentAnswers = questionDoc.data().answers || [];
      
      // Create new answers array
      const newAnswers = [...currentAnswers, answerData];

      // Update the document with the new answers array
      await updateDoc(questionRef, {
        answers: newAnswers
      });

      // Update user's answer count
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        answersGiven: increment(1),
        lastActive: new Date().toISOString()
      });

      return answerData;
    } catch (error) {
      console.error('Error updating answers:', error);
      throw error;
    }
  };

  const fetchUserData = async () => {
    try {
      if (!user) {
        console.warn('User is not authenticated, returning null.');
        return null;
      }

      const userRef = doc(db, 'users', user.uid);
      const userSnapshot = await getDoc(userRef);

      if (!userSnapshot.exists()) {
        // If user document doesn't exist, create a default one
        const defaultUserData = {
          email: user.email,
          name: user.displayName || 'User',
          createdAt: new Date(),
          verified: false,
          role: 'student',
          questionsAsked: 0,
          answersGiven: 0,
          lastLogin: new Date()
        };

        await setDoc(userRef, defaultUserData);
        return defaultUserData;
      }

      return userSnapshot.data();
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  const createQuestion = async (title, category) => {
    if (!user) throw new Error('User not authenticated');

    try {
      // First, ensure user document exists
      const userRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName || 'User',
          createdAt: new Date().toISOString(),
          questionsAsked: 0,
          answersGiven: 0,
          lastLogin: new Date().toISOString(),
          role: 'student'
        });
      }

      // Create the question
      const questionData = {
        title,
        category,
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date().toISOString(), // Use ISO string instead of serverTimestamp
        answers: []
      };

      // Add question to Firestore
      const docRef = await addDoc(collection(db, 'questions'), questionData);

      // Update categories
      await updateCategories(category);

      // Update user's question count
      await updateDoc(userRef, {
        questionsAsked: increment(1),
        lastActive: new Date().toISOString()
      });

      console.log('Question submitted with ID:', docRef.id);
      return docRef.id;
    } catch (error) {
      console.error('Error submitting question:', error);
      if (error.code === 'not-found') {
        throw new Error('User profile not found. Please try logging in again.');
      }
      throw new Error('Failed to submit question: ' + error.message);
    }
  };

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

  const fetchAskedQuestions = async () => {
    try {
      if (!user) throw new Error("User must be logged in");
      
      const questionsQuery = query(
        collection(db, 'questions'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(questionsQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        title: doc.data().title,
        category: doc.data().category,
        createdAt: doc.data().createdAt?.toDate()?.toLocaleDateString() || 'Unknown date',
        answers: doc.data().answers || []
      }));
    } catch (error) {
      console.error("Error fetching asked questions:", error);
      throw error;
    }
  };

  const deleteQuestion = async (questionId) => {
    try {
      if (!user) throw new Error("User must be logged in to delete questions");
      
      // Delete the question document from Firestore
      await deleteDoc(doc(db, "questions", questionId));
      return true;
    } catch (error) {
      console.error("Error deleting question:", error);
      throw error;
    }
  };

  const logUserActivity = async (userId, action, details = {}) => {
    try {
      await addDoc(collection(db, 'userActivity'), {
        userId,
        action,
        timestamp: new Date(),
        details
      });
    } catch (error) {
      console.error('Error logging user activity:', error);
    }
  };

  const updateUserStats = async (userId, field) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        [field]: increment(1),
        lastActive: new Date()
      });
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const cleanupPendingUser = async (email) => {
    try {
      const pendingQuery = query(
        collection(db, 'pendingUsers'),
        where('email', '==', email)
      );
      const snapshot = await getDocs(pendingQuery);
      snapshot.docs.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error('Error cleaning up pending user:', error);
    }
  };

  const checkVerificationStatus = async (email) => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email)
      );
      
      const snapshot = await getDocs(usersQuery);
      
      if (snapshot.empty) {
        return false; // User not found
      }

      // Consider the user verified if they exist in the database
      return true;
    } catch (error) {
      console.error('Error checking verification status:', error);
      return false;
    }
  };

  const cleanupExpiredPendingUsers = async () => {
    try {
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const expiredQuery = query(
        collection(db, 'pendingUsers'),
        where('createdAt', '<=', twentyFourHoursAgo)
      );

      const snapshot = await getDocs(expiredQuery);
      snapshot.docs.forEach(async (doc) => {
        await deleteDoc(doc.ref);
      });
    } catch (error) {
      console.error('Error cleaning up expired pending users:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const categoryDoc = await getDoc(doc(db, 'categories', 'allCategories'));
      return categoryDoc.exists() ? categoryDoc.data().list || [] : [];
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  };

  const updateCategories = async (newCategory) => {
    try {
      const categoryRef = doc(db, 'categories', 'allCategories');
      
      // Try to get existing categories
      const categoryDoc = await getDoc(categoryRef);
      
      if (!categoryDoc.exists()) {
        // If document doesn't exist, create it with the new category
        await setDoc(categoryRef, {
          list: [newCategory]
        });
      } else {
        // If document exists and category isn't in the list, add it
        const categories = categoryDoc.data().list || [];
        if (!categories.includes(newCategory)) {
          await updateDoc(categoryRef, {
            list: arrayUnion(newCategory)
          });
        }
      }
    } catch (error) {
      console.error('Error updating categories:', error);
      // Don't throw error here to prevent question creation from failing
    }
  };

  const deleteAnswer = async (questionId, answerToDelete) => {
    try {
      const questionRef = doc(db, 'questions', questionId);
      const questionDoc = await getDoc(questionRef);
      
      if (!questionDoc.exists()) {
        throw new Error('Question not found');
      }

      const currentAnswers = questionDoc.data().answers || [];
      const updatedAnswers = currentAnswers.filter(
        answer => answer.answer !== answerToDelete.answer || answer.author !== answerToDelete.author
      );

      await updateDoc(questionRef, {
        answers: updatedAnswers
      });

      // Update user's answer count
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        answersGiven: increment(-1) // Decrement answer count
      });
    } catch (error) {
      console.error('Error deleting answer:', error);
      throw error;
    }
  };

  const updateExistingAnswer = async (questionId, originalAnswer, newAnswerText) => {
    try {
      const questionRef = doc(db, 'questions', questionId);
      const questionDoc = await getDoc(questionRef);
      
      if (!questionDoc.exists()) {
        throw new Error('Question not found');
      }

      const currentAnswers = questionDoc.data().answers || [];
      const updatedAnswers = currentAnswers.map(answer => {
        if (answer.answer === originalAnswer.answer && answer.author === originalAnswer.author) {
          return { 
            ...answer, 
            answer: newAnswerText,
            updatedAt: new Date().toISOString()
          };
        }
        return answer;
      });

      await updateDoc(questionRef, {
        answers: updatedAnswers
      });
    } catch (error) {
      console.error('Error updating answer:', error);
      throw error;
    }
  };

  useEffect(() => {
    const cleanup = setInterval(cleanupExpiredPendingUsers, 1000 * 60 * 60); // Run every hour
    return () => clearInterval(cleanup);
  }, []);

  return (
    <FirebaseContext.Provider value={{
      user,
      login,
      logout,
      signup,
      verifyEmailLink,
      fetchUserData,
      updateUserStats,
      logUserActivity,
      fetchAskedQuestions,
      storeAskedQuestion,
      createQuestion,
      fetchQuestions,
      updateAnswers,
      updateUpvote,
      deleteQuestion,
      checkVerificationStatus,
      cleanupPendingUser,
      fetchCategories,
      updateCategories,
      deleteAnswer,
      updateExistingAnswer,
    }}>
      {children}
    </FirebaseContext.Provider>
  );
};

export const useFirebase = () => useContext(FirebaseContext);

const getAuthErrorMessage = (error) => {
  switch (error.code) {
    case 'auth/operation-not-allowed':
      return 'Sign-up is temporarily disabled. Please try again later.';
    case 'auth/email-already-in-use':
      return 'This email is already registered.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    default:
      return error.message;
  }
};
