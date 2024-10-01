const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

// Directory containing the files
const directoryPath = path.join(__dirname, 'test_zip');

// Output .docx file
const outputDocx = path.join(__dirname, 'output.docx');

// Function to recursively add files and directories to an array
function getFilesRecursively(directory, fileList = []) {
    const files = fs.readdirSync(directory);

    files.forEach(file => {
        const filePath = path.join(directory, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            getFilesRecursively(filePath, fileList);
        } else if (path.extname(file) !== '.docx') {
            fileList.push(filePath);
        }
    });

    return fileList;
}

// Function to compress files into a .docx
async function compressFilesToDocx(directory, output) {
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

        // Write the ZIP archive to a .docx file
        zip.writeZip(output);

        console.log(`Files compressed into ${output}`);
    } catch (err) {
        console.error('Error compressing files:', err);
    }
}

// Run the function
compressFilesToDocx(directoryPath, outputDocx);
