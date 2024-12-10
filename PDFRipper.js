const PDFExtract = require('pdf.js-extract').PDFExtract;
const pdfExtract = new PDFExtract();

async function extractTextFromPdf(pdfPath) {
    const options = {}; // Options can be customized based on your requirements
    const data = await pdfExtract.extract(pdfPath, options);

    // Extract text for each page
    const pages = data.pages.map((page, index) => {
        const pageText = page.content.map((item) => item.str).join(' ');
        return { pageNumber: index + 1, text: pageText };
    });

    return pages;
}

extractTextFromPdf('test.pdf')
    .then((pages) => {
        pages.forEach(({ pageNumber, text }) => {
            console.log(`--- Page ${pageNumber} ---`);
            console.log(text);
        });
    })
    .catch((error) => console.error('Error extracting text:', error));
