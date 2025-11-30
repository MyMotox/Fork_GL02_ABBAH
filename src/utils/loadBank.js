const fs = require("fs");
const path = require("path");
const QuestionParser = require("../parsers/QuestionParser");

function loadBank(directoryPath) {
    const allQuestions = [];
    const files = fs.readdirSync(directoryPath);

    files.forEach(file => {
        if (file.endsWith(".gift")) {
            const filepath = path.join(directoryPath, file);
            const content = fs.readFileSync(filepath, "utf8");

            const parser = new QuestionParser();
            parser.parseGift(content);

            allQuestions.push(...parser.parsedQuestion);
        }
    });

    return allQuestions;
}

module.exports = loadBank;
