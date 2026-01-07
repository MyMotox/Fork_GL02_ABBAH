
// Node.js core modules for file system and path operations
const fs = require("fs");
const path = require("path");

// Custom parser for GIFT files (question format)
const QuestionParser = require("../parsers/QuestionParser");
// Custom logger for operation tracking
const Logger = require("../logging/logger");


/**
 * Charge une banque de questions à partir d'un fichier ou d'un dossier .gift.
 * @param {string} directoryPath - Chemin vers un fichier .gift ou un dossier contenant des fichiers .gift
 * @returns {Array} allQuestions - Tableau de toutes les questions extraites
 * @throws {Error} si le chemin n'est ni un fichier ni un dossier, ou si le fichier n'est pas un .gift
 */
function loadBank(directoryPath) {
    // Démarre une opération de log pour le chargement
    Logger.startOperation('Chargement de la banque de questions', { repertoire: directoryPath });
    try {
        const allQuestions = [];

        // Vérifie si le chemin est un fichier ou un dossier
        const stats = fs.statSync(directoryPath);
        if (stats.isFile()) {
            // Cas : un seul fichier (ex: ./exports/examen.gift)
            if (directoryPath.endsWith('.gift')) {
                // Lit le contenu du fichier .gift
                const content = fs.readFileSync(directoryPath, 'utf8');
                // Parse le contenu pour extraire les questions
                const parser = new QuestionParser();
                parser.parseGift(content);
                // Ajoute toutes les questions extraites au tableau principal
                allQuestions.push(...parser.parsedQuestion);
                Logger.info('Fichier parse', { fichier: path.basename(directoryPath), questionsExtraites: parser.parsedQuestion.length });
            } else {
                // Si le fichier n'est pas un .gift, lève une erreur
                throw new Error('Le fichier fourni n\'est pas un .gift');
            }
        } else if (stats.isDirectory()) {
            // Cas : un dossier contenant potentiellement plusieurs fichiers .gift
            const files = fs.readdirSync(directoryPath);
            Logger.info('Fichiers trouves', { total: files.length, fichiersGift: files.filter(f => f.endsWith('.gift')).length });

            // Parcourt chaque fichier du dossier
            files.forEach(file => {
                if (file.endsWith('.gift')) {
                    // Pour chaque fichier .gift, lit et parse le contenu
                    const filepath = path.join(directoryPath, file);
                    const content = fs.readFileSync(filepath, 'utf8');

                    const parser = new QuestionParser();
                    parser.parseGift(content);

                    // Ajoute les questions extraites à la liste globale
                    allQuestions.push(...parser.parsedQuestion);
                    Logger.info('Fichier parse', { fichier: file, questionsExtraites: parser.parsedQuestion.length });
                }
            });
        } else {
            // Si le chemin n'est ni un fichier ni un dossier, lève une erreur
            throw new Error('Le chemin fourni n\'est ni un fichier ni un répertoire');
        }

        // Termine l'opération de log avec le nombre total de questions extraites
        Logger.endOperation('Chargement de la banque de questions', { totalQuestions: allQuestions.length });
        return allQuestions;
    } catch (error) {
        // En cas d'erreur, log l'échec de l'opération et relance l'erreur
        Logger.failOperation('Chargement de la banque de questions', error);
        throw error;
    }
}


// Exporte la fonction pour utilisation externe
module.exports = loadBank;