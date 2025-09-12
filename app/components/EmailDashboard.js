"use client";
import React, { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { Loader2, Mail, Clock, CheckCircle, AlertCircle, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';

const EmailSummarizerDashboard = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState([]);
  const [status, setStatus] = useState('idle'); // idle, processing, success, error
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const { data: session } = useSession();

  const startSummarization = async () => {
    if (!session?.accessToken) {
      setStatus('error');
      setMessage('Please sign in with Google first');
      return;
    }

    setIsLoading(true);
    setStatus('processing');
    setProgress(0);
    setMessage('Starting email processing...');

    try {
      // Step 1: Start the summarization process
      setProgress(25);
      setMessage('Fetching unread emails...');
      
      const response = await fetch('/api/start-summarization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accessToken: session.accessToken
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server error: ${response.status}`;
        if (process.env.NODE_ENV === 'development' && errorData.details) {
          console.error('Server error details:', errorData.details);
        }
        throw new Error(errorMessage);
      }

      setProgress(50);
      setMessage('Processing emails with AI...');

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Unknown error occurred');
      }

      setProgress(75);
      setMessage('Finalizing summaries...');

      // Update the emails state with the results
      setEmails(result.data.emails || []);
      
      setProgress(100);
      setStatus('success');
      setMessage(`Successfully processed ${result.data.emailsProcessed} emails and generated ${result.data.summariesGenerated} summaries!`);

    } catch (error) {
      console.error('Summarization error:', error);
      setStatus('error');
      setMessage(error.message || 'Failed to process emails');
    } finally {
      setIsLoading(false);
      setTimeout(() => {
        if (status === 'success') {
          setProgress(0);
          setStatus('idle');
          setMessage('');
        }
      }, 3000);
    }
  };

  const refreshStatus = async () => {
    try {
      const response = await fetch('/api/status');
      const data = await response.json();
      
      if (data.recent_emails) {
        setEmails(data.recent_emails.map(email => ({
          id: email.id,
          subject: email.subject,
          from: email.from,
          summary: email.has_summary ? 'Summary available' : 'Processing...',
          status: email.has_summary ? 'completed' : 'pending'
        })));
      }
    } catch (error) {
      console.error('Failed to refresh status:', error);
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'processing':
        return <Loader2 className="w-5 h-5 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Mail className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'success':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'error':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <Mail className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Email Summarizer
                </h1>
                <p className="text-gray-600 text-lg">Welcome back, {session?.user?.name || 'User'}! Let's organize your inbox.</p>
              </div>
            </div>
            <button
              onClick={refreshStatus}
              className="group p-3 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all duration-200 hover:scale-105"
              title="Refresh Status"
            >
              <RefreshCw className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" />
            </button>
          </div>
        </div>

        {/* Main Action Button */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 mb-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Ready to Transform Your Inbox?</h2>
            <p className="text-gray-600 mb-8 text-lg">Get AI-powered summaries of your emails in seconds</p>
            
            <button
              onClick={startSummarization}
              disabled={isLoading}
              className="group relative overflow-hidden w-full max-w-lg mx-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold py-5 px-10 rounded-2xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 hover:shadow-2xl"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-lg">Processing Your Emails...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-3">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-lg">Start AI Summarization</span>
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </button>
            
            {/* Progress Bar */}
            {isLoading && (
              <div className="mt-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                  <span>Processing emails...</span>
                  <span>{progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out relative"
                    style={{ width: `${progress}%` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className={`rounded-2xl border-2 p-6 mb-8 ${getStatusColor()} backdrop-blur-sm shadow-lg`}>
            <div className="flex items-center space-x-3">
              {getStatusIcon()}
              <span className="font-semibold text-lg">{message}</span>
            </div>
          </div>
        )}

        {/* Email Results */}
        {emails.length > 0 && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
            <div className="p-8 border-b border-gray-200/50">
              <div className="flex items-center space-x-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">Email Summaries</h2>
                  <p className="text-gray-600">Your AI-processed emails are ready</p>
                </div>
              </div>
            </div>
            
            <div className="divide-y divide-gray-200/50">
              {emails.map((email, index) => (
                <div key={email.id || index} className="p-8 hover:bg-gradient-to-r hover:from-indigo-50/50 hover:to-purple-50/50 transition-all duration-300 group">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center group-hover:from-indigo-200 group-hover:to-purple-200 transition-colors">
                          <Mail className="w-4 h-4 text-indigo-600" />
                        </div>
                        <h3 className="font-semibold text-gray-900 text-lg truncate group-hover:text-indigo-700 transition-colors">
                          {email.subject || 'No Subject'}
                        </h3>
                        {email.status === 'completed' && (
                          <div className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                            <CheckCircle className="w-4 h-4" />
                            <span>Completed</span>
                          </div>
                        )}
                        {email.status === 'pending' && (
                          <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
                            <Clock className="w-4 h-4" />
                            <span>Processing</span>
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-4 font-medium">From: {email.from}</p>
                      <div className="bg-gray-50 rounded-xl p-4 group-hover:bg-white group-hover:shadow-sm transition-all duration-300">
                        <p className="text-gray-700 leading-relaxed">{email.summary}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 ml-6 flex-shrink-0 bg-gray-100 px-3 py-2 rounded-lg">
                      {email.created ? new Date(email.created).toLocaleDateString() : 'Recent'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign Out Button */}
        <div className="text-center mt-12">
          <button
            onClick={() => {
              // Clear local UI state then sign out via NextAuth
              setEmails([]);
              setStatus('idle');
              setMessage('');
              // Redirect back to home after sign out
              signOut({ callbackUrl: '/' });
            }}
            className="group bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg"
          >
            <div className="flex items-center space-x-2">
              <span>Sign Out</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailSummarizerDashboard;