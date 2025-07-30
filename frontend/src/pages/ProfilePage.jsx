import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const ProfilePage = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const { currentPassword, newPassword } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const token = localStorage.getItem('token');
      const res = await axios.put(
        'http://localhost:8888/api/auth/change-password',
        { currentPassword, newPassword },
        { headers: { 'x-auth-token': token } }
      );
      setMessage(res.data.msg);
      setFormData({ currentPassword: '', newPassword: '' }); // Clear form
    } catch (err) {
      setError(err.response?.data?.msg || 'An error occurred');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 text-slate-200">
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <Link to="/dashboard" className="text-indigo-400 hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="max-w-md mx-auto bg-slate-800/80 p-8 rounded-xl shadow-lg border border-slate-700">
          <h1 className="text-3xl font-bold mb-6 text-center">User Profile</h1>
          
          <h2 className="text-xl font-semibold mb-4">Change Password</h2>
          
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-400">Current Password</label>
              <input
                type="password"
                name="currentPassword"
                value={currentPassword}
                onChange={onChange}
                required
                className="mt-1 w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-400">New Password</label>
              <input
                type="password"
                name="newPassword"
                value={newPassword}
                onChange={onChange}
                required
                className="mt-1 w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
            <div className="pt-2">
              <button
                type="submit"
                className="w-full bg-indigo-600 text-white py-3 rounded-lg hover:bg-indigo-700 transition font-semibold"
              >
                Update Password
              </button>
            </div>
          </form>

          {message && <p className="mt-4 text-center text-green-400">{message}</p>}
          {error && <p className="mt-4 text-center text-red-400">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
