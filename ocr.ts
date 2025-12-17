import Tesseract from 'tesseract.js';

export interface Language {
  code: string;
  name: string;
  tesseractCode: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', tesseractCode: 'eng' },
  { code: 'ml', name: 'Malayalam', tesseractCode: 'mal' },
  { code: 'hi', name: 'Hindi', tesseractCode: 'hin' },
  { code: 'ta', name: 'Tamil', tesseractCode: 'tam' },
  { code: 'te', name: 'Telugu', tesseractCode: 'tel' },
  { code: 'kn', name: 'Kannada', tesseractCode: 'kan' },
  { code: 'gu', name: 'Gujarati', tesseractCode: 'guj' },
  { code: 'bn', name: 'Bengali', tesseractCode: 'ben' },
  { code: 'pa', name: 'Punjabi', tesseractCode: 'pan' },
  { code: 'fr', name: 'French', tesseractCode: 'fra' },
  { code: 'es', name: 'Spanish', tesseractCode: 'spa' },
  { code: 'de', name: 'German', tesseractCode: 'deu' },
];

interface OCRProgress {
  status: string;
  progress: number;
}

export async function extractTextFromPDF(
  file: File,
  languages: string[],
  onProgress?: (progress: OCRProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const tessOptions = languages.length > 0 ? languages.join('+') : 'eng';

        const worker = Tesseract.createWorker();

        worker.load().then(() => {
          return worker.loadLanguage(tessOptions);
        }).then(() => {
          return worker.initialize(tessOptions);
        }).then(() => {
          return worker.recognize(url);
        }).then((result) => {
          const text = result.data.text || '';
          URL.revokeObjectURL(url);
          worker.terminate();
          resolve(text);
        }).catch((error) => {
          URL.revokeObjectURL(url);
          worker.terminate();
          reject(error);
        });
      } catch (err) {
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read PDF file'));
    };

    reader.readAsArrayBuffer(file);
  });
}

export async function extractTextWithProgress(
  file: File,
  languages: string[],
  onProgress: (progress: OCRProgress) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const blob = new Blob([arrayBuffer], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);

        const tessOptions = languages.length > 0 ? languages.join('+') : 'eng';
        const worker = Tesseract.createWorker();

        onProgress({ status: 'Loading worker...', progress: 10 });

        await worker.load();
        onProgress({ status: 'Loading languages...', progress: 25 });

        await worker.loadLanguage(tessOptions);
        onProgress({ status: 'Initializing OCR...', progress: 40 });

        await worker.initialize(tessOptions);
        onProgress({ status: 'Recognizing text...', progress: 60 });

        const result = await worker.recognize(url);
        onProgress({ status: 'Processing text...', progress: 85 });

        const text = result.data.text || '';
        URL.revokeObjectURL(url);

        await worker.terminate();
        onProgress({ status: 'Complete!', progress: 100 });

        resolve(text);
      } catch (err) {
        URL.revokeObjectURL(blob as any);
        reject(err);
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read PDF file'));
    };

    reader.readAsArrayBuffer(file);
  });
}
