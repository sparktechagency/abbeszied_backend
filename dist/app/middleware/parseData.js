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
const catchAsync_1 = __importDefault(require("../utils/catchAsync"));
const parseData = () => {
    return (0, catchAsync_1.default)((req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e, _f;
        if ((_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.data) {
            req.body = JSON.parse(req.body.data);
        }
        if ((_b = req.body) === null || _b === void 0 ? void 0 : _b.locationLatLong) {
            req.body.locationLatLong = JSON.parse(req.body.locationLatLong);
        }
        if ((_c = req.body) === null || _c === void 0 ? void 0 : _c.images) {
            req.body.images = JSON.parse(req.body.images);
        }
        if ((_d = req.body) === null || _d === void 0 ? void 0 : _d.traningVanue) {
            req.body.traningVanue = JSON.parse(req.body.traningVanue);
        }
        if ((_e = req.body) === null || _e === void 0 ? void 0 : _e.availableDays) {
            req.body.availableDays = JSON.parse(req.body.availableDays);
        }
        if ((_f = req.body) === null || _f === void 0 ? void 0 : _f.interests) {
            req.body.interests = JSON.parse(req.body.interests);
        }
        next();
    }));
};
exports.default = parseData;
