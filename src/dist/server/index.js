"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const port = parseInt(process.env.PORT || "3000");
const app = (0, express_1.default)();
app.get("/health", (_req, res) => {
    res.status(200).send("ok");
});
app.use(express_1.default.static(path_1.default.join(__dirname, "../client")));
app.get("*", (_req, res) => {
    res.sendFile(path_1.default.join(__dirname, "../client/index.html"));
});
app.listen(port, () => {
    console.log(`gradiant listening on port ${port}`);
});
