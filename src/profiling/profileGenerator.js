const Logger = require('../logging/logger');

class ProfileGenerator {
    analyzeQuestions(questions) {
        Logger.startOperation('Analyse du profil', { nombreQuestions: questions.length });
        
        const profile = {
            'truefalse': 0,
            'multichoice': 0,
            'shortanswer': 0,
            'matching': 0,
            'missing_word': 0,
            'numerical': 0,
            'essay': 0
        };
        
        questions.forEach(q => {
            const type = q.questionType;
            if (profile[type] !== undefined) {
                profile[type]++;
            }
        });

        Logger.endOperation('Analyse du profil', { repartition: profile });
        return profile;
    }

    displayProfile(profile) {
        console.log('\n=== PROFIL DE L\'EXAMEN ===\n');
        
        let total = 0;
        for (let type in profile) {
            total += profile[type];
        }
        
        console.log('Total questions: ' + total + '\n');
        
        if (profile.truefalse > 0) {
            console.log('Vrai/Faux: ' + profile.truefalse);
        }
        if (profile.multichoice > 0) {
            console.log('QCM: ' + profile.multichoice);
        }
        if (profile.shortanswer > 0) {
            console.log('Reponse courte: ' + profile.shortanswer);
        }
        
        console.log('\n========================\n');
    }
}

module.exports = ProfileGenerator;