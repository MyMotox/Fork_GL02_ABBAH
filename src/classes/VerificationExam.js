class VerificationExam {
    /**
     * Vérifie qu'il n'y a pas de doublons de questions dans un examen
     * Vérifie que le nombre de question se situe bien entre 15 et 20
     * @param {Array} questions - Liste des questions de l'examen
     */
    static verifierQuestions(questions) {

        // Vérifie que la liste des questions n'est pas vide ou un tableau non valide
        if (!Array.isArray(questions) || questions.length === 0) {
            return { valide: false, doublons: [], message: "Aucune question fournie" };

        }

        // Vérifiel le nombre de questions
        if (questions.length < 15 || questions.length > 20) {
            return {
                valide: false,
                doublons: [],
                message: `Le nombre de questions doit être entre 15 et 20. Actuellement: ${questions.length}`
            };
        }

        const idConnue = new Set();
        const doublons = new Set();

        // Vérifie les doublons
        questions.forEach((question) => {
            if (!question.id) {             //Je fais mes tests avec des id, donc il faut qu'il y en ait un
                throw new Error('Chaque question doit avoir un id');
            }
            
            // Si plusieurs questions ont le même id, elles sont ajoutées à la liste des doublons
            if (idConnue.has(question.id)) {
                doublons.add(question.id);
            }
            idConnue.add(question.id);
        });

        return {
            valide: doublons.length === 0,
            doublons: doublons,
            message: doublons.length > 0 
                ? `Doublons détectés (${doublons.length}): ${doublons.join(', ')}`
                : 'Aucun doublon détecté'

        };
    }
}

module.exports = VerificationExam;