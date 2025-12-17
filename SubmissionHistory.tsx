import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, FormSubmission } from '../lib/supabase';
import { History, ExternalLink, Calendar, Loader } from 'lucide-react';

export function SubmissionHistory() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<FormSubmission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSubmissions();
  }, [user]);

  const fetchSubmissions = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('form_submissions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (err) {
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="mt-8">
      <div className="flex items-center space-x-2 mb-4">
        <History className="w-6 h-6 text-gray-700" />
        <h3 className="text-xl font-bold text-gray-800">Submission History</h3>
      </div>

      {submissions.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No submissions yet. Upload a PDF to get started!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <div
              key={submission.id}
              className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm text-gray-600">
                      {formatDate(submission.created_at)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 mb-2">
                    <span className="font-medium">Form URL:</span>{' '}
                    <a
                      href={submission.form_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      {submission.form_url.substring(0, 50)}...
                    </a>
                  </p>
                  <div className="bg-gray-50 rounded p-2 mt-2">
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {submission.pdf_content.substring(0, 200)}...
                    </p>
                  </div>
                </div>
                <a
                  href={submission.form_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-4 p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
