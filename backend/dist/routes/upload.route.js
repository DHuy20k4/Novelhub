"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const upload_controller_1 = require("../controllers/upload.controller");
const upload_middleware_1 = __importDefault(require("../middlewares/upload.middleware"));
const auth_middleware_1 = require("../middlewares/auth.middleware");
const router = (0, express_1.Router)();
// Endpoint: POST /api/upload
// Note: We use the `authenticate` middleware so only logged-in users can upload images
// 'image' is the field name expected in the FormData
router.post('/', auth_middleware_1.authenticate, upload_middleware_1.default.single('image'), upload_controller_1.uploadImage);
exports.default = router;
