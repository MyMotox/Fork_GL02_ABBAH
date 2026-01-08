const fs = require("fs");
const path = require("path");
const Question = require("../classes/Question");
const Reponse = require("../classes/Reponse");

var GiftParser = function () {
    this.parsedQuestions = []; // tableau des questions extraites
    this.errorCount = 0; // compteur d'erreurs lors du parsing
};

// Fonction principale pour parser un texte GIFT
GiftParser.prototype.parseGift = function (giftText) {

    // Séparation du texte en blocs basés sur la fermeture des accolades
    const blocks = giftText
        .split("}")
        .map(b => b.trim())
        .filter(b => b.length > 0);

    const questions = [];

    // Parcours de chaque bloc pour extraire les questions
    for (const block of blocks) {

        // Extraction de l'ID et du texte de la question dans la forme ::ID:: Texte {
        const headerMatch = block.match(/::(.*?)::(.*?){/s);
        if (!headerMatch) {
            this.errorCount++;
            continue;
        }

        const id = headerMatch[1].trim();
        const text = headerMatch[2].trim();

        // Extraction du contenu à l'interieur des accolades
        const inside = block.split("{")[1];
        if (!inside) {
            this.errorCount++;
            continue;
        }

        // Chaque ligne à l'intérieur représente une réponse potentielle
        const lines = inside
            .split("\n")
            .map(l => l.trim())
            .filter(l => l.length > 0);

        const responses = [];

        // Parcours de chaque ligne pour créer les objets Reponse
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
        // Création de l'objet Question avec type "multichoice"
        questions.push(new Question(id, text, "multichoice", responses));
    }

    this.parsedQuestions = questions;
    return questions;
};

// Fonction pour parser un fichier GIFT existant
GiftParser.prototype.parseFile = function (filePath) {
    if (!fs.existsSync(filePath)) { // vérification si le fichier existe
        throw new Error("Fichier GIFT introuvable : " + filePath);
    }
    const raw = fs.readFileSync(filePath, "utf8"); // lecture
    return this.parseGift(raw); // utilisation de parseGift pour extraire les questions
};

module.exports = GiftParser;
