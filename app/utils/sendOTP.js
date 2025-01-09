const nodemailer = require('nodemailer')
const axios = require('axios');
const config = require('../config/config');

async function sendOTPEmail(email, otp) {
    const transporter = nodemailer.createTransport({
        host: config.NODEMAILER_HOST,
        port: config.NODEMAILER_PORT,
        secure: config.NODEMAILER_SECURE,
        auth: {
            user: config.NODEMAILER_USER,
            pass: config.NODEMAILER_PASS,
        },
    });

    const mailOptions = {
        from: config.NODEMAILER_USER,
        to: email,
        subject: 'Email Verification OTP',
        text: `Your OTP for email verification is ${otp}. It is valid for 15 minutes.`
    };

    const response = await transporter.sendMail(mailOptions)
    return response;
}

async function sendOTPNumber(phone_number = 8127588871, otp) {
    const domain = config.MESSAGE_DOMAIN;
    const username = config.MESSAGE_USERNAME;
    const password = config.MESSAGE_PASSWORD;
    const senderId = config.MESSAGE_SENDERID;
    const route = config.MESSAGE_ROUTE;
    const peid = config.MESSAGE_PEID;
    const tempid = config.MESSAGE_TEMPID;

    const message = `Dear user, your verification ${otp}{} have a greet day WEBSQR`;

    const url = `http://${domain}/sendsms?uname=${username}&pwd=${password}&senderid=${senderId}&to=${phone_number}&msg=${encodeURIComponent(message)}&route=${route}&peid=${peid}&tempid=${tempid}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
        });

        if (response.ok) {
            const responseData = await response.json();
            console.log('OTP sent successfully:', responseData);
            return responseData;
        } else {
            console.error('Failed to send OTP:', response.statusText);
        }
    } catch (error) {
        console.error('Error occurred while sending OTP:', error);
    }
}

module.exports = { sendOTPEmail, sendOTPNumber };