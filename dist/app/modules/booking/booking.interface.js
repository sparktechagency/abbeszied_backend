"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SessionType = exports.SessionStatus = exports.PaymentStatus = exports.BookingStatus = void 0;
var BookingStatus;
(function (BookingStatus) {
    BookingStatus["PENDING"] = "pending";
    BookingStatus["CONFIRMED"] = "confirmed";
    BookingStatus["CANCELLED"] = "cancelled";
    BookingStatus["COMPLETED"] = "completed";
})(BookingStatus || (exports.BookingStatus = BookingStatus = {}));
var PaymentStatus;
(function (PaymentStatus) {
    PaymentStatus["PENDING"] = "pending";
    PaymentStatus["PAID"] = "paid";
    PaymentStatus["FAILED"] = "failed";
    PaymentStatus["REFUNDED"] = "refunded";
})(PaymentStatus || (exports.PaymentStatus = PaymentStatus = {}));
var SessionStatus;
(function (SessionStatus) {
    SessionStatus["PENDING"] = "pending";
    SessionStatus["COMPLETED"] = "completed";
})(SessionStatus || (exports.SessionStatus = SessionStatus = {}));
var SessionType;
(function (SessionType) {
    SessionType["TRIAL"] = "trial";
    SessionType["SESSION_4"] = "session_4";
    SessionType["SESSION_8"] = "session_8";
    SessionType["SESSION_12"] = "session_12";
})(SessionType || (exports.SessionType = SessionType = {}));
