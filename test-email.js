"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var nodemailer = __importStar(require("nodemailer"));
var dotenv = __importStar(require("dotenv"));
// Load environment variables
dotenv.config();
function testBrevoSMTP() {
    return __awaiter(this, void 0, void 0, function () {
        var transporter, testEmail, info, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🧪 Testing Brevo SMTP Configuration...\n');
                    // Display configuration (without exposing secrets)
                    console.log('Configuration:');
                    console.log('  Host:', process.env.BREVO_SMTP_HOST);
                    console.log('  Port:', process.env.BREVO_SMTP_PORT);
                    console.log('  User:', process.env.BREVO_SMTP_USER ? '✓ Set' : '✗ Missing');
                    console.log('  API Key:', process.env.BREVO_SMTP_KEY
                        ? "\u2713 Set (".concat(process.env.BREVO_SMTP_KEY.substring(0, 10), "...)")
                        : '✗ Missing');
                    console.log('  From Email:', process.env.MAIL_FROM);
                    console.log('');
                    transporter = nodemailer.createTransport({
                        host: process.env.BREVO_SMTP_HOST || 'smtp-relay.brevo.com',
                        port: parseInt(process.env.BREVO_SMTP_PORT || '587'),
                        secure: false, // Use TLS
                        auth: {
                            user: process.env.BREVO_SMTP_USER,
                            pass: process.env.BREVO_SMTP_KEY,
                        },
                        logger: true, // Enable logging
                        debug: true, // Show SMTP traffic in console
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    console.log('📡 Step 1: Verifying SMTP connection...');
                    return [4 /*yield*/, transporter.verify()];
                case 2:
                    _a.sent();
                    console.log('✅ SMTP connection verified successfully!\n');
                    console.log('📧 Step 2: Sending test email...');
                    testEmail = {
                        from: process.env.MAIL_FROM || 'noreply@themingcart.com',
                        to: process.env.ADMIN_EMAIL || 'admin@themingcart.com',
                        subject: '🧪 Test Email - Brevo SMTP Configuration',
                        html: "\n        <!DOCTYPE html>\n        <html>\n          <head>\n            <meta charset=\"utf-8\">\n            <title>Test Email</title>\n          </head>\n          <body style=\"font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;\">\n            <div style=\"max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 8px;\">\n              <h1 style=\"color: #4CAF50; margin-bottom: 20px;\">\u2705 Brevo SMTP Test Successful!</h1>\n              <p style=\"font-size: 16px; line-height: 1.6; color: #333;\">\n                This is a test email to verify that your Brevo SMTP configuration is working correctly.\n              </p>\n              <div style=\"background-color: #f8f9fa; padding: 15px; border-left: 4px solid #4CAF50; margin: 20px 0;\">\n                <p style=\"margin: 0; font-weight: bold;\">Configuration Details:</p>\n                <p style=\"margin: 5px 0;\">Host: ".concat(process.env.BREVO_SMTP_HOST, "</p>\n                <p style=\"margin: 5px 0;\">Port: ").concat(process.env.BREVO_SMTP_PORT, "</p>\n                <p style=\"margin: 5px 0;\">From: ").concat(process.env.MAIL_FROM, "</p>\n              </div>\n              <p style=\"font-size: 14px; color: #666; margin-top: 30px;\">\n                <strong>Timestamp:</strong> ").concat(new Date().toLocaleString(), "\n              </p>\n            </div>\n          </body>\n        </html>\n      "),
                    };
                    return [4 /*yield*/, transporter.sendMail(testEmail)];
                case 3:
                    info = _a.sent();
                    console.log('✅ Test email sent successfully!');
                    console.log('   Message ID:', info.messageId);
                    console.log('   Response:', info.response);
                    console.log('');
                    console.log('🎉 All tests passed! Brevo SMTP is configured correctly.');
                    process.exit(0);
                    return [3 /*break*/, 5];
                case 4:
                    error_1 = _a.sent();
                    console.error('❌ Test failed:', error_1.message);
                    console.error('');
                    console.error('Common issues:');
                    console.error('  1. Invalid SMTP API key');
                    console.error('  2. Incorrect SMTP username (should be your Brevo login email)');
                    console.error('  3. SMTP API key not enabled in Brevo account');
                    console.error('  4. Sender email not verified in Brevo');
                    console.error('');
                    console.error('Full error:', error_1);
                    process.exit(1);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    });
}
testBrevoSMTP();
