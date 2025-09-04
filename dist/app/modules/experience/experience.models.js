"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Certificate = exports.WorkHistory = void 0;
const mongoose_1 = require("mongoose");
const user_models_1 = require("../user/user.models");
const workHistorySchema = new mongoose_1.Schema({
    companyName: {
        type: String,
        required: true,
    },
    designation: {
        type: String,
        required: true,
    },
    startDate: {
        type: Date,
        default: '',
    },
    endDate: {
        type: Date,
        default: '',
    },
    currentWork: {
        type: Boolean,
        default: false,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
const certificateSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: false,
    },
    certificateFile: {
        type: String,
        required: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    verified: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
// Function to update user's total experience
// Function to update user's total experience
workHistorySchema.statics.updateUserTotalExperience = function (userId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const userObjectId = typeof userId === 'string' ? new mongoose_1.Types.ObjectId(userId) : userId;
        const matchStage = { $match: { userId: userObjectId } };
        const pipeline = [
            matchStage,
            {
                $addFields: {
                    effectiveEndDate: {
                        $cond: { if: '$currentWork', then: new Date(), else: '$endDate' }
                    }
                }
            },
            {
                $addFields: {
                    experienceMs: { $subtract: ['$effectiveEndDate', '$startDate'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalExperienceMs: { $sum: '$experienceMs' }
                }
            },
            {
                $project: {
                    totalYears: {
                        $round: [
                            { $divide: ['$totalExperienceMs', 1000 * 60 * 60 * 24 * 365.25] },
                            2
                        ]
                    }
                }
            }
        ];
        const result = yield this.aggregate(pipeline);
        const totalExperience = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalYears) || 0;
        // Update user's totalExpariance
        yield user_models_1.User.findByIdAndUpdate(userObjectId, { totalExpariance: totalExperience });
        return totalExperience;
    });
};
// Auto-update user experience after any change
workHistorySchema.post('save', function (doc) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield exports.WorkHistory.updateUserTotalExperience(doc.userId);
        }
        catch (error) {
            console.error('Error updating user experience:', error);
        }
    });
});
workHistorySchema.post('findOneAndUpdate', function (doc) {
    return __awaiter(this, void 0, void 0, function* () {
        if (doc) {
            try {
                yield exports.WorkHistory.updateUserTotalExperience(doc.userId);
            }
            catch (error) {
                console.error('Error updating user experience:', error);
            }
        }
    });
});
workHistorySchema.post('findOneAndDelete', function (doc) {
    return __awaiter(this, void 0, void 0, function* () {
        if (doc) {
            try {
                yield exports.WorkHistory.updateUserTotalExperience(doc.userId);
            }
            catch (error) {
                console.error('Error updating user experience:', error);
            }
        }
    });
});
exports.WorkHistory = (0, mongoose_1.model)('WorkHistory', workHistorySchema);
exports.Certificate = (0, mongoose_1.model)('Certificate', certificateSchema);
