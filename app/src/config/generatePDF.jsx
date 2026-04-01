import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import React from 'react';
import { createRoot } from 'react-dom/client';
import ViewApprovalForm from '../pages/FormApproval/ViewApprovalForm';
import store, { persistor } from '../redux/store';
import { StrictMode } from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/lib/integration/react';
import { ThemeProvider } from '@emotion/react';
import theme from '../utilities/theme';
import MUISnackbar from '../components/MUISnackbar';

const createContainer = () => {
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.top = '-9999px';
  container.style.left = '-9999px';
  container.style.width = '1200px';
  document.body.appendChild(container);
  return container;
};

export const generatePDFfromData = async (data) => {
  return new Promise((resolve) => {
    const container = createContainer();

    const root = createRoot(container);
    root.render(
      <StrictMode>
        <Provider store={store}>
          <PersistGate loading={null} persistor={persistor}>
            <ThemeProvider theme={theme}>
              <MUISnackbar />
              <ViewApprovalForm data={data} fileType="Download" onClose={() => {}} />
            </ThemeProvider>
          </PersistGate>
        </Provider>
      </StrictMode>
    );

    setTimeout(async () => {
      const element = container.querySelector('section');
      if (!element) {
        console.error("Could not find <section> in rendered output.");
        document.body.removeChild(container);
        return resolve(null);
      }
  
      // Save old computed styles
      const computedStyle = window.getComputedStyle(element);
      const oldOverflow = computedStyle.overflow;
      const oldHeight = computedStyle.height;
    
      // Expand element to capture all
      element.style.overflow = "visible";
      element.style.height = "auto";
    
      await new Promise(r => setTimeout(r, 100));
    
      const canvas = await html2canvas(element, { scale: 3, useCORS: true });
      const imageData = canvas.toDataURL("image/png");
    
      const pdf = new jsPDF("landscape", "mm", "a4");
    
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
    
      // Set margins (in mm)
      const margin = 10;
      const usableWidth = pageWidth - margin * 2;
      const usableHeight = pageHeight - margin * 2;
    
      // Scale image to fit within margins
      const imgWidth = usableWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
      let heightLeft = imgHeight;
      let position = margin;
    
      // First page
      pdf.addImage(imageData, "PNG", margin, position, imgWidth, imgHeight);
      heightLeft -= usableHeight;
    
      // Extra pages
      while (heightLeft > 0) {
        position = heightLeft - (imgHeight + margin);
        pdf.addPage();
        pdf.addImage(imageData, "PNG", margin, position, imgWidth, imgHeight);
        heightLeft -= usableHeight;
      }
    
      const pdfBlob = pdf.output('blob');
    
      // Restore old styles
      element.style.overflow = oldOverflow;
      element.style.height = oldHeight;

      document.body.removeChild(container);
      resolve(pdfBlob);
    }, 300);
  });
};
