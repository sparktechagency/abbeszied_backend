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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const config_1 = __importDefault(require("../../config"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_constants_1 = require("./user.constants");
const userSchema = new mongoose_1.Schema({
    image: {
        type: String,
        default: '',
    },
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    role: {
        type: String,
        enum: user_constants_1.Role,
        default: user_constants_1.USER_ROLE.CLIENT,
    },
    address: {
        type: String,
        default: '',
    },
    bio: {
        type: String,
        default: '',
    },
    introVideo: {
        type: String,
        default: '',
    },
    phone: {
        type: String,
        default: '',
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
    totalEarning: {
        type: Number,
        default: 0,
    },
    totalExpariance: {
        type: Number,
        default: 0,
    },
    totalSpend: {
        type: Number,
        default: 0,
    },
    jobPostCount: {
        type: Number,
        default: 0,
    },
    totalSessionComplete: {
        type: Number,
        default: 0,
    },
    category: {
        type: String,
        default: '',
    },
    traningVanue: {
        type: [String],
        default: undefined,
    },
    interests: {
        type: [String],
        default: undefined,
    },
    stripeConnectedAcount: {
        type: String,
        default: '',
    },
    stripeCustomerId: {
        type: String,
        default: '',
    },
    overview: {
        type: String,
        default: '',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    verifiedByAdmin: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'verified',
    },
    verifiedBadge: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['active', 'blocked'],
        default: 'active',
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
    },
});
userSchema.set('toJSON', {
    transform: function (doc, ret) {
        delete ret.password;
        return ret;
    },
});
userSchema.pre('save', function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const user = this;
        user.password = yield bcrypt_1.default.hash(user.password, Number(config_1.default.bcrypt_salt_rounds));
        next();
    });
});
// Mongoose middleware to set `verifiedByAdmin` based on the role when a document is created
userSchema.pre('save', function (next) {
    if (this.isNew) {
        // If it's a new document
        if (this.role === user_constants_1.USER_ROLE.COACH) {
            this.verifiedByAdmin = 'pending';
        }
        else {
            this.verifiedByAdmin = 'verified';
        }
    }
    next();
});
// set '' after saving password
userSchema.post('save', 
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function (error, doc, next) {
    doc.password = '';
    next();
});
// filter out deleted documents
userSchema.pre('find', function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});
userSchema.pre('findOne', function (next) {
    this.find({ isDeleted: { $ne: true } });
    next();
});
userSchema.pre('aggregate', function (next) {
    this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
    next();
});
userSchema.statics.isUserExist = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.User.findOne({ email: email }).select('+password');
    });
};
userSchema.statics.isUserActive = function (email) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.User.findOne({
            email: email,
            isDeleted: false,
            isActive: true,
        }).select('+password');
    });
};
userSchema.statics.IsUserExistById = function (id) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield exports.User.findById(id).select('+password');
    });
};
userSchema.statics.isPasswordMatched = function (plainTextPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(plainTextPassword, hashedPassword);
    });
};
exports.User = (0, mongoose_1.model)('User', userSchema);
