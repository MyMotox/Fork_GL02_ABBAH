const fs = require('fs');
const Logger = require('../logging/logger');

class VegaCharts {
    static generateProfileChart(profile) {
        Logger.startOperation('Generation graphique Vega-Lite');
        
        const data = [];
        
        if (profile.truefalse > 0) {
            data.push({ type: 'Vrai/Faux', count: profile.truefalse });
        }
        if (profile.multichoice > 0) {
            data.push({ type: 'QCM', count: profile.multichoice });
        }
        if (profile.shortanswer > 0) {
            data.push({ type: 'Reponse Courte', count: profile.shortanswer });
        }
        
        const vegaSpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "title": "Profil de l'examen",
            "data": { "values": data },
            "mark": "bar",
            "encoding": {
                "x": { "field": "type", "type": "nominal", "title": "Type" },
                "y": { "field": "count", "type": "quantitative", "title": "Nombre" },
                "color": { "field": "type", "type": "nominal" }
            }
        };
        
        Logger.endOperation('Generation graphique Vega-Lite');
        return vegaSpec;
    }

    static generateComparisonChart(result) {
        Logger.startOperation('Generation graphique comparaison');
        
        const data = [];
        
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
            const comp = result.comparison[type];
            if (comp.examPct > 0 || comp.bankPct > 0) {
                const typeFr = typeNames[type] || type;
                
                data.push({ 
                    type: typeFr, 
                    category: 'Examen', 
                    pct: parseFloat(comp.examPct.toFixed(1))
                });
                data.push({ 
                    type: typeFr, 
                    category: 'Banque', 
                    pct: parseFloat(comp.bankPct.toFixed(1))
                });
            }
        }
        
        const vegaSpec = {
            "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
            "title": "Comparaison Examen vs Banque",
            "data": { "values": data },
            "mark": "bar",
            "encoding": {
                "x": { 
                    "field": "type", 
                    "type": "nominal", 
                    "title": "Type de Question" 
                },
                "y": { 
                    "field": "pct", 
                    "type": "quantitative", 
                    "title": "Pourcentage (%)" 
                },
                "color": { 
                    "field": "category", 
                    "type": "nominal",
                    "title": "Source"
                },
                "xOffset": { "field": "category" }
            }
        };
        
        Logger.endOperation('Generation graphique comparaison');
        return vegaSpec;
    }

    static saveChart(vegaSpec, outputPath) {
        Logger.startOperation('Sauvegarde graphique', { fichier: outputPath });
        fs.writeFileSync(outputPath, JSON.stringify(vegaSpec, null, 2), 'utf8');
        Logger.endOperation('Sauvegarde graphique', { fichier: outputPath });
        console.log('Graphique sauvegarde: ' + outputPath + '\n');
    }
}

module.exports = VegaCharts;