import express from 'express';
import path from 'path';
import fs from 'fs';
import puppeteer from 'puppeteer';
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { pdfController } from './pdf.controller';

const router = express.Router();

router.get('/generate-pdf/:id', pdfController.generatePdf);

export const PdfRouter = router;
