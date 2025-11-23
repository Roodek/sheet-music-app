import { useState } from 'react';
import SheetList from '../components/SheetList/SheetList';
import SheetViewer from '../components/SheetViewer/SheetViewer';

export default function SheetsPage() {
  const [viewingSheet, setViewingSheet] = useState(null);

  const handleViewSheet = (sheet) => {
    setViewingSheet(sheet);
  };

  const handleCloseViewer = () => {
    setViewingSheet(null);
  };

  return (
    <>
      <SheetList onViewSheet={handleViewSheet} />
      {viewingSheet && (
        <SheetViewer sheet={viewingSheet} onClose={handleCloseViewer} />
      )}
    </>
  );
}