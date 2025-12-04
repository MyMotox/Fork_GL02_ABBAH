const fs = require("fs");
const path = require("path");
const Logger = require("../logging/logger");

function escapeGift(text) {
    return text
        .replace(/}/g, "\\}")
        .replace(/{/g, "\\{");
}

class GiftExporter {

    static generate(questions) {
        Logger.startOperation('Generation contenu GIFT', { nombreQuestions: questions.length });
        try {
            const result = questions.map(q => {

                let out = `::${q.id}:: ${escapeGift(q.text)}\n{\n`;

                if (q.questionType === "truefalse") {
                    out += (q.responses === true ? "T" : "F") + "\n";
                }

                else if (q.questionType === "multichoice") {
                    q.responses.forEach(r => {
                        out += `${r.correct ? "=" : "~"}${escapeGift(r.text)}`;
                        if (r.feedback) out += ` #${escapeGift(r.feedback)}`;
                        out += "\n";
                    });
                }

                else if (q.questionType === "shortanswer") {
                    q.responses.forEach(r => {
                        out += `=${escapeGift(r.text)}`;
                        if (r.feedback) out += ` #${escapeGift(r.feedback)}`;
                        out += "\n";
                    });
                }

                else {
                    out += "// unsupported question type\n";
                }

                out += "}\n\n";
                return out;

            }).join("");
            Logger.endOperation('Generation contenu GIFT');
            return result;
        } catch (error) {
            Logger.failOperation('Generation contenu GIFT', error);
            throw error;
        }
    }

    static saveToFile(questions, outputPath) {
        Logger.startOperation('Export fichier GIFT', { fichier: outputPath, nombreQuestions: questions.length });
        try {
            const giftText = GiftExporter.generate(questions);
            fs.writeFileSync(outputPath, giftText, "utf8");
            Logger.endOperation('Export fichier GIFT', { fichier: outputPath });
        } catch (error) {
            Logger.failOperation('Export fichier GIFT', error);
            throw error;
        }
    }
}

module.exports = GiftExporter;