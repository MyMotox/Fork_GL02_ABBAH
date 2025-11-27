var Question = require('../classes/Question');
var Reponse = require('../classes/Reponse');

var QuestionParser = function(){
    this.parsedQuestion = [];
    this.errorCount = 0;
}

QuestionParser.prototype.parseGift = function(giftText){
    const lines = giftText.split(/\r?\n/);

    const cleaned = lines
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('//'));

    const questions = [];
    let buffer = [];

    function parseQuestion(raw) {
        const text = raw.join("\n");

        const titleMatch = text.match(/^::(.*?)::\s*(.*)/s);
        if (!titleMatch) return null;

        const title = titleMatch[1].trim();
        const body = titleMatch[2].trim();

        const match = body.match(/^(.*?)[{](.*)[}]$/s);
        if (!match) return null;

        const stem = match[1].trim();
        const optionsBody = match[2].trim();

        if (/^T|F$/i.test(optionsBody)) {
            return new Question(title, stem, "truefalse", optionsBody.toUpperCase() === "T");
        }

        const choices = [];
        const items = optionsBody.split(/(?=[~=])/);

        items.forEach(item => {
            item = item.trim();
            if (!item) return;

            const correct = item.startsWith("=");

            let [value, feedback] = item.substring(1).split("#");

            choices.push(new Reponse(value.trim(), correct, feedback ? feedback.trim() : null));
        });

        const isShortAnswer = choices.every(c => c.correct);

        return new Question(title, stem, isShortAnswer ? "shortanswer" : "multichoice", choices);
    }

    for (const line of cleaned) {
        buffer.push(line);
        if (line.includes("}")) {
            const question = parseQuestion(buffer);
            if (question) questions.push(question);
            buffer = [];
        }
    }

        this.parsedQuestion = questions;
}

module.exports = QuestionParser;