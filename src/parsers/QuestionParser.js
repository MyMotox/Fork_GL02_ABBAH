var Question = require('../classes/Question');
var Reponse = require('../classes/Reponse');

var QuestionParser = function(){
    this.parsedQuestion = [];
    this.errorCount = 0;
}

QuestionParser.prototype.parseGift = function(giftText){
    const lines = giftText.split(/\r?\n/);

    // enlever commentaires "//" et lignes vides
    const cleaned = lines
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('//'));

    const questions = [];
    let buffer = [];

    for (const line of cleaned) {

        if (line.startsWith("::") && buffer.length > 0) {
            buffer = [];
        }

        buffer.push(line);

        // Détection très permissive d'une fermeture de question
        // On considère qu'une question est complète lorsque "}" apparaît.
        if (line.includes("}")) {
            const question = this.parseQuestion(buffer);
            if (question) {
                questions.push(question);
            } else {
                this.errorCount++;
            }

            buffer = [];
        }
    }

    this.parsedQuestion = questions;
}



QuestionParser.prototype.parseQuestion = function (raw) {
    const text = raw.join("\n");

    // 1) Extraire ID + début du texte
    const titleMatch = text.match(/^::(.*?)::\s*(.*)$/s);
    if (!titleMatch) return null;

    const title = titleMatch[1].trim();
    const body = titleMatch[2].trim();

    // 2) Extraire :
    // - texte avant les réponses,
    // - contenu entre { },
    // - texte après la fermeture }
    //
    // Exemple :
    //   DEBUT { REPONSES } FIN
    //
    const match = body.match(/([\s\S]*?)\{([\s\S]*?)\}([\s\S]*)/);
    if (!match) return null;

    const stemBefore = match[1].trim();
    const optionsBody = match[2].trim();
    const stemAfter = match[3].trim();

    // stem = texte avant + texte après
    const stem = (stemBefore + " " + stemAfter).trim();

    // 3) TRUE/FALSE (si optionsBody est exactement T/F/TRUE/FALSE)
    if (/^(T|F|TRUE|FALSE)$/i.test(optionsBody)) {
        const answer = /^T|TRUE$/i.test(optionsBody);
        return new Question(title, stem, "truefalse", answer);
    }

    // 4) MULTICHOICE / SHORTANSWER

    const choices = [];
    const items = optionsBody.split(/(?=[~=])/); // découpe sur "=" ou "~"

    items.forEach(item => {
        item = item.trim();
        if (!item) return;

        const correct = item.startsWith("=");

        let [value, feedback] = item.substring(1).split("#");

        choices.push(new Reponse(
            value.trim(),
            correct,
            feedback ? feedback.trim() : null
        ));
    });

    // shortanswer si TOUTES les réponses sont correctes
    const isShortAnswer = choices.every(c => c.correct);

    return new Question(
        title,
        stem,
        isShortAnswer ? "shortanswer" : "multichoice",
        choices
    );
}

module.exports = QuestionParser;
