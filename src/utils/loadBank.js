const fs = require("fs");
const path = require("path");
const QuestionParser = require("../parsers/QuestionParser");
const Logger = require("../logging/logger");

function loadBank(directoryPath) {
    Logger.startOperation('Chargement de la banque de questions', { repertoire: directoryPath });
    try {
        const allQuestions = [];
        const files = fs.readdirSync(directoryPath);
        Logger.info('Fichiers trouves', { total: files.length, fichiersGift: files.filter(f => f.endsWith('.gift')).length });

        files.forEach(file => {
            if (file.endsWith(".gift")) {
                const filepath = path.join(directoryPath, file);
                const content = fs.readFileSync(filepath, "utf8");

                const parser = new QuestionParser();
                parser.parseGift(content);

                allQuestions.push(...parser.parsedQuestion);
                Logger.info('Fichier parse', { fichier: file, questionsExtraites: parser.parsedQuestion.length });
            }
        });

        Logger.endOperation('Chargement de la banque de questions', { totalQuestions: allQuestions.length });
        return allQuestions;
    } catch (error) {
        Logger.failOperation('Chargement de la banque de questions', error);
        throw error;
    }
}

module.exports = loadBank;