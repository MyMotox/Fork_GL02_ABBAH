const Logger = require('../logging/logger');

class ProfileComparator {
    
    compareProfiles(examProfile, bankProfile) {
        Logger.startOperation('Comparaison de profils');
        
        const comparison = {};
        
        let examTotal = 0;
        let bankTotal = 0;
        
        for (let type in examProfile) {
            examTotal += examProfile[type];
            bankTotal += bankProfile[type];
        }
        
        let totalDiff = 0;
        
        for (let type in examProfile) {
            const examPct = (examProfile[type] / examTotal) * 100;
            const bankPct = (bankProfile[type] / bankTotal) * 100;
            const diff = Math.abs(examPct - bankPct);
            
            comparison[type] = {
                examPct: examPct,
                bankPct: bankPct,
                diff: diff
            };
            
            totalDiff += diff;
        }
        
        const similarity = 100 - (totalDiff / Object.keys(examProfile).length);
        
        Logger.endOperation('Comparaison de profils');
        
        return {
            comparison: comparison,
            similarity: similarity,
            examTotal: examTotal,
            bankTotal: bankTotal
        };
    }

    displayComparison(result) {
        console.log('\n=== COMPARAISON ===\n');
        
        console.log('Examen: ' + result.examTotal + ' questions');
        console.log('Banque: ' + result.bankTotal + ' questions\n');
        
        console.log('Similarite: ' + result.similarity.toFixed(1) + '%\n');
        
        const typeNames = {
            'truefalse': 'Vrai/Faux',
            'multichoice': 'QCM',
            'shortanswer': 'Reponse Courte',
            'matching': 'Correspondance',
            'missing_word': 'Mot Manquant',
            'numerical': 'Numerique',
            'essay': 'Question Ouverte'
        };
        
        for (let type in result.comparison) {
            const data = result.comparison[type];
            if (data.examPct > 0 || data.bankPct > 0) {
                const typeFr = typeNames[type] || type;
                console.log(typeFr + ':');
                console.log('  Examen: ' + data.examPct.toFixed(1) + '%');
                console.log('  Banque: ' + data.bankPct.toFixed(1) + '%');
                console.log('  Diff: ' + data.diff.toFixed(1) + '%\n');
            }
        }
        
        console.log('==================\n');
    }
}

module.exports = ProfileComparator;