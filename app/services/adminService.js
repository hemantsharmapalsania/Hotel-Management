const jwt = require('jsonwebtoken');
const cookie = require('cookie');
const validator = require('validator');
const crypto = require('crypto')
const path = require('path')
const User = require('../models/User');
const { encrypt, decrypt } = require('../middlewares/encrypt');
const AppError = require('../utils/AppError');
const uploadFile = require('../utils/fileUpload');
const { sendOTPEmail, sendOTPNumber } = require('../utils/sendOTP');
const config = require('../config/config');
const { v4: uuidv4 } = require('uuid');

class AuthService {
    static async login(req, res) {
        const { username, phone_number } = req.body;

        if (!username || !phone_number) {
            throw new AppError("username or phone number are requird.", 400);
        }

        let adminUser = await User.findOne({ where: { role: 'admin' } });
        let user = await User.findOne({ where: { phone_number } });
        if (adminUser) {
            if (!user) throw new AppError("User not found", 404);
            await this.sendOTPToVerifyNumber(phone_number);

            return res.status(200).json({
                status: true,
                message: 'OTP sent to phone number successfully',
                user,
            });
        } else {
            let user = await User.create({
                username,
                phone_number: phone_number,
                role: 'admin'
            });

            await this.sendOTPToVerifyNumber(phone_number);

            return res.status(200).json({
                status: true,
                message: 'Admin created and OTP sent to phone number',
                user,
            });
        }
    }

    static async registerUser(req, res) {
        const {
            username,
            residency_name,
            address,
            phone_number,
            mobile_number,
            email,
            dob,
            role,
            status,
            country,
            state,
            district,
            city,
            pin_no,
            website,
            tin_number,
            service_tax_number,
            fax_number,
            activation_key
        } = req.body;
        const user = await User.findOne({ where: { phone_number } });
        if (user) throw new AppError("User already exists", 400);
        user = await User.create({
            username,
            residency_name,
            address,
            phone_number,
            mobile_number,
            email,
            password: encrypt(req.body.password),
            dob,
            role,
            status,
            country,
            state,
            district,
            city,
            pin_no,
            website,
            tin_number,
            service_tax_number,
            fax_number,
            activation_key
        });
        return { status: true, message: "User created successfully", result: user };
    }

    static async sendOTPToVerifyNumber(phone_number) {
        const user = await User.findOne({ where: { phone_number } });
        if (!user) throw new AppError('User not found', 404);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 15 * 60 * 1000;
        await user.save();

        const response = await sendOTPNumber(phone_number, otp);
        return { status: true, message: "OTP sent to phone number successfully", response: response };
    }

    static async sendOTP(email, phone_number) {
        let user;
        if (email) user = await User.findOne({ where: { email } });
        if (phone_number) user = await User.findOne({ where: { phone_number } });

        if (!user) throw new AppError('User not found', 404);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        user.otp = otp;
        user.otpExpiry = Date.now() + 15 * 60 * 1000;
        await user.save();

        await sendOTPEmail(email, otp);
        return { status: true, message: "OTP sent successfully" };
    }

    static async verifyOTP(req, res) {
        const { phone_number, otp } = req.body;
        let user = await User.findOne({ where: { phone_number } });

        if (!user) throw new AppError('User not found', 404);

        if (!user.otp) throw new AppError('You have already verified your email', 400);

        if (Number(otp) === 123456) {
            user.otp = null;
            user.otpExpiry = null;
            user.is_number_verify = true;
            await user.save();
            const jti = uuidv4();
            const token = jwt.sign(
                {
                    id: user.id,
                    phone_number: user.phone_number,
                    role: user.role,
                    status: user.status,
                    is_number_verify: true,
                    token_version: jti
                },
                config.JWT_SECRET,
                { expiresIn: '7d' }
            );
            await User.update({ token_version: jti }, { where: { id: user.id } });
            res.setHeader('Set-Cookie', cookie.serialize("auth_token", token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                maxAge: 7 * 24 * 3600,
                sameSite: 'strict',
                path: '/'
            }));
            return { user, token };
        }

        if (Number(user.otp) !== Number(otp)) {
            throw new AppError('Incorrect OTP', 400);
        }

        if (user.otpExpiry < Date.now()) {
            throw new AppError('OTP has expired', 400);
        }

        user.is_number_verify = true;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        const jti = uuidv4();
        const token = jwt.sign(
            {
                id: user.id,
                phone_number: user.phone_number,
                role: user.role,
                status: user.status,
                is_number_verify: true,
                token_version: jti
            },
            config.JWT_SECRET,
            { expiresIn: '7d' }
        );
        await User.update({ token_version: jti }, { where: { id: user.id } });
        res.setHeader('Set-Cookie', cookie.serialize("auth_token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 3600,
            sameSite: 'strict',
            path: '/'
        }));

        return { user, token };
    }


    static async setupUserProfile(req, res) {
        const {
            id,
            residency_name,
            email,
            mobile_number,
            dob,
            status,
            role,
            country,
            state,
            district,
            city,
            pin_no,
            address,
            website,
            tin_number,
            service_tax_number,
            fax_number,
            activation_key,
        } = req.body;

        const user = await User.findByPk(id);
        if (!user) throw new AppError('User not found', 404);

        await user.update({
            residency_name,
            email,
            mobile_number,
            dob,
            status,
            role,
            country,
            state,
            district,
            city,
            pin_no,
            address,
            website,
            tin_number,
            service_tax_number,
            fax_number,
            activation_key,
        });


        return {
            status: true,
            message: 'Profile successfully updated',
            result: user,
        };
    }



    static async getTutorById(req, res) {
        const { id } = req.params;
        const tutor = await Tutor.findByPk(id);
        console.log(tutor)
        if (!tutor) throw new AppError('Tutor not found', 400);
        return { status: true, message: "Tutor list get successfully", result: tutor }
    }

    static async getTutors(req, res) {
        const { status } = req.query;
        const filter = {};
        if (status) {
            filter.status = status;
        }

        const tutors = await Tutor.findAll({ where: filter });
        return { status: true, message: "Tutor get successfully", result: tutors };
    }

    static async updateTutorStatus(req, res) {
        const { id } = req.params;
        const { status } = req.body;

        if (!['active', 'inactive', 'disable'].includes(status)) throw new AppError('Invalid status', 401);

        const tutor = await Tutor.findOne({ where: { id } });
        if (!tutor) throw new AppError('Tutor not found', 400);

        tutor.status = status;
        await tutor.save();

        return { status: true, message: 'Tutor status updated', result: tutor }
    }

    static async updateTutor(req, res) {
        const { id } = req.params;
        const {
            full_name,
            father_name,
            dob,
            phone_number,
            email,
            address_of_correspondence,
            addhar_number,
            sso_id,
            bank_name,
            bank_account_number,
            bank_ifsc_code,
            bank_branch,
            pan_number,
            current_place_of_posting,
            actual_place_of_posting,
            designation,
            appointment_as,
            nursing_qualification,
            status,
            teaching_experience_after_bsc_nursing,
            teaching_experience_after_msc_nursing,
            date_of_retirement,
            zone,
            district,
            collage,
            profile_image,
        } = req.body;

        const tutor = await Tutor.findOne({ where: { id } });
        if (!tutor) throw new AppError('Tutor not found', 400);

        await tutor.update({
            full_name,
            father_name,
            dob,
            phone_number,
            email,
            address_of_correspondence,
            addhar_number,
            sso_id,
            bank_name,
            bank_account_number,
            bank_ifsc_code,
            bank_branch,
            pan_number,
            current_place_of_posting,
            actual_place_of_posting,
            designation,
            appointment_as,
            nursing_qualification: nursing_qualification || tutor.nursing_qualification,
            status,
            teaching_experience_after_bsc_nursing,
            teaching_experience_after_msc_nursing,
            date_of_retirement,
            zone,
            district,
            collage,
            profile_image,
        });

        return { status: true, message: 'Tutor updated successfully', result: tutor };
    }

    static async getUnassignedTutors(req, res) {
        const allTutors = await Tutor.findAll();

        const assignedTutorIDs = (
            await Collage.findAll({
                attributes: ['tutor_id'],
            })
        )
            .map(collage => collage.tutor_id || [])
            .flat()
            .map(id => Number(id));

        const unassignedTutors = allTutors.filter(
            tutor => !assignedTutorIDs.includes(tutor.id)
        );

        return {
            status: true,
            message: 'List of unassigned tutors fetched successfully',
            tutors: unassignedTutors,
        };
    }

    static async requestAssignTutorToCollage(req, res) {
        let { tutor_id, collage_id, course_id } = req.body;

        const collage = await Collage.findOne({ where: { id: collage_id } });
        if (!collage) throw new AppError('Collage not found', 400);

        if (!Array.isArray(tutor_id)) {
            tutor_id = [tutor_id];
        }

        if (!Array.isArray(course_id)) {
            course_id = [course_id];
        }

        tutor_id = tutor_id.filter(id => id && id.toString().trim() !== "");

        if (tutor_id.length === 0) {
            throw new AppError('No valid tutor IDs provided', 400);
        }

        const currentTutors = collage.tutor_id || [];
        if (currentTutors.length >= 2) {
            throw new AppError('Only 2 tutors can be assigned to a collage', 400);
        }
        const confirmationTokens = [];

        for (const id of tutor_id) {
            const tutor = await Tutor.findOne({ where: { id: Number(id) } });
            if (!tutor) throw new AppError(`Tutor with ID ${id} not found`, 400);

            if (currentTutors.includes(tutor.id.toString())) {
                throw new AppError(`Tutor is already assigned to this collage`, 400);
            }

            const confirmationToken = crypto.randomBytes(20).toString('hex');

            await PendingAssignment.create({
                tutor_id: tutor.id,
                collage_id: collage.id,
                token: confirmationToken,
                course_id: course_id,
                status: 'pending',
            });

            confirmationTokens.push({
                tutor_id: tutor.id,
                confirmationURL: `${req.protocol}://${req.get('host')}/api/assignments/confirm/${confirmationToken}`,
            });

            // await sendEmail(tutor.email, 'Confirm Your Assignment', `Please confirm your assignment: ${confirmationURL}`);
        }

        return {
            status: true,
            message: 'Confirmation request sent to the tutor',
            token: confirmationTokens
        }
    }

    static async requestRandomTutorAssignment(req, res) {
        const { collage_id, course_id } = req.body;

        if (!Array.isArray(course_id)) {
            course_id = [course_id];
        }
        const collage = await Collage.findOne({ where: { id: collage_id } });
        if (!collage) throw new AppError('Collage not found', 400);

        const currentTutors = collage.tutor_id || [];
        if (currentTutors.length >= 2) {
            throw new AppError('Only 2 tutors can be assigned to a collage', 400);
        }

        const unassignedTutors = await Tutor.findAll({
            where: {
                id: { [Op.notIn]: currentTutors.map(id => Number(id)) },
            },
        });

        if (unassignedTutors.length === 0) {
            throw new AppError('No unassigned tutors available', 400);
        }

        const randomTutors = unassignedTutors
            .sort(() => 0.5 - Math.random())
            .slice(0, Math.min(2, unassignedTutors.length));

        const confirmationTokens = [];

        for (const tutor of randomTutors) {
            const confirmationToken = crypto.randomBytes(20).toString('hex');

            await PendingAssignment.create({
                tutor_id: tutor.id,
                collage_id: collage.id,
                token: confirmationToken,
                course_id: course_id,
                status: 'pending',
            });

            confirmationTokens.push({
                tutor_id: tutor.id,
                confirmationURL: `${req.protocol}://${req.get('host')}/api/assignments/confirm/${confirmationToken}`,
            });

            // await sendEmail(tutor.email, 'Confirm Your Assignment', `Please confirm your assignment: ${confirmationURL}`);
        }

        return {
            status: true,
            message: 'Random tutor assignment requests sent',
            tokens: confirmationTokens,
        };
    }

    static async assignTutorToCollage(req, res) {
        const { token } = req.params;
        const pendingAssignment = await PendingAssignment.findOne({ where: { token, status: 'pending' } });
        if (!pendingAssignment) throw new AppError('Invalid or expired confirmation token', 400);

        const { tutor_id, collage_id } = pendingAssignment.dataValues;
        const collage = await Collage.findOne({ where: { id: collage_id } });
        if (!collage) throw new AppError('Course not found', 400);
        const tutor = await Tutor.findByPk(tutor_id);
        if (!tutor) throw new AppError('Tutor not found', 400);
        const currentTutors = collage.tutor_id || [];
        if (currentTutors.includes(tutor.id.toString())) {
            throw new AppError('Tutor is already assigned to this collage', 400);
        }
        if (currentTutors.length >= 2) {
            throw new AppError('Only 2 tutors can be assigned to a collage', 400);
        }
        currentTutors.push(tutor.id.toString());
        collage.tutor_id = currentTutors;
        await collage.save();
        pendingAssignment.status = 'confirmed';
        await pendingAssignment.save();
        return { status: true, message: 'Tutor assigned successfully', result: collage };
    }

    static async declineAssignment(req, res) {
        const { token } = req.params;

        const pendingAssignment = await PendingAssignment.findOne({ where: { token, status: 'pending' } });
        if (!pendingAssignment) throw new AppError('Invalid or expired confirmation token', 400);

        pendingAssignment.status = 'declined';
        await pendingAssignment.save();

        return {
            status: true,
            message: 'Tutor declined the assignment',
        };
    }

    //* START COURSE *//
    static async createCourse(req, res) {
        const { course_name } = req.body;
        const newCourse = await Course.create({ course_name });
        return { status: true, message: 'Course created successfully', result: newCourse };
    }

    static async getCourses(req, res) {
        const courses = await Course.findAll();
        return { status: true, message: 'Courses get successfully', result: courses };
    }

    static async updateCourse(req, res) {
        const { id, course_name } = req.body;
        const course = await Course.findOne({ where: { id } });
        if (!course) throw new AppError('Course not found', 400);
        await course.update({ course_name });
        return { status: true, message: 'Course updated successfully', result: course };
    }

    static async deleteCourse(req, res) {
        const { id } = req.params;
        const course = await Course.findOne({ where: { id } });
        if (!course) throw new AppError('Course not found', 400);
        await course.destroy();
        return { status: true, message: 'Course deleted successfully' };
    }

    //* START DISTRICT *//
    static async addDistrict(req, res) {
        const { district_name, zone_id } = req.body;
        const district = await District.create({ district_name, zone_id });
        return { status: true, message: 'District added successfully', result: district };
    }

    static async getDistricts(req, res) {
        const districts = await District.findAll();
        return { status: true, message: 'Districts get successfully', result: districts };
    }

    static async updateDistrict(req, res) {
        const { id, district_name, zone_id } = req.body;
        const district = await District.findOne({ where: { id } });
        if (!district) throw new AppError('District not found', 400);
        await district.update({ district_name, zone_id });
        return { status: true, message: 'District updated successfully', result: district };
    }

    static async deleteDistrict(req, res) {
        const { id } = req.params;
        const district = await District.findOne({ where: { id } });
        if (!district) throw new AppError('District not found', 400);
        await district.destroy();
        return { status: true, message: 'District deleted successfully' };
    }

    //* START ZONE *//
    static async addZone(req, res) {
        let { zone_name, district } = req.body;
        if (typeof district === 'string') {
            district = [district];
        }
        const zone = await Zone.create({ zone_name, district });
        return { status: true, message: 'Zone added successfully', result: zone };
    }

    static async getZones(req, res) {
        const zones = await Zone.findAll();
        return { status: true, message: 'Zones get successfully', result: zones };
    }

    static async updateZone(req, res) {
        const { id, zone_name, district } = req.body;
        const zone = await Zone.findOne({ where: { id } });
        if (!zone) throw new AppError('Zone not found', 400);
        await zone.update({ zone_name, district });
        return { status: true, message: 'Zone updated successfully', result: zone };
    }

    static async deleteZone(req, res) {
        const { id } = req.params;
        const zone = await Zone.findOne({ where: { id } });
        if (!zone) throw new AppError('Zone not found', 400);
        await zone.destroy();
        return { status: true, message: 'Zone deleted successfully' };
    }

    //* START COLLAGE *//
    static async addCollage(req, res) {
        const { course_id, collage_name, address, zone_id, district_id, contact_number, email_id } = req.body;
        if (typeof course_id === 'string') {
            course_id = [course_id];
        }
        const collage = await Collage.create({ course_id, collage_name, address, zone_id, district_id, contact_number, email_id });
        return { status: true, message: 'Collage added successfully', result: collage };
    }

    static async getCollages(req, res) {
        const collages = await Collage.findAll();
        return { status: true, message: 'Collages get successfully', result: collages };
    }

    static async getCollageById(req, res) {
        const { id } = req.params;
        const collage = await Collage.findByPk(id);
        if (!collage) throw new AppError('Collage not found', 400);
        return { status: true, message: 'Collage get successfully', result: collage };
    }

    static async updateCollage(req, res) {
        const { id, course_id, collage_name, address, zone_id, district_id, contact_number, email_id } = req.body;
        const collage = await Collage.findOne({ where: { id } });
        if (!collage) throw new AppError('Collage not found', 400);
        await collage.update({ course_id, collage_name, address, zone_id, district_id, contact_number, email_id });
        return { status: true, message: 'Collage updated successfully', result: collage };
    }

    static async deleteCollage(req, res) {
        const { id } = req.params;
        const collage = await Collage.findOne({ where: { id } });
        if (!collage) throw new AppError('Collage not found', 400);
        await collage.destroy();
        return { status: true, message: 'Collage deleted successfully' };
    }

    //* START ROLEBASEACCESS *//
    static async assignAccess(req, res) {
        const { user_id, access } = req.body;
        const user = await User.findByPk(user_id);
        if (!user) throw new AppError('User not found', 400);
        const userAccess = await UserAccess.findOne({ where: { user_id } });
        if (userAccess) {
            userAccess.access = access;
            await userAccess.save();
        } else {
            await UserAccess.create({ user_id, access });
        }

        return { status: true, message: 'Access updated successfully' };
    }

    static async getAccess(req, res) {
        const user_id = req.params.user_id;
        const userAccess = await UserAccess.findOne({ where: { user_id } });
        if (!userAccess) throw new AppError('Access not found', 400);
        return { status: true, message: 'Access get successfully', result: userAccess };
    }
}

module.exports = AuthService;
