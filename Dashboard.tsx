import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { Upload, FileText, ExternalLink, LogOut, User, Loader, CheckCircle } from 'lucide-react';
import { SubmissionHistory } from './SubmissionHistory';
import { extractTextWithProgress, SUPPORTED_LANGUAGES } from '../lib/ocr';

export function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [formUrl, setFormUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['eng']);
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setError('Please upload a PDF file');
      return;
    }

    setPdfFile(file);
    setError('');
    setSuccess('');
    setOcrProgress(0);
    setOcrStatus('');

    try {
      setLoading(true);
      const text = await extractTextWithProgress(file, selectedLanguages, (progress) => {
        setOcrProgress(progress.progress);
        setOcrStatus(progress.status);
      });
      setExtractedText(text);
      setSuccess('PDF content extracted successfully!');
      setOcrProgress(0);
      setOcrStatus('');
    } catch (err) {
      setError('Failed to extract text from PDF. Please try another file.');
      console.error(err);
      setOcrProgress(0);
      setOcrStatus('');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageToggle = (langCode: string) => {
    setSelectedLanguages((prev) => {
      if (prev.includes(langCode)) {
        return prev.filter((l) => l !== langCode);
      } else {
        return [...prev, langCode];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extractedText || !formUrl || !user) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { error: dbError } = await supabase.from('form_submissions').insert({
        user_id: user.id,
        pdf_content: extractedText,
        form_url: formUrl,
        status: 'completed',
      });

      if (dbError) throw dbError;

      setSuccess('Form submission saved! Opening Google Form...');

      setTimeout(() => {
        window.open(formUrl, '_blank');
      }, 1000);

      setPdfFile(null);
      setExtractedText('');
      setFormUrl('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to save submission');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-800">Form Auto-Filler</h1>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-gray-700">
                <User className="w-5 h-5" />
                <span className="font-medium">{profile?.name}</span>
              </div>
              <button
                onClick={signOut}
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Upload PDF & Auto-Fill Form</h2>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Select Languages (for accurate extraction)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.tesseractCode}
                    type="button"
                    onClick={() => handleLanguageToggle(lang.tesseractCode)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      selectedLanguages.includes(lang.tesseractCode)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedLanguages.includes(lang.tesseractCode) && (
                      <CheckCircle className="w-4 h-4 inline mr-1" />
                    )}
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload PDF (Questions & Answers)
              </label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  disabled={loading}
                />
                <label
                  htmlFor="pdf-upload"
                  className={`cursor-pointer flex flex-col items-center ${loading ? 'opacity-50' : ''}`}
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-3" />
                  <span className="text-sm text-gray-600">
                    {pdfFile ? pdfFile.name : 'Click to upload PDF file'}
                  </span>
                  {pdfFile && !loading && (
                    <span className="text-xs text-green-600 mt-2">
                      File uploaded successfully
                    </span>
                  )}
                </label>
              </div>

              {loading && ocrProgress > 0 && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">{ocrStatus}</span>
                    <span className="text-sm text-gray-600">{ocrProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${ocrProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {extractedText && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Extracted Content Preview
                </label>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap">{extractedText.substring(0, 500)}...</pre>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Form URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  required
                  placeholder="https://docs.google.com/forms/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
                  value={formUrl}
                  onChange={(e) => setFormUrl(e.target.value)}
                />
                <ExternalLink className="absolute right-3 top-3 w-5 h-5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !extractedText || !formUrl}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  <span>Save & Open Form</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">How to use:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Select the languages present in your PDF (English, Malayalam, etc.)</li>
              <li>Upload a PDF containing your questions and answers</li>
              <li>The AI OCR system will extract text accurately in all selected languages</li>
              <li>Enter your Google Form URL</li>
              <li>Click "Save & Open Form" to save the data and open the form</li>
              <li>Manually fill the form using the extracted information as reference</li>
            </ol>
          </div>

          <SubmissionHistory />
        </div>
      </main>
    </div>
  );
}
