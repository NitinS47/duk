import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { axiosInstance } from '../lib/axios';
import { OrigamiIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState('idle'); // 'idle', 'loading', 'success', 'error'
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setStatus('error');
      setMessage('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setStatus('error');
      setMessage('Password must be at least 6 characters long');
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setStatus('loading');

    try {
      await axiosInstance.post(`/auth/reset-password/${token}`, { password });
      setStatus('success');
      toast.success('Password has been reset successfully!');
      setMessage('Your password has been reset. You can now log in with your new password.');
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (error) {
      setStatus('error');
      const errorMessage = error.response?.data?.message || 'Something went wrong. Please try again.';
      setMessage(errorMessage);
      toast.error(errorMessage);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-base-100 rounded-xl shadow-lg">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <OrigamiIcon className="size-12 text-primary" />
          </div>
          <h2 className="text-2xl font-bold">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your new password below.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="input input-bordered w-full"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="input input-bordered w-full"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
          </div>

          {status === 'error' && (
            <div className="alert alert-error">
              <span>{message}</span>
            </div>
          )}

          {status === 'success' && (
            <div className="alert alert-success">
              <span>{message}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              className="btn btn-primary w-full"
              disabled={status === 'loading'}
            >
              {status === 'loading' ? (
                <>
                  <span className="loading loading-spinner loading-xs"></span>
                  Resetting Password...
                </>
              ) : (
                'Reset Password'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              className="text-sm text-primary hover:underline"
              onClick={() => navigate('/login')}
            >
              Back to Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage; 