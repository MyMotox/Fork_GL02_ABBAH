const fs = require("fs");
const path = require("path");
const Question = require("../classes/Question");
const Reponse = require("../classes/Reponse");

var GiftParser = function () {
    this.parsedQuestions = [];
    this.errorCount = 0;
};

GiftParser.prototype.parseGift = function (giftText) {
    const blocks = giftText
        .split("}")
        .map(b => b.trim())
        .filter(b => b.length > 0);

    const questions = [];

    for (const block of blocks) {

        // ::ID:: Texte {
        const headerMatch = block.match(/::(.*?)::(.*?){/s);
        if (!headerMatch) {
            this.errorCount++;
            continue;
        }

        const id = headerMatch[1].trim();
        const text = headerMatch[2].trim();

        const inside = block.split("{")[1];
        if (!inside) {
            this.errorCount++;
            continue;
        }

        const lines = inside
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 0);

        const responses = [];

        for (const line of lines) {
            if (line.startsWith("=")) {
                responses.push(new Reponse(line.substring(1), true));
            } else if (line.startsWith("~")) {
                responses.push(new Reponse(line.substring(1), false));
            }
        }

        // si aucune réponse valide trouvée
        if (responses.length === 0) {
            this.errorCount++;
            continue;
        }

        questions.push(new Question(id, text, "multichoice", responses));
    }

    this.parsedQuestions = questions;
    return questions;
};

GiftParser.prototype.parseFile = function (filePath) {
    if (!fs.existsSync(filePath)) {
        throw new Error("Fichier GIFT introuvable : " + filePath);
    }
    const raw = fs.readFileSync(filePath, "utf8");
    return this.parseGift(raw);
};

module.exports = GiftParser;
