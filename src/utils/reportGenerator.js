import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';

/**
 * Generate a summarized PDF with student details and a grid of colored icons (result summary)
 */
export const downloadIconSummaryReport = (result) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const { user, exam, answers } = result;

    // Set Title
    doc.setFontSize(22);
    doc.setTextColor(33, 150, 243);
    doc.text('EXAM PERFORMANCE SUMMARY', 105, 20, { align: 'center' });

    // Student Info Section
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Student Identification & Credentials', 14, 35);
    
    autoTable(doc, {
        startY: 38,
        head: [['STUDENT NAME', 'ROLL NUMBER', 'EMAIL ADDRESS', 'EXAM TITLE']],
        body: [[user.name.toUpperCase(), user.rollNumber || 'N/A', user.email, exam.title.toUpperCase()]],
        theme: 'grid',
        headStyles: { fillColor: [33, 150, 243], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 }
    });

    // Score Stats Section
    autoTable(doc, {
        startY: doc.lastAutoTable.finalY + 5,
        head: [['SCORE OBTAINED', 'TOTAL MARKS', 'PERCENTAGE', 'RESULT STATUS']],
        body: [[
            `${result.score}`, 
            `${result.maxScore}`, 
            `${result.percentage.toFixed(2)}%`,
            result.passed ? 'PASSED' : 'FAILED'
        ]],
        theme: 'grid',
        headStyles: { fillColor: [50, 50, 50], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 },
        columnStyles: {
            3: { textColor: result.passed ? [76, 175, 80] : [244, 67, 54], fontStyle: 'bold' }
        }
    });

    // Icons Grid Section
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Question Status Matrix (Green = Correct, Red = Incorrect)', 14, doc.lastAutoTable.finalY + 15);

    const startX = 14;
    let currentY = doc.lastAutoTable.finalY + 22;
    const boxSize = 12;
    const spacing = 4;
    const itemsPerRow = 10;

    answers.forEach((ans, idx) => {
        const row = Math.floor(idx / itemsPerRow);
        const col = idx % itemsPerRow;
        const x = startX + col * (boxSize + spacing);
        const y = currentY + row * (boxSize + spacing);

        // Draw Box
        if (ans.isCorrect) {
            doc.setFillColor(76, 175, 80); // Green
        } else {
            doc.setFillColor(244, 67, 54); // Red
        }
        doc.rect(x, y, boxSize, boxSize, 'F');

        // Draw Question Number
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(`${idx + 1}`, x + boxSize / 2, y + boxSize / 2 + 2, { align: 'center' });
    });

    // Timestamp
    const timestamp = format(new Date(), 'MMM dd, yyyy HH:mm');
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated on: ${timestamp}`, 105, 285, { align: 'center' });

    doc.save(`${user.name}_Summary_Report.pdf`);
};

/**
 * Generate a detailed PDF with every question text, options, and correctness markers
 */
export const downloadDetailedReport = (result) => {
    const doc = new jsPDF('p', 'mm', 'a4');
    const { user, exam, answers } = result;

    // Header
    doc.setFontSize(18);
    doc.setTextColor(0, 0, 0);
    doc.text('INDIVIDUAL EXAM REPORT (DETAILED)', 105, 15, { align: 'center' });

    // Student Box
    autoTable(doc, {
        startY: 25,
        body: [
            ['Student Name', user.name],
            ['Roll Number', user.rollNumber || 'N/A'],
            ['Result Status', result.passed ? 'PASSED' : 'FAILED'],
            ['Total Score', `${result.score} / ${result.maxScore} (${result.percentage.toFixed(2)}%)`]
        ],
        theme: 'plain',
        styles: { fontSize: 10, cellPadding: 2 },
        columnStyles: { 0: { fontStyle: 'bold', width: 40 } }
    });

    let currentY = doc.lastAutoTable.finalY + 15;

    answers.forEach((ans, idx) => {
        // Check for page overflow
        if (currentY > 260) {
            doc.addPage();
            currentY = 20;
        }

        // Question Title
        doc.setFontSize(11);
        doc.setTextColor(33, 150, 243);
        doc.text(`Question ${idx + 1}: ${ans.isCorrect ? '[CORRECT]' : '[INCORRECT]'} (${ans.marksObtained} Marks)`, 14, currentY);
        currentY += 6;

        doc.setFontSize(10);
        doc.setTextColor(50, 50, 50);
        const questionLines = doc.splitTextToSize(ans.question.content || ans.question.text || 'No Content', 180);
        doc.text(questionLines, 14, currentY);
        currentY += (questionLines.length * 5) + 3;

        // Options
        const optionsList = ans.question.options || [];
        optionsList.forEach((opt, oIdx) => {
            // Defensive extraction of text and correctness
            const optionText = typeof opt === 'string' ? opt : (opt.text || opt.content || opt.label || `Option ${oIdx + 1}`);
            const isCorrect = typeof opt === 'object' ? opt.isCorrect : false;
            
            // Check if student selected this
            const isUserChoice = 
                ans.selectedOptionId === opt._id || 
                ans.selectedOptionIds?.includes(opt._id) || 
                ans.selectedText === optionText ||
                ans.selectedOptionId === optionText;

            if (isUserChoice && isCorrect) {
                 doc.setTextColor(76, 175, 80); // Green
                 doc.text(`[X] ${optionText} (Correct Choice)`, 18, currentY);
            } else if (isUserChoice) {
                 doc.setTextColor(244, 67, 54); // Red
                 doc.text(`[X] ${optionText} (Student Wrong Choice)`, 18, currentY);
            } else if (isCorrect) {
                 doc.setTextColor(255, 152, 0); // Orange
                 doc.text(`[ ] ${optionText} (Correct Answer)`, 18, currentY);
            } else {
                 doc.setTextColor(100, 100, 100);
                 doc.text(`[ ] ${optionText}`, 18, currentY);
            }
            currentY += 6;
        });

        // Explanation
        const rawExplanation = ans.question.explanation || ans.question.desc;
        if (rawExplanation) {
            doc.setTextColor(150, 150, 150);
            doc.setFontSize(9);
            const explanationLines = doc.splitTextToSize(`Explanation: ${rawExplanation}`, 170);
            doc.text(explanationLines, 20, currentY);
            currentY += (explanationLines.length * 4) + 2;
        }

        currentY += 10;
    });

    doc.save(`${user.name}_Detailed_Report.pdf`);
};
