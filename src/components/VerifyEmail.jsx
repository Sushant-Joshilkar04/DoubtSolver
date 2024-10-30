import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFirebase } from '../context/Firebase';

const VerifyEmail = () => {
    const [verifying, setVerifying] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const { verifyEmailLink } = useFirebase();

    useEffect(() => {
        const completeSignup = async () => {
            try {
                const pendingSignup = sessionStorage.getItem('pendingSignup');
                if (!pendingSignup) {
                    throw new Error('No signup data found. Please try signing up again.');
                }

                await verifyEmailLink();
                
                // Clear session storage
                sessionStorage.removeItem('pendingSignup');
                
                alert('Email verified successfully! You can now login.');
                navigate('/login');
            } catch (error) {
                setError(error.message);
                console.error('Verification error:', error);
            } finally {
                setVerifying(false);
            }
        };

        completeSignup();
    }, [navigate, verifyEmailLink]);

    if (verifying) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="mt-4">Verifying your email...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="text-red-500 mb-4">⚠️ {error}</div>
                    <p className="mb-4">Please try signing up again or contact support if the problem persists.</p>
                    <button
                        onClick={() => navigate('/signup')}
                        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                        Back to Signup
                    </button>
                </div>
            </div>
        );
    }

    return null;
};

export default VerifyEmail; 