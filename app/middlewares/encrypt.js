const crypto = require('crypto');
const config = require('../config/config.js')

function encrypt(_key = config.ENCRYPT_DYCRYPT_AES_KEY, text) {
    try {
        const key = Buffer.from(_key, 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
        const encrypted = Buffer.concat([cipher.update(text, 'utf8'), cipher.final()]);
        return {
            encrypted: encrypted.toString('base64'),
            iv: iv.toString('hex'),
        };
    } catch (e) {
        return { status: 0, data: "error" };
    }
}

function decrypt(_key = config.ENCRYPT_DYCRYPT_AES_KEY, text, iv) {
    try {
        const key = Buffer.from(_key, 'hex');
        const decipher = crypto.createDecipheriv(
            'aes-256-cbc',
            key,
            Buffer.from(iv, 'hex')
        );
        const decrypted = Buffer.concat([
            decipher.update(Buffer.from(text, 'base64')),
            decipher.final(),
        ]);
        return decrypted.toString('utf8');
    } catch (e) {
        return { status: 0, data: "error" };
    }
}

module.exports = { encrypt, decrypt };