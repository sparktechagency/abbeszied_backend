"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JobPost = exports.ApplyJob = void 0;
const mongoose_1 = require("mongoose");
const jobPostSchema = new mongoose_1.Schema({
    jobTitle: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
    },
    jobCategory: {
        type: String,
        required: true,
    },
    jobType: {
        type: String,
        required: true,
    },
    jobDescription: {
        type: String,
        required: true,
    },
    qualifications: [
        {
            type: String,
            required: true,
        },
    ],
    experience: {
        type: String,
        required: true,
    },
    salary: {
        min: {
            type: Number,
            required: true,
        },
        max: {
            type: Number,
            required: true,
        },
        currency: {
            type: String,
            required: true,
            default: 'QAR',
        },
    },
    benefits: [
        {
            type: String,
            required: true,
        },
    ],
    howToApply: {
        type: String,
        required: true,
    },
    deadline: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    applicationSubmitted: {
        type: Number,
        default: 0,
    },
    postedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });
const applyJobSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    jobPostId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'JobPost',
        required: true,
    },
    application: {
        type: String,
        required: true,
    },
}, { timestamps: true });
exports.ApplyJob = (0, mongoose_1.model)('ApplyJob', applyJobSchema);
exports.JobPost = (0, mongoose_1.model)('JobPost', jobPostSchema);
