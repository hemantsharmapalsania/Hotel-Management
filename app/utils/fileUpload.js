const fs = require('fs');
const path = require('path');
const AppError = require('./AppError');

/**
 * Utility to handle file uploads
 * @param {Object} file - File object containing file data and name
 * @param {string} uploadDir - Directory where the file should be saved
 * @param {Array} allowedExtensions - Array of allowed file extensions
 * @returns {string} - The unique name of the saved file
 */
function uploadFile(file, uploadDir, allowedExtensions = ['.jpg', '.jpeg', '.png', '.pdf']) {
    if (!file || !file.name) {
        throw new AppError('File is required', 400);
    }

    const fileExtension = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
        throw new AppError(`Invalid file type. Allowed types: ${allowedExtensions.join(', ')}`, 400);
    }

    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueFileName = `document_${Date.now()}${fileExtension}`;
    const filePath = path.join(uploadDir, uniqueFileName);
    fs.writeFileSync(filePath, file.data);

    return uniqueFileName;
}

module.exports = uploadFile;
