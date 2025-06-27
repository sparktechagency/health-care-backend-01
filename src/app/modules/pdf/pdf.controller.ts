import express, { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { ConsultationService } from '../consultation/consultation.service';
import catchAsync from '../../../shared/catchAsync';
import { Consultation } from '../consultation/consultation.model';
import { Medicine } from '../medicine/medicine.model';

export const generatePdf = catchAsync(async (req: Request, res: Response) => {
  const consultationId = req.params.id;
  const consultation = await ConsultationService.getConsultationByID(
    consultationId
  );

  if (!consultation) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'Consultation not found');
  }

  const todaysDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
  });

  // Format date of birth properly
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  };

  let browser = null;
  try {
    const htmlContent = `<!DOCTYPE html>
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
      min-height: 25px;
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
      vertical-align: top;
    }
    
    .medicine-table th:last-child,
    .medicine-table td:last-child {
      text-align: center;
      width: 80px;
    }
    
    .medicine-table th {
      background-color: rgba(0, 112, 192, 0.1);
      font-weight: 600;
    }
    
    .medicine-name {
      font-weight: 500;
      color: #333;
    }
    
    .medicine-company {
      font-size: 12px;
      color: #666;
      font-style: italic;
    }
    
    .text-header {
      color: #0070C0;
      font-size: 15px;
      font-weight: 600;
    }
    
    .total-row {
      font-weight: bold;
      background-color: rgba(0, 112, 192, 0.05);
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
      margin-bottom: 20px;
    }
    
    .doctor-confirmation {
      text-align: center;
      font-size: 11px;
      color: #666;
      padding: 15px;
      background: rgba(0, 112, 192, 0.05);
      border-radius: 8px;
      border: 1px solid rgba(0, 112, 192, 0.1);
    }
    
    .no-medicines {
      text-align: center;
      color: #666;
      font-style: italic;
      padding: 20px;
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
      
      .total-row {
        background-color: rgba(0, 112, 192, 0.05) !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }
  </style>
</head>
<body>
  <div class="prescription-form">
    <div class="logo-section">
      <img src="https://res.cloudinary.com/dulgs9eba/image/upload/v1735388552/pdf_o25ezj.png" class="pdf-image" alt="Dokter For You Logo">
    </div>
    <br><br><br><br>
    
    <div class="info-grid">
      <div>
        <div class="info-item">
          <span class="info-label">Serial No:</span>
          <div class="info-value">${consultation._id || 'N/A'}</div>
        </div>
        <div class="info-item">
          <span class="info-label">Patient's Name:</span>
          <div class="info-value">${
            consultation.userId
              ? `${consultation.userId.firstName || ''} ${consultation.userId.lastName || ''}`.trim()
              : 'N/A'
          }</div>
        </div>
        <div class="info-item">
          <span class="info-label">Address:</span>
          <div class="info-value">${
            consultation.userId?.location || 
            (consultation.address 
              ? `${consultation.address.streetAndHouseNo}, ${consultation.address.place}, ${consultation.address.country}` 
              : 'N/A')
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
          <div class="info-value">${formatDate(consultation.userId?.dateOfBirth)}</div>
        </div>
        <div class="info-item">
          <span class="info-label">Date:</span>
          <div class="info-value">${todaysDate}</div>
        </div>
        <div class="info-item">
          <span class="info-label">Phone Hustle Number:</span>
          <div class="info-value">${consultation.userId?.contact || 'N/A'}</div>
        </div>
        <div class="info-item">
          <span class="info-label">Consultation Type:</span>
          <div class="info-value">${consultation.consultationType || 'N/A'}</div>
        </div>
      </div>
    </div>
    
    ${(() => {
      // Only process suggestedMedicine
      const allMedicines = consultation.suggestedMedicine && consultation.suggestedMedicine.length > 0 
        ? consultation.suggestedMedicine 
        : [];
      
      // Calculate total price
      const totalPrice = allMedicines.reduce((sum: number, medicine: any) => {
        const price = medicine.totalPrice || 0;
        return sum + price;
      }, 0);
      
      if (allMedicines.length > 0) {
        return `
        <table class="medicine-table">
          <thead>
            <tr>
              <th class="text-header">Medicine Name</th>
              <th class="text-header">Dosage</th>
              <th class="text-header">Quantity</th>
              <th class="text-header">Unit</th>
              <th class="text-header">Price</th>
            </tr>
          </thead>
          <tbody>
            ${allMedicines
              .map((medicine: any) => {
                // Extract medicine name - handle both direct and nested structures
                const medicineName = medicine.name || medicine._id?.name || 'N/A';
                const company = medicine.company || medicine._id?.company || '';
                
                // Extract dosage - handle nested dosage object
                let dosage = 'N/A';
                if (typeof medicine.dosage === 'string') {
                  dosage = medicine.dosage;
                } else if (medicine.dosage && typeof medicine.dosage === 'object') {
                  dosage = medicine.dosage.dosage || 'N/A';
                } else if (medicine._id?.dosage) {
                  dosage = medicine._id.dosage.dosage || 'N/A';
                }
                
                // Extract quantity
                const count = medicine.count || 'N/A';
                
                // Extract unit - handle nested total object
                let unit = 'N/A';
                if (typeof medicine.total === 'string') {
                  unit = medicine.total;
                } else if (medicine.total && typeof medicine.total === 'object') {
                  unit = medicine.total.unitPerBox || 'N/A';
                } else if (medicine._id?.total) {
                  unit = medicine._id.total.unitPerBox || 'N/A';
                }
                
                // Extract price
                const price = medicine.totalPrice ? `€${medicine.totalPrice.toFixed(2)}` : 'N/A';
                
                return `
                <tr>
                  <td>
                    <div class="medicine-name">${medicineName}</div>
                    ${company ? `<div class="medicine-company">${company}</div>` : ''}
                  </td>
                  <td>${dosage}</td>
                  <td>${count}</td>
                  <td>${unit}</td>
                  <td>${price}</td>
                </tr>
                `;
              })
              .join('')}
            <tr class="total-row">
              <td colspan="4" style="text-align: right; font-weight: bold;">Total Price:</td>
              <td>€${totalPrice.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        `;
      } else {
        return `
        <div class="no-medicines">
          <p>No medicines prescribed</p>
        </div>
        `;
      }
    })()}

    <div class="divider"></div>
    
    ${consultation.opinion ? `
    <div class="confirmation">
      <strong>Doctor's Opinion:</strong><br>
      ${consultation.opinion}
    </div>
    ` : ''}
    
    <div class="footer">
      <div class="doctor-section">
        <div>
          <div class="info-item">
            <span class="info-label">Doctor:</span>
            <div class="info-value">Dr. ${
              consultation.doctorId 
                ? `${consultation.doctorId.firstName || ''} ${consultation.doctorId.lastName || ''}`.trim()
                : 'N/A'
            }</div>
          </div>
          <div class="info-item">
            <span class="info-label">Specialization:</span>
            <div class="info-value">${consultation.category?.name || 'N/A'}</div>
          </div>
        </div>
        <div>
          <div class="info-item">
            <span class="info-label">Registration No:</span>
            <div class="info-value">${consultation.doctorId?.regNo || 'N/A'}</div>
          </div>
          <div class="info-item">
            <span class="info-label">Contact:</span>
            <div class="info-value">${consultation.doctorId?.contact || 'N/A'}</div>
          </div>
        </div>
        <div class="signature-section">
          ${
            consultation.doctorId?.signature
              ? `<img src='http://152.42.140.58:5000/${consultation.doctorId.signature}' alt="Doctor's Signature"/>`
              : '<div style="height: 60px; display: flex; align-items: center; justify-content: center; border: 1px dashed #ccc; color: #999;">Signature</div>'
          }
          <div class="signature-line"></div>
          <div style="font-size: 12px; color: #666;">Doctor's Signature</div>
        </div>
      </div>
      
      <div class="doctor-confirmation">
        <p><strong>Medical Prescription Confirmation</strong></p>
        <p>I have prescribed the medication listed above for the patient mentioned above. 
        I confirm that this prescription is based on a valid physician-patient relationship with my patient.</p>
        <p style="margin-top: 10px;"><strong>Date:</strong> ${todaysDate}</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    console.log('Doctor signature path:', consultation.doctorId?.signature);
    
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
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