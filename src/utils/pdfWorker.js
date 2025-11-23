import * as pdfjsLib from 'pdfjs-dist';

// Use correct unpkg CDN
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

export default pdfjsLib;