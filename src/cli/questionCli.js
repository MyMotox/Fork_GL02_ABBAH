#!/usr/bin/env node

const cli = require("@caporal/core").default;
const QuestionParser = require('../parsers/QuestionParser.js');
const GiftParser = require('../parsers/GiftParser.js');
const vg = require('vega');
const vegalite = require('vega-lite');
const fs = require('fs');
const path = require("path");
const ExamSelection = require('../classes/ExamSelection.js');
const loadBank = require("../utils/loadBank");
const GiftExporter = require("../utils/GiftExporter");
const Teacher = require("../classes/Teacher");
const { writeVCardFile } = require("../utils/VCard");
const  { simulateExam } = require("../utils/simulateExam");

// ------------------------- VIEW -------------------------
cli
.command("view", "View question")
.argument("<dir>", "Directory containing GIFT files")
.argument("<id>", "Question ID")
.action(({ args, logger }) => {

    const bank = loadBank(args.dir);

    const q = bank.find(q => q.id === args.id);

    if (!q) {
        return logger.warn("Identifiant introuvable.");
    }

    logger.info(`\n=== QUESTION ${q.id} ===`);
    logger.info("Texte : " + q.text);
    logger.info("Type  : " + q.questionType);
    logger.info("Réponses :");
    q.responses.forEach((r, i) =>
        logger.info(`  ${i+1}. ${r.correct ? '[✓]' : '[ ]'} ${r.text}`)
    );
});


// ------------------------- SEARCH -------------------------
cli
.command("search", "search question")
.argument("<dir>", "Directory containing .gift files")
.argument("<text>", "Search text")
.action(({ args, logger }) => {

    const bank = loadBank(args.dir);

    const result = bank.filter(q => 
        q.id.includes(args.text) ||
        q.questionType.includes(args.text) ||
        q.text.includes(args.text)
    );

    if (result.length === 0) {
        logger.warn("Aucun résultat.");
    } else {
        result.forEach(q => logger.info(`${q.id} : ${q.text}`));
    }
});


// ------------------------- SELECT -------------------------
cli
.command("select", "Add question to exam selection")
.argument("<dir>", "Directory containing GIFT files")
.argument("<id>", "Question ID")
.action(({ args, logger }) => {

    const bank = loadBank(args.dir);

    const q = bank.find(q => q.id === args.id);

    if (!q) return logger.warn("Identifiant introuvable.");

    try {
        ExamSelection.add(q);
        logger.info(`Question ${q.id} ajoutée.`);
    } catch (e) {
        logger.warn(e.message);
    }
});


// ------------------------- LIST SELECTION -------------------------
cli
.command("list", "Show currently selected questions")
.action(({ logger }) => {
    const selected = ExamSelection.list();

    if (selected.length === 0) {
        return logger.info("Aucune question sélectionnée.");
    }

    logger.info("\n=== QUESTIONS SÉLECTIONNÉES ===");

    selected.forEach((q, index) => {
        logger.info(` ${index + 1}. ${q.id} - ${q.text}`);
    });

    logger.info("=================================\n");
});

// ------------------------- CLEAR SELECTION -------------------------
cli
.command("clear", "Clear the current exam selection")
.action(({ logger }) => {
    ExamSelection.clear();
    logger.info("Sélection vidée avec succès.");
});

// ------------------------- EXPORT DE LA SELECTION -------------------------

cli
.command("export", "Generate a GIFT exam file from selection")
.argument("<output>", "Output GIFT file path")
.action(({ args, logger }) => {

    const selected = ExamSelection.list();

    if (selected.length === 0) {
        return logger.warn("Aucune question sélectionnée.");
    }

    // Vérification F7 — doublons (normalement impossible)
    const ids = selected.map(q => q.id);
    const unique = new Set(ids);
    if (unique.size !== ids.length) {
        return logger.warn("Erreur : doublons dans la sélection.");
    }

    // Vérification F8 — 15 à 20 questions
    if (selected.length < 15) {
        return logger.warn("Vous avez moins de 15 questions.");
    }
    if (selected.length > 20) {
        return logger.warn("Vous avez plus de 20 questions.");
    }

    try {
        GiftExporter.saveToFile(selected, args.output);
        logger.info("Fichier GIFT généré : " + args.output);
    } catch (err) {
        logger.error("Erreur lors de la génération : " + err.message);
    }
});

// ------------------------- F5 : VCARD enseignant  -------------------------
cli
.command("vcard", "Creation of VCard")
.argument("<version>", "VCard Version")
.argument("<firstname>", "Teacher's first name")
.argument("<birthday>", "Teacher's birthday (DD/MM/YYYY)")
.argument("<email>", "Teacher's email (TEXT@TEXT.TEXT)")
.argument("<telephone>", "Teacher's telephone (10 digits)")
.argument("<organization>", "Teacher's organization (TEXT)")
.option("--out <file>", "Output vCard file path", {
    default: "../exports/teacher.vcf",
})
.action(({ logger, args, options }) => {
    // création objet teacher
    const teacher = new Teacher(
        args.firstname,
        args.birthday,
        args.email,
        process.argv[7], // forcer le string avant de regex sinon cela supprime les 0 devant
        args.organization
    );
    //logger.info(teacher.tel);
    const errors = teacher.validate();
        if (errors.length > 0) {
            logger.error("Invalid teacher information:\n- " + errors.join("\n- "));
            logger.info("\nCorrect usage:");
            logger.info(
                "\t vcard <firstname> <birthday> <email> <telephone> <organization> --out [fileOutput]"
            );
            process.exitCode = 1;
            return;
        }
    const outPath = path.join(process.cwd(), options.out);
    try {
        writeVCardFile(teacher,args.version,outPath);
        logger.info(`vCard file successfully generated: ${outPath}`);
    } catch (err) {
        logger.error(err.message);
        process.exitCode = 1;
    }
});

// ------------------------------ F6 : Simulation d'examen -----------------------------------------

cli
.command("simulate", "Simulate a full exam from a GIFT file")
.argument("<file>", "Path to exam GIFT file")
.action(async ({ logger, args }) => {

    const file = path.resolve(args.file);
    const parser = new GiftParser();

    try {
        const text = fs.readFileSync(file, "utf8");
        const questions = parser.parseGift(text);

        if (questions.length === 0) {
            throw new Error("Aucune question valide trouvée dans ce fichier.");
        }

        await simulateExam(questions);

    } catch (err) {
        logger.error("Erreur simulation examen : " + err.message);
        process.exitCode = 1;
    }
});

// ------------------------------ NF2 : Conformité des formats -----------------------------------------
cli
.command('validate', 'Validate a .gift or .vcf file against syntax rules')
.argument('<file>', 'Path to the file to validate (.gift or .vcf)')
.action(({ args, logger }) => {
const filePath = path.resolve(args.file);
const content = fs.readFileSync(filePath, 'utf8');

if (filePath.endsWith('.gift')) {
    const res = checkGift(content);
    logger.info(res.isValid ? 'GIFT format valid' : `Errors: ${res.errors.join('; ')}`);
    process.exit(res.isValid ? 0 : 1);
} else if (filePath.endsWith('.vcf') || filePath.endsWith('.vcard')) {
    const res = checkVcf(content);
    logger.info(res.isValid ? 'vCard format valid' : `Errors: ${res.errors.join('; ')}`);
    process.exit(res.isValid ? 0 : 1);
} else {
    logger.info('Unsupported extension. Use .gift or .vcf');
    process.exit(1);
}
})

// ------------------------------ NF7 : Sécurité des données -----------------------------------------
cli
.command('secure-gift', 'Sécurise un fichier GIFT')
.argument('<file>', 'Chemin vers le fichier .gift')
.action(({ args, logger }) => {
try {
    secureGift(args.file);
    logger.info('Les données sont bien sécurisées!');
} catch (err) {
    logger.error(err.message);
}
})

// ------------------------------ NF7 : Sécurité des données -----------------------------------------
cli
.command('secure-vcard', 'Sécurise un fichier vCard')
.argument('<file>', 'Chemin vers le fichier .vcf ou .vcard')
.action(({ args, logger }) => {
try {
    secureVCard(args.file);
    logger.info('Les données sont bien sécurisées!');
} catch (err) {
    logger.error(err.message);
}
})

// ------------------------------ F9 : Génération de profil d’un examen  -----------------------------------------
cli
.command('generate-profile', 'Genere le profil statistique d\'un examen GIFT')
.argument('<examen>', 'Chemin vers le fichier ou dossier GIFT')
.action(({ args, logger }) => {
try {
    logger.info('Analyse du fichier: ' + args.examen);
    
    const questions = loadBank(args.examen);
    const generator = new ProfileGenerator();
    const profile = generator.analyzeQuestions(questions);
    
    generator.displayProfile(profile);
    
    const chart = VegaCharts.generateProfileChart(profile);
    const outputPath = './outputs/profile.json';
    VegaCharts.saveChart(chart, outputPath);
    
    logger.info('Profil genere avec succes: ' + outputPath);
} catch (err) {
    logger.error('Erreur lors de la generation du profil: ' + err.message);
}
})

// ------------------------------ F10 : Comparaison de profils statistiques entre examen ------------------------------
cli
.command('compare-profiles', 'Compare le profil de deux examens GIFT')
.argument('<examen1>', 'Chemin vers le premier fichier GIFT')
.argument('<examen2>', 'Chemin vers le second fichier GIFT (ou banque)')
.action(({ args, logger }) => {
try {
    logger.info('Comparaison de: ' + args.examen1 + ' et ' + args.examen2);
    
    const questions1 = loadBank(args.examen1);
    const questions2 = loadBank(args.examen2);
    
    const generator = new ProfileGenerator();
    const profile1 = generator.analyzeQuestions(questions1);
    const profile2 = generator.analyzeQuestions(questions2);
    
    const comparator = new ProfileComparator();
    const result = comparator.compareProfiles(profile1, profile2);
    
    comparator.displayComparison(result);
    
    const chart = VegaCharts.generateComparisonChart(result);
    const outputPath = './outputs/comparison.json';
    VegaCharts.saveChart(chart, outputPath);
    
    logger.info('Comparaison generee avec succes: ' + outputPath);
} catch (err) {
    logger.error('Erreur lors de la comparaison: ' + err.message);
}
});

// ------------------------- RUN -------------------------

cli.run(process.argv.slice(2));



