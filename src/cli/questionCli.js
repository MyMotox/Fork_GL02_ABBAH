const cli = require("@caporal/core").default;
const QuestionParser = require('../parsers/QuestionParser.js');
const vg = require('vega');
const vegalite = require('vega-lite');
const fs = require('fs');
const ExamSelection = require('../classes/ExamSelection.js');
const loadBank = require("../utils/loadBank");
const GiftExporter = require("../utils/GiftExporter");

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



// ------------------------- RUN -------------------------
cli.run(process.argv.slice(2));