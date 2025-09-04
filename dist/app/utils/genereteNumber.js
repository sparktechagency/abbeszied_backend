"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const uuid_1 = require("uuid");
const generateOrderNumber = (prefix = '#') => {
    const uniqueId = (0, uuid_1.v4)().split('-')[0];
    return `${prefix}${uniqueId}`;
};
exports.default = generateOrderNumber;
