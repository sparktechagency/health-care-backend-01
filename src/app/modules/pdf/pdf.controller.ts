import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ConsultationService } from '../consultation/consultation.service';
import catchAsync from '../../../shared/catchAsync';

export const generatePdf = catchAsync(async (req: Request, res: Response) => {
  const consultationId = req.params.id;
  const consultation = await ConsultationService.getConsultationByID(
    consultationId
  );

  if (!consultation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Consultation not found');
  }

  // // Validate required data
  // if (!consultation.userId || !consultation.doctorId) {
  //   throw new ApiError(
  //     StatusCodes.BAD_REQUEST,
  //     'Missing required user or doctor information'
  //   );
  // }

  const todaysDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });
  let browser = null;
  try {
    const htmlContent = await `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Medical Prescription - Dokter For You</title>
  <style>
 * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }
    
    body {
      background-image: url("https://res.cloudinary.com/dulgs9eba/image/upload/v1735533787/Untitled_design_zrnqak.png");
      background-size: 800px 1000px;
      background-position: center;
      background-repeat: no-repeat;
      padding: 20px;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .prescription-form {
      width: 210mm;
      min-height: 297mm;
      padding: 20px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      position: relative;
      background-color: rgba(255, 255, 255, 0.95);
    }
    
    .logo-section {
      display: flex;
      align-items: center;
      gap: 15px;
      margin-bottom: 30px;
      position: relative;
      z-index: 2;
    }
    
    .pdf-image {
      height: 70px;
      object-fit: contain;
    }
    
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-bottom: 30px;
      position: relative;
      z-index: 2;
    }
    
    .info-item {
      margin-bottom: 15px;
    }
    
    .info-label {
      font-weight: 600;
      color: #0070C0;
      font-size: 13px;
      margin-bottom: 4px;
    }
    
    .info-value {
      font-size: 14px;
      color: #333;
      padding: 5px 0;
      border-bottom: 1px solid #e0e0e0;
    }
    
    .divider {
      margin: 25px 0;
      height: 1px;
      background-color: #e0e0e0;
    }
    
    .medicine-table {
      width: 100%;
      border-collapse: collapse;
      margin: 20px 0;
    }
    
    .medicine-table th,
    .medicine-table td {
      border: 1px solid #ddd;
      padding: 12px;
      text-align: left;
    }
    
    .medicine-table th {
      background-color: rgba(0, 112, 192, 0.1);
    }
    
    .medicine-name {
      font-weight: normal;
    }
    
    .text-header {
      color: #0070C0;
      font-size: 15px;
      font-weight: 600;
    }
    
    .footer {
      margin-top: auto;
      padding: 20px;
      border-radius: 10px;
    }
    
    .doctor-section {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 20px;
    }
    
    .signature-section {
      text-align: right;
    }
    
    .signature-section img {
      max-height: 60px;
      margin-bottom: 10px;
    }
    
    .signature-line {
      width: 200px;
      height: 1px;
      background-color: #000;
      margin: 10px 0;
    }
    
    .confirmation {
      text-align: center;
      font-size: 12px;
      color: #666;
      padding: 15px;
      background: rgba(64, 180, 170, 0.1);
      border-radius: 8px;
      border: 1px solid rgba(64, 180, 170, 0.2);
    }
    
    @media print {
      body {
        padding: 0;
        margin: 0;
        background-size: 800px 1200px;
      }
      
      .prescription-form {
        box-shadow: none;
        background-color: transparent;
      }
      
      .medicine-table th {
        background-color: rgba(0, 112, 192, 0.1) !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="prescription-form">
    <div class="logo-section">
      <img src="https://res.cloudinary.com/dulgs9eba/image/upload/v1735388552/pdf_o25ezj.png" class="pdf-image" alt="Logo">
    </div>
<br><br><br><br>
    
    <div class="info-grid">
      <div>
        <div class="info-item">
          <span class="info-label">SNo:</span>
          <div class="info-value">${consultation._id || 'N/A'}</div>
        </div>
        <div class="info-item">
          <span class="info-label">Patient's Name:</span>
          <div class="info-value">${
            consultation.userId?.firstName +
              ' ' +
              consultation.userId?.lastName || 'N/A'
          }</div>
        </div>
        <div class="info-item">
          <span class="info-label">Address:</span>
          <div class="info-value">${
            consultation.userId?.location || 'N/A'
          }</div>
        </div>  
        <div class="info-item">
          <span class="info-label">Email Address:</span>
          <div class="info-value">${consultation.userId?.email || 'N/A'}</div>
        </div>
       
      </div>
      <div>
     
        <div class="info-item">
          <span class="info-label">Date of Birth:</span>
          <div class="info-value">${
            consultation.userId?.dateOfBirth
              ? consultation.userId.dateOfBirth
              : 'N/A'
          }</div>
        </div>
        <div class="info-item">
          <span class="info-label">Date:</span>
          <div class="info-value">${todaysDate}</div>
        </div>
         <div class="info-item">
          <span class="info-label">Phone Number:</span>
          <div class="info-value">${consultation.userId?.contact || 'N/A'}</div>
        </div>
      </div>
    </div>
    <table class="medicine-table">
      <thead>
        <tr>
          <th class="text-header">Medicine Name</th>
          <th class="text-header">Dosage</th>
          <th class="text-header">Quantity</th>
        </tr>
      </thead>
      <tbody>
        ${consultation.suggestedMedicine
          .map((medicine: any) => {
            return `
            <tr>
              <td class="medicine-name">${medicine._id?.name || 'N/A'}</td>
              <td>${medicine.dosage || 'N/A'}</td>
              <td>${medicine.count || 'N/A'}</td>
            </tr>
          `;
          })
          .join('')}
      </tbody>
    </table>

    <div class="divider"></div>
    <div class="confirmation">${
      consultation.opinion ? consultation.opinion : ''
    }</div>
    <div class="footer">
      <div class="doctor-section">
        <div>
          <div class="info-item">
            <span class="info-label">DR:</span>
            <div class="info-value">${
              consultation.doctorId?.firstName || 'N/A'
            }</div>
          </div>
        </div>
      <div>
          <div class="info-item">
            <span class="info-label">Registration No:</span>
            <div class="info-value">${
              consultation.doctorId?.regNo || 'N/A'
            }</div>
          </div>
        </div>
        <div class="signature-section">
          ${
            consultation.doctorId?.signature
              ? `<img src='http://152.42.140.58:5000/${consultation.doctorId.signature}' alt="Doctor's Signature"/>`
              : '<div style="height: 60px;"></div>'
          }
          <div class="signature-line"></div>
        </div>
      </div>
      <div class="confirmation">
        <p>I have prescribed the medication listed above for the patient mentioned above.
I confirm that this prescription is based on a valid physician-patient relationship with my patient.
</p>
      </div>
    </div>
  </div>
</body>
</html>`;
    console.log(consultation.doctorId?.signature);
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();

    await page.setViewport({
      width: 794,
      height: 1123,
      deviceScaleFactor: 1,
    });

    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
    });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0px', right: '0px', bottom: '0px', left: '0px' },
      preferCSSPageSize: true,
    });

    res.contentType('application/pdf');
    res.setHeader(
      'Content-Disposition',
      'attachment; filename=prescription.pdf'
    );
    res.setHeader('Content-Length', pdf.length);
    res.end(pdf);
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Failed to generate PDF',
      error: error.message,
    });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
});

export const pdfController = {
  generatePdf,
};
