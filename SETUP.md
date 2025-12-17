# Form Auto-Filler Setup Guide

## Overview
This application helps you auto-fill Google Forms using content extracted from PDF files. It includes user authentication and keeps track of your submission history.

## Features
- User registration with profile information (name, place, phone number, age, date of birth)
- Secure authentication with email and password
- AI-powered OCR (Optical Character Recognition) for accurate text extraction
- Multi-language support (English, Malayalam, Hindi, Tamil, Telugu, Kannada, Gujarati, Bengali, Punjabi, French, Spanish, German)
- PDF upload and intelligent text extraction
- Google Form integration
- Submission history tracking
- Real-time OCR progress indicator

## Setup Instructions

### 1. Configure Supabase

Update the `.env` file with your Supabase credentials:

```
VITE_SUPABASE_URL=your_actual_supabase_url
VITE_SUPABASE_ANON_KEY=your_actual_supabase_anon_key
```

To get these values:
1. Go to your Supabase project dashboard
2. Navigate to Settings > API
3. Copy the Project URL and anon/public key

### 2. Database Setup

The database schema has been automatically created with the following tables:
- `profiles` - Stores user profile information
- `form_submissions` - Tracks PDF uploads and form URLs

Row Level Security (RLS) is enabled to ensure users can only access their own data.

### 3. Run the Application

```bash
npm install
npm run dev
```

## How to Use

1. **Sign Up**: Create an account with your email, password, and profile information
2. **Sign In**: After registration, sign in with your email and password
3. **Select Languages**: Choose the languages present in your PDF (e.g., English, Malayalam, Hindi)
4. **Upload PDF**: Upload a PDF file containing questions and answers
5. **Wait for OCR**: The AI-powered OCR system will extract text accurately - progress will be shown
6. **Enter Form URL**: Paste your Google Form URL
7. **Submit**: Click "Save & Open Form" to save the data and open the form in a new tab
8. **Fill Form**: Use the extracted PDF content as reference to fill the Google Form manually

## Important Notes

### Google Forms Limitation
- Google Forms does not provide an official API for programmatic form filling
- The app extracts text from your PDF and stores it for reference
- You'll need to manually fill the form using the extracted information
- The form opens in a new tab for easy access

### PDF Extraction
- The app uses advanced AI-powered OCR (Tesseract) for text extraction
- Supports 12+ languages including English, Malayalam, Hindi, Tamil, and more
- For best results, use PDFs with clear, readable text and good resolution
- Select multiple languages if your PDF contains mixed-language content
- OCR accuracy depends on PDF quality - clearer PDFs yield better results
- Processing time varies based on PDF size and complexity

## Security
- All user data is protected with Row Level Security
- Passwords are securely hashed
- Users can only access their own submissions
- Authentication is required for all features

## Supported Languages

The OCR system supports the following languages:
- English (eng)
- Malayalam (mal)
- Hindi (hin)
- Tamil (tam)
- Telugu (tel)
- Kannada (kan)
- Gujarati (guj)
- Bengali (ben)
- Punjabi (pan)
- French (fra)
- Spanish (spa)
- German (deu)

You can select multiple languages for a single PDF if it contains mixed-language content.

## Support
If you encounter any issues, check that:
- Your Supabase credentials are correct
- The database migrations have been applied
- You're using a supported browser (Chrome, Firefox, Safari, Edge)
- Your PDF has readable text (scanned documents work but with lower accuracy)
- You have sufficient storage for OCR processing (depends on browser capabilities)
