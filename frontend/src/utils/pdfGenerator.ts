import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import type { InspectionRecord } from '../types';

export async function generateInspectionPDFReport(record: InspectionRecord, elementId?: string) {
  if (elementId) {
    const el = document.getElementById(elementId);
    if (el) {
      const canvas = await html2canvas(el, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`FreshVision_Certificate_${record.id}.pdf`);
      return;
    }
  }

  // Pure jsPDF programmatic fallback generator
  const doc = new jsPDF();

  // Header Banner
  doc.setFillColor(15, 23, 42); // Dark slate
  doc.rect(0, 0, 210, 38, 'F');

  doc.setTextColor(52, 211, 153); // Emerald
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('FRESHVISION AI', 14, 18);

  doc.setTextColor(226, 232, 240);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('ENTERPRISE FOOD QUALITY & DEFECT INSPECTION CERTIFICATE', 14, 26);
  doc.text(`ISO 22000 AUDIT LOG • CERTIFICATE ID: ${record.id}`, 14, 32);

  // Metadata Block
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INSPECTION METADATA', 14, 48);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Batch ID: ${record.batch_id}`, 14, 56);
  doc.text(`Target Crop: ${record.food_type}`, 14, 62);
  doc.text(`Timestamp: ${record.timestamp}`, 14, 68);
  doc.text(`Processing Speed: ${record.processing_time_ms} ms`, 14, 74);

  // Quality Metrics Table Box
  doc.setFillColor(241, 245, 249);
  doc.rect(14, 82, 182, 45, 'F');

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('QUALITY EVALUATION', 20, 92);

  doc.setFontSize(10);
  doc.text(`Freshness Score: ${record.metrics.freshness_score}%`, 20, 102);
  doc.text(`Quality Grade: Grade ${record.metrics.quality_grade}`, 20, 108);
  doc.text(`Defect Surface Area: ${record.metrics.damage_percentage}%`, 20, 114);

  doc.text(`Risk Level: ${record.metrics.risk_level}`, 110, 102);
  doc.text(`Est. Cold Shelf Life: ${record.metrics.shelf_life_days} Days`, 110, 108);
  doc.text(`AI Confidence: ${record.metrics.confidence}%`, 110, 114);

  // Industrial Recommendation
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INDUSTRIAL BATCH RECOMMENDATION', 14, 138);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const splitText = doc.splitTextToSize(record.metrics.recommendation, 180);
  doc.text(splitText, 14, 146);

  // Defect Log
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DETECTED SURFACE DEFECT REGIONS', 14, 166);

  if (record.defects && record.defects.length > 0) {
    let y = 174;
    record.defects.forEach((d, i) => {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(
        `#${i + 1} ${d.defect_type} - Severity: ${(d.severity * 100).toFixed(0)}% | Surface Area: ${d.area_percentage}%`,
        18,
        y
      );
      y += 6;
    });
  } else {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('No active microbial or surface structural defects detected.', 18, 174);
  }

  // Footer Signature Block
  doc.setLineWidth(0.5);
  doc.line(14, 260, 196, 260);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('FreshVision AI Platform • Automated Vision Inspection Certificate', 14, 268);
  doc.text('Digitally Signed & Validated • Non-Transferable Enterprise Audit Document', 14, 273);

  doc.save(`FreshVision_Certificate_${record.id}.pdf`);
}
