class VerificationExam {
    /**
     * Checks that there are no duplicate questions in an exam
     * Checks that the number of questions is between 15 and 20
     * @param {Array} questions - List of exam questions
     */
    static checkQuestions(questions) {

        // Check that the list of questions is not empty or invalid
        if (!Array.isArray(questions) || questions.length === 0) {
            return { valid: false, duplicates: [], message: "No questions provided" };
        }

        // Check the number of questions
        if (questions.length < 15 || questions.length > 20) {
            return {
                valid: false,
                duplicates: [],
                message: `The number of questions must be between 15 and 20. Current count: ${questions.length}`
            };
        }

        const seenIds = new Set();
        const duplicates = new Set();

        // Check for duplicate IDs
        questions.forEach((question) => {
            if (!question.id) { // Each question must have an id
                throw new Error('Each question must have an id');
            }

            if (seenIds.has(question.id)) {
                duplicates.add(question.id);
            }
            seenIds.add(question.id);
        });

        return {
            valid: duplicates.size === 0,
            duplicates: [...duplicates],
            message: duplicates.size > 0 
                ? `Duplicates detected (${duplicates.size}): ${[...duplicates].join(', ')}`
                : 'No duplicates detected'
        };
    }
}

module.exports = VerificationExam;
