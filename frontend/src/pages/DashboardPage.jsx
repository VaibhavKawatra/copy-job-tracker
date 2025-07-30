import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// --- Reusable Components ---

const Navbar = ({ onLogout }) => (
  <header className="bg-slate-800/50 backdrop-blur-sm shadow-md sticky top-0 z-20">
    <div className="container mx-auto px-6 py-4 flex justify-between items-center">
      <div className="flex items-center">
        <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
        <h1 className="text-xl font-bold text-slate-200 ml-2">Job Tracker AI</h1>
      </div>
      <div className="flex items-center space-x-4">
        <Link to="/profile" className="p-2 rounded-full text-slate-300 hover:bg-slate-700 transition">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
        </Link>
        <button onClick={onLogout} className="bg-indigo-600 text-white py-2 px-4 rounded-lg hover:bg-indigo-700 transition">Logout</button>
      </div>
    </div>
  </header>
);

const Footer = () => (
    <footer className="text-center py-4 text-slate-400 text-sm">
        <p>&copy; {new Date().getFullYear()} Vaibhav. All rights reserved.</p>
    </footer>
);

const JobCard = ({ job, onEdit, onDelete, onView }) => {
    const getStatusColor = (status) => {
        switch (status) {
        case 'Interviewing': return 'bg-green-900/50 text-green-300';
        case 'Offer': return 'bg-blue-900/50 text-blue-300';
        case 'Rejected': return 'bg-red-900/50 text-red-300';
        default: return 'bg-slate-700 text-slate-300';
        }
    };

    return (
        <div 
        className="bg-slate-800/80 p-5 rounded-xl shadow-lg transition-transform hover:scale-105 flex flex-col border border-slate-700 cursor-pointer"
        onClick={() => onView(job)}
        >
        <div className="flex-grow">
            <div className="flex justify-between items-start">
            <div>
                <h3 className="text-lg font-bold text-slate-200">{job.job_title}</h3>
                <p className="text-slate-400">{job.company_name}</p>
            </div>
            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(job.status)}`}>
                {job.status}
            </span>
            </div>
            <p className="text-sm text-slate-400 mt-2">
            Applied on: {new Date(job.application_date).toLocaleDateString()}
            </p>
        </div>
        <div className="mt-4 pt-4 border-t border-slate-700 flex justify-end space-x-2">
            <button onClick={(e) => { e.stopPropagation(); onEdit(job); }} className="text-sm text-blue-400 hover:underline">Edit</button>
            <button onClick={(e) => { e.stopPropagation(); onDelete(job.id); }} className="text-sm text-red-400 hover:underline">Delete</button>
        </div>
        </div>
    );
};

const JobDetailModal = ({ job, onClose }) => {
    if (!job) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-slate-800 rounded-xl shadow-lg w-full max-w-2xl border border-slate-700 max-h-[90vh] flex flex-col">
            <header className="p-4 border-b border-slate-700 flex justify-between items-center">
            <div>
                <h2 className="text-xl font-bold text-white">{job.job_title}</h2>
                <p className="text-slate-400">{job.company_name}</p>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-2xl">&times;</button>
            </header>
            <main className="p-6 overflow-y-auto space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div><strong className="text-slate-400 block">Location:</strong> <span className="text-slate-200">{job.location || 'N/A'}</span></div>
                <div><strong className="text-slate-400 block">Salary:</strong> <span className="text-slate-200">{job.salary || 'N/A'}</span></div>
                <div><strong className="text-slate-400 block">Date Applied:</strong> <span className="text-slate-200">{new Date(job.application_date).toLocaleDateString()}</span></div>
                <div><strong className="text-slate-400 block">Status:</strong> <span className="text-slate-200">{job.status}</span></div>
            </div>
            <div>
                <strong className="text-slate-400 block mb-1">Job Posting URL:</strong>
                <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline break-all">{job.url || 'N/A'}</a>
            </div>
            <div>
                <strong className="text-slate-400 block mb-1">Notes:</strong>
                <p className="text-slate-300 whitespace-pre-wrap">{job.notes || 'No notes added.'}</p>
            </div>
            </main>
            <footer className="p-4 border-t border-slate-700 text-right">
            <button onClick={onClose} className="bg-slate-600 text-white py-2 px-4 rounded-lg hover:bg-slate-500 transition">Close</button>
            </footer>
        </div>
        </div>
    );
};

const StatsSection = ({ jobs }) => {
  const stats = useMemo(() => {
    const total = jobs.length;
    const interviewing = jobs.filter(job => job.status === 'Interviewing').length;
    const offers = jobs.filter(job => job.status === 'Offer').length;
    const rejected = jobs.filter(job => job.status === 'Rejected').length;
    return { total, interviewing, offers, rejected };
  }, [jobs]);

  const chartData = useMemo(() => {
    const statusCounts = jobs.reduce((acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [jobs]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];

  return (
    <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <div className="bg-slate-800/80 p-3 rounded-xl shadow-lg border border-slate-700">
        <h3 className="text-slate-400 text-xs font-medium">Total Applications</h3>
        <p className="text-xl font-bold text-white mt-1">{stats.total}</p>
      </div>
      <div className="bg-slate-800/80 p-3 rounded-xl shadow-lg border border-slate-700">
        <h3 className="text-slate-400 text-xs font-medium">Interviewing</h3>
        <p className="text-xl font-bold text-white mt-1">{stats.interviewing}</p>
      </div>
      <div className="bg-slate-800/80 p-3 rounded-xl shadow-lg border border-slate-700">
        <h3 className="text-slate-400 text-xs font-medium">Offers Received</h3>
        <p className="text-xl font-bold text-white mt-1">{stats.offers}</p>
      </div>
       <div className="bg-slate-800/80 p-3 rounded-xl shadow-lg border border-slate-700">
        <h3 className="text-slate-400 text-xs font-medium">Rejected</h3>
        <p className="text-xl font-bold text-white mt-1">{stats.rejected}</p>
      </div>
      <div className="bg-slate-800/80 p-3 rounded-xl shadow-lg border border-slate-700 sm:col-span-2 lg:col-span-2 xl:col-span-1">
        <h3 className="text-slate-400 text-xs font-medium text-center mb-1">Status Breakdown</h3>
        <ResponsiveContainer width="100%" height={80}>
          <PieChart>
            <Pie 
              data={chartData} 
              dataKey="value" 
              nameKey="name" 
              cx="35%" 
              cy="50%" 
              outerRadius={40} 
              fill="#8884d8"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ background: '#1e293b', border: '1px solid #334155', borderRadius: '0.5rem', fontSize: '0.75rem' }}
              itemStyle={{ color: '#cbd5e1' }}
            />
            <Legend 
              iconType="circle" 
              layout="vertical" 
              verticalAlign="middle" 
              align="right" 
              wrapperStyle={{fontSize: '0.75rem', lineHeight: '1.5'}} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// --- Main Dashboard Page Component ---
const DashboardPage = () => {
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({ company_name: '', job_title: '', application_date: '', status: 'Applied', url: '', location: '', salary: '', notes: '' });
  const [isEditing, setIsEditing] = useState(false);
  const [currentJobId, setCurrentJobId] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  const navigate = useNavigate();

  const fetchJobs = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs`, {
        headers: { 'x-auth-token': token },
      });
      setJobs(res.data);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      if (err.response && err.response.status === 401) navigate('/login');
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  
  const resetForm = () => {
    setFormData({ company_name: '', job_title: '', application_date: '', status: 'Applied', url: '', location: '', salary: '', notes: '' });
    setIsEditing(false);
    setCurrentJobId(null);
  };

  const handleEdit = (job) => {
    setSelectedJob(null);
    setIsEditing(true);
    setCurrentJobId(job.id);
    setFormData({
      company_name: job.company_name || '',
      job_title: job.job_title || '',
      application_date: new Date(job.application_date).toISOString().split('T')[0],
      status: job.status || 'Applied',
      url: job.url || '',
      location: job.location || '',
      salary: job.salary || '',
      notes: job.notes || '',
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this application?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`${import.meta.env.VITE_API_URL}/api/jobs/${id}`, {
          headers: { 'x-auth-token': token },
        });
        setJobs(jobs.filter((job) => job.id !== id));
      } catch (err) {
        console.error('Error deleting job:', err);
      }
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (isEditing) {
      try {
        const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/jobs/${currentJobId}`, formData, {
          headers: { 'x-auth-token': token },
        });
        setJobs(jobs.map((job) => (job.id === currentJobId ? res.data : job)));
        resetForm();
      } catch (err) { console.error('Error updating job:', err); }
    } else {
      try {
        const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs`, formData, {
          headers: { 'x-auth-token': token },
        });
        setJobs([res.data, ...jobs]);
        resetForm();
      } catch (err) { console.error('Error adding job:', err); }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900 flex flex-col">
      <Navbar onLogout={handleLogout} />
      <main className="container mx-auto p-6 flex-grow">
        
        <StatsSection jobs={jobs} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-slate-800/80 p-4 rounded-xl shadow-lg border border-slate-700">
              <h2 className="text-xl font-bold text-slate-200 mb-4">
                {isEditing ? 'Edit Application' : 'Add New Application'}
              </h2>
              <form onSubmit={onSubmit} className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Company Name</label>
                    <input type="text" name="company_name" value={formData.company_name} onChange={onChange} required className="mt-1 w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Job Title</label>
                    <input type="text" name="job_title" value={formData.job_title} onChange={onChange} required className="mt-1 w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-400">Job Posting URL</label>
                  <input type="url" name="url" value={formData.url} onChange={onChange} className="mt-1 w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Location</label>
                    <input type="text" name="location" value={formData.location} onChange={onChange} className="mt-1 w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                   <div>
                    <label className="text-xs font-semibold text-slate-400">Salary</label>
                    <input type="text" name="salary" value={formData.salary} onChange={onChange} className="mt-1 w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Application Date</label>
                    <input type="date" name="application_date" value={formData.application_date} onChange={onChange} required className="mt-1 w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-400">Status</label>
                    <select name="status" value={formData.status} onChange={onChange} className="mt-1 w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                      <option>Applied</option><option>Interviewing</option><option>Offer</option><option>Rejected</option>
                    </select>
                  </div>
                </div>
                 <div>
                  <label className="text-xs font-semibold text-slate-400">Notes</label>
                  <textarea name="notes" value={formData.notes} onChange={onChange} rows="2" className="mt-1 w-full px-3 py-2 border border-slate-600 bg-slate-700 text-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm"></textarea>
                </div>
                <div className="flex space-x-2 pt-1">
                  <button type="submit" className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition font-semibold text-sm">
                    {isEditing ? 'Update' : 'Add'}
                  </button>
                  {isEditing && (
                    <button type="button" onClick={resetForm} className="w-full bg-slate-600 text-slate-200 py-2 rounded-lg hover:bg-slate-500 transition font-semibold text-sm">
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-2xl font-bold text-slate-200 mb-6">Your Applications</h2>
            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} onEdit={handleEdit} onDelete={handleDelete} onView={setSelectedJob} />
                ))}
              </div>
            ) : (
              <div className="text-center bg-slate-800/80 p-10 rounded-xl shadow-lg border border-slate-700">
                <p className="text-slate-400">You haven't added any jobs yet.</p>
                <p className="text-slate-400">Use the form on the left to get started!</p>
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
      <JobDetailModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default DashboardPage;
