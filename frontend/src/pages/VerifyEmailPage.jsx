import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { OrigamiIcon } from 'lucide-react';

const VerifyEmailPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');
    const [email, setEmail] = useState('');
    const [resendStatus, setResendStatus] = useState('');

    useEffect(() => {
        if (token) {
            verifyEmail();
        }
    }, [token]);

    const verifyEmail = async () => {
        try {
            const response = await axiosInstance.get(`/auth/verify-email/${token}`);
            setStatus('success');
            setMessage('Email verified successfully! You can now log in.');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setStatus('error');
            setMessage(error.response?.data?.message || 'Failed to verify email. Please try again.');
        }
    };

    const handleResendVerification = async (e) => {
        e.preventDefault();
        if (!email) {
            setResendStatus('Please enter your email address');
            return;
        }

        try {
            setResendStatus('sending');
            await axiosInstance.post('/auth/resend-verification', { email });
            setResendStatus('sent');
            setMessage('Verification email sent! Please check your inbox.');
        } catch (error) {
            setResendStatus('error');
            setMessage(error.response?.data?.message || 'Failed to resend verification email. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <OrigamiIcon className="h-12 w-12 text-indigo-600" />
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Email Verification
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {token ? (
                        <div className="text-center">
                            {status === 'verifying' && (
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            )}
                            <p className={`mt-4 text-sm ${status === 'error' ? 'text-red-600' : 'text-gray-600'}`}>
                                {message}
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleResendVerification} className="space-y-6">
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={resendStatus === 'sending'}
                                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                                >
                                    {resendStatus === 'sending' ? 'Sending...' : 'Resend Verification Email'}
                                </button>
                            </div>

                            {resendStatus && (
                                <p className={`text-sm ${resendStatus === 'error' ? 'text-red-600' : 'text-green-600'}`}>
                                    {message}
                                </p>
                            )}
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage; 