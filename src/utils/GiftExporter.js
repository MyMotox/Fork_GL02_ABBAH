const fs = require("fs");
const path = require("path");
const Logger = require("../logging/logger");

// Fonction utilitaire pour échapper les accolades dans le texte
function escapeGift(text) {
    return text
        .replace(/}/g, "\\}")
        .replace(/{/g, "\\{");
}

class GiftExporter {

    // Génère un texte GIFT à partir d'un tableau de questions
    static generate(questions) {
        Logger.startOperation('Generation contenu GIFT', { nombreQuestions: questions.length });
        try {
            const result = questions.map(q => {

                // Entête de la question avec ID et texte
                let out = `::${q.id}:: ${escapeGift(q.text)}\n{\n`;

                // Question Vrai/Faux
                if (q.questionType === "truefalse") {
                    out += (q.responses === true ? "T" : "F") + "\n";
                }
                // Question choix multiple
                else if (q.questionType === "multichoice") {
                    q.responses.forEach(r => {
                        out += `${r.correct ? "=" : "~"}${escapeGift(r.text)}`;
                        if (r.feedback) out += ` #${escapeGift(r.feedback)}`;
                        out += "\n";
                    });
                }
                // Question à réponse courte
                else if (q.questionType === "shortanswer") {
                    q.responses.forEach(r => {
                        out += `=${escapeGift(r.text)}`;
                        if (r.feedback) out += ` #${escapeGift(r.feedback)}`;
                        out += "\n";
                    });
                }
                // Type non supporté
                else {
                    out += "// unsupported question type\n";
                }

                out += "}\n\n"; // fermeture bloc
                return out;

            }).join(""); // concaténation de toutes les questions en un seul texte
            Logger.endOperation('Generation contenu GIFT');
            return result;
        } catch (error) {
            Logger.failOperation('Generation contenu GIFT', error);
            throw error;
        }
    }
    // Génère le texte GIFT généré dans un fichier
    static saveToFile(questions, outputPath) {
        Logger.startOperation('Export fichier GIFT', { fichier: outputPath, nombreQuestions: questions.length });
        try {
            const giftText = GiftExporter.generate(questions); // génère le texte GIFT
            fs.writeFileSync(outputPath, giftText, "utf8"); // écrit dans le fichier
            Logger.endOperation('Export fichier GIFT', { fichier: outputPath });
        } catch (error) {
            Logger.failOperation('Export fichier GIFT', error);
            throw error;
        }
    }
}

module.exports = GiftExporter;