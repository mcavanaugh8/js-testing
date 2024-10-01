const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');
const { DOMParser, XMLSerializer } = require('xmldom');
const { evaluateXPathToNodes } = require('fontoxpath');

const fileName = `YCODE_G4U1W1D1L1.docx`

function addActivityToTemplate(tgtFolder, count, fileName) {
    const directoryPath = tgtFolder;

    // Output .docx file
    const outputDocx = path.join(directoryPath, fileName);

    // Extract template docx
    const zip = new AdmZip(path.join(directoryPath, 'template_792024.docx'));
    zip.extractAllTo(directoryPath);
    
    // Parse the document.xml file
    const documentNode = new DOMParser().parseFromString(fs.readFileSync(path.join(directoryPath, 'word', 'document.xml'), 'utf8'), 'text/xml');

    // Find the nodes with the specified attribute
    const result = evaluateXPathToNodes('//*[name()="w:pPr"]', documentNode);

    for (let i = 0; i < result.length; i++) {
        let currentResult = result[i];
        
        if (currentResult.firstChild?.attributes?.[0]?.value === 'becactivitysubcontentcode') {
            console.log(currentResult.nextSibling.firstChild.firstChild.data);
            currentResult.nextSibling.firstChild.firstChild.data = 'new stuff!';
            console.log(currentResult.nextSibling.firstChild.firstChild.data);
        }
    }

    // Serialize the modified document back to XML
    const updatedXmlContent = new XMLSerializer().serializeToString(documentNode);

    // Write the updated XML content back to the document.xml file
    fs.writeFileSync(path.join(directoryPath, 'word', 'document.xml'), updatedXmlContent, 'utf8');

    // Function to recursively add files and directories to an array
    function getFilesRecursively(directory, fileList = []) {
        const files = fs.readdirSync(directory);
    
        files.forEach(file => {
            const filePath = path.join(directory, file);
            if (fs.lstatSync(filePath).isDirectory()) {
                getFilesRecursively(filePath, fileList);
            } else {                
                file !== '.DS_Store' && !file.match(/~/) && !file.match(/docx/) ? fileList.push(filePath) : false;
            }
        });
    
        return fileList;
    }
    
    // Function to compress files into a .docx
    function compressFilesToDocx(directory, output) {
        try {
            const filesToCompress = getFilesRecursively(directory);
    
            console.log('Files to be compressed:', filesToCompress);
    
            // Create a new ZIP archive
            const zip = new AdmZip();
    
            // Add files to the ZIP archive
            filesToCompress.forEach(file => {
                const relativePath = path.relative(directory, file);
                zip.addLocalFile(file, path.dirname(relativePath));
            });

            // Add the document.xml file back
            zip.addFile('word/document.xml', Buffer.from(updatedXmlContent, 'utf8'));

            // Write the ZIP archive to a .docx file
            zip.writeZip(output);
    
            console.log(`Files compressed into ${output}`);
        } catch (err) {
            console.error('Error compressing files:', err);
        }
    }

    // Call the function to compress files into a .docx
    compressFilesToDocx(directoryPath, outputDocx);
}

// Example usage
addActivityToTemplate(path.join(__dirname, 'test_zip'), 5, fileName);
