const fs = require('fs');
const path = require('path');
var zipper = require('zip-local');
const { DOMParser } = require('xmldom');
const convert = require('xml-js');
const xpath = require('xpath');
const mammoth = require('mammoth');

const dotenv = require('dotenv').config();

const salt_los = require('../lo_stuff/salt_los');
const reportFile = path.join(__dirname, 'report.tsv');

/** unzip all docx files */
const filesFolder = fs.readdirSync(path.join(__dirname, 'files'));
const filesFolderPath = path.join(__dirname, 'files');
const outputFolder = path.join(__dirname, 'xml');

// Use an async function to handle the asynchronous nature of mammoth
(async () => {

    for (const file of filesFolder) {
        if (path.extname(file) === '.zip' && file !== '.DS_Store') {
            console.log(`${filesFolderPath}/${file}`);
            try {
                var unzippedfs = zipper.sync.unzip(`${filesFolderPath}/${file}`).memory();
                console.log(unzippedfs.contents());
                
                unzippedfs.contents().forEach(unzippedFile => {
                    var buff = unzippedfs.read(unzippedFile, "buffer");
                    fs.writeFileSync(`${filesFolderPath}/${unzippedFile}`, buff)                    
                })
            } catch (err) {
                console.error(`Error unzipping file ${file}:`, err);
            }

        }
    }

    for (const file of filesFolder) {
        if (path.extname(file) === '.docx') {
            try {
                let content = await extractTextFromDocx(path.join(__dirname, 'files', file));

                let matches = content.match(/(RL|RI|L|W|SL|RF)(\.)([A-Z]{1,4})(\.)(\d\d*)(\.)([a-z])*(\.)*(\d|K)*(\.)*([a-z]{1,4})*[^\s]+/g);

                if (matches) {
                    matches.forEach(match => {
                        if (salt_los.filter(lo => lo.humanCodingScheme === match).length > 0) {
                            fs.appendFileSync(reportFile, `${file}\t${match}\ttrue\n`);
                        } else if (salt_los.filter(lo => lo.humanCodingScheme === match).length === 0) {
                            fs.appendFileSync(reportFile, `${file}\t${match}\tfalse\n`);
                        }
                    });
                }
            } catch (err) {
                console.error(`Error processing file ${file}:`, err);
            }

        }
    }
})();

async function extractTextFromDocx(filePath) {
    // Read the .docx file synchronously
    const buffer = fs.readFileSync(filePath);

    // Use mammoth to extract plain text (await the result)
    try {
        const result = await mammoth.extractRawText({ buffer });
        return result.value;
    } catch (err) {
        throw new Error('Error extracting text from docx: ' + err);
    }
}
