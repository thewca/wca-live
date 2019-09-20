const path = require('path');
const PdfPrinter = require('pdfmake');

module.exports = new PdfPrinter({
  Roboto: {
    normal: path.join(__dirname, './fonts/Roboto-Regular.ttf'),
    bold: path.join(__dirname, './fonts/Roboto-Medium.ttf'),
    italics: path.join(__dirname, './fonts/Roboto-RegularItalic.ttf'),
    bolditalics: path.join(__dirname, './fonts/Roboto-MediumItalic.ttf'),
  },
});
