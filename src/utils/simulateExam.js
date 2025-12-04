const readline = require("readline");

async function simulateExam(questions) {

    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    function ask(query) { //Lecture
        return new Promise(resolve => rl.question(query, resolve));
    }

    let score = 0;
    let details = [];

    console.log("\n===== Simulation d'examen =====\n");

    for (const q of questions) {
        console.log(`Question ${q.id}: ${q.text}`);

        q.responses.forEach((r, idx) => {
            console.log(`  ${idx + 1}) ${r.text}`); //réponses possibles
        });

        let num; // numéro de réponse valide
        do {
            let answer = await ask("\nRéponse : ");
            num = parseInt(answer);
            if (!num || num < 1 || num > q.responses.length) {
                console.log("Réponse invalide, veuillez entrer un numéro entre 1 et " + q.responses.length);
            }
        } while (!num || num < 1 || num > q.responses.length);

        const chosen = q.responses[num - 1];

        if (chosen.correct) {
            console.log("Bonne réponse\n");
            score++;
            details.push({ id: q.id, correct: true });
        } else {
            console.log("Mauvaise réponse\n");
            details.push({ id: q.id, correct: false });
        }

    }

    rl.close();

    console.log("\n===== BILAN FINAL =====\n");
    console.log(`Score de simulation : ${score}/${questions.length}`);

    details.forEach(d => {
        console.log(` - Question ${d.id} : \t\t\t\t${d.correct ? "Correct" : "Faux"}`);
    });

    return { score, details };
}

module.exports = { simulateExam };
