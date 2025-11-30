const fs = require("fs");
const path = require("path");

function escapeGift(text) {
    return text
        .replace(/}/g, "\\}")
        .replace(/{/g, "\\{");
}

class GiftExporter {

    static generate(questions) {

        return questions.map(q => {

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
                // toutes correctes
                q.responses.forEach(r => {
                    out += `=${escapeGift(r.text)}`;
                    if (r.feedback) out += ` #${escapeGift(r.feedback)}`;
                    out += "\n";
                });
            }

            else {
                // fallback si type inconnu
                out += "// unsupported question type\n";
            }

            out += "}\n\n"; // fin de question GIFT
            return out;

        }).join("");
    }

    static saveToFile(questions, outputPath) {
        const giftText = GiftExporter.generate(questions);
        fs.writeFileSync(outputPath, giftText, "utf8");
    }
}

module.exports = GiftExporter;
