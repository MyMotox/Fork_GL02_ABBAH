#!/usr/bin/env node

// Detect if stdin is being waited on (e.g., unclosed quotes in shell)
// This helps provide a useful error message instead of hanging
if (process.stdin.isTTY === undefined && process.argv.length <= 2) {
    // stdin might be piped or shell is waiting for input
    const timeout = setTimeout(() => {
        console.error('\n❌ Erreur: La commande semble incomplète ou le terminal attend une entrée.');
        console.error('💡 Conseil: Vérifiez que tous les guillemets sont correctement fermés.');
        console.error('💡 Usage: node questionCli.js search data "KEYWORD"');
        process.exit(1);
    }, 100);

    // Clear timeout if we receive data
    process.stdin.once('readable', () => {
        clearTimeout(timeout);
    });
}

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
const { simulateExam } = require("../utils/simulateExam");
const Logger = require('../logging/logger');
const { ProfileGenerator, ProfileComparator, VegaCharts } = require('../profiling');

// ----------------------- MENU ----------------------
cli
    .command("menu", "Afficher les commandes disponibles")
    .option("-v, --verbose", "Afficher les logs détaillés", { validator: cli.BOOLEAN, default: false })
    .action(({ options, logger }) => {
        if (options.verbose) {
            Logger.setVerbose();
        }

        logger.info("\n╔════════════════════════════════════════════════════════════╗");
        logger.info("║       CLI BANQUE DE QUESTIONS - COMMANDES DISPONIBLES      ║");
        logger.info("╚════════════════════════════════════════════════════════════╝\n");

        logger.info("📋 GESTION DES QUESTIONS:");
        logger.info("  view <répertoire> <id>       Visualiser une question");
        logger.info("  search <répertoire> <texte>  Rechercher des questions");
        logger.info("  select <répertoire> <id>     Ajouter une question à la sélection");
        logger.info("  list                         Afficher les questions sélectionnées");
        logger.info("  clear                        Vider la sélection\n");

        logger.info("📤 EXPORT ET GÉNÉRATION:");
        logger.info("  export <fichier>             Exporter la sélection au format GIFT");
        logger.info("  vcard <version> <prénom> <anniversaire> <email> <téléphone> <organisation>");
        logger.info("       --out <fichier>         Générer une fiche vCard enseignant");
        logger.info("  simulate <fichier>           Simuler un examen à partir d'un fichier GIFT\n");

        logger.info("✓ VALIDATION ET SÉCURITÉ:");
        logger.info("  validate <fichier>           Valider un fichier .gift ou .vcf");
        logger.info("  secure-gift <fichier>        Sécuriser les données d'un fichier GIFT");
        logger.info("  secure-vcard <fichier>       Sécuriser les données d'une vCard\n");

        logger.info("📊 ANALYSE:");
        logger.info("  generate-profile <fichier>   Générer le profil statistique d'un examen");
        logger.info("  compare-profiles <f1> <f2>   Comparer deux profils d'examen\n");

        logger.info("ℹ️  AIDE:");
        logger.info("  menu                         Afficher ce menu");
        logger.info("  menu --verbose               Afficher le menu avec logs détaillés\n");
    });

// ----------------------- VISUALISER ----------------------
cli
    .command("view", "Visualiser une question")
    .argument("<dir>", "Répertoire contenant les fichiers GIFT")
    .argument("<id>", "Identifiant de la question")
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
            logger.info(`  ${i + 1}. ${r.correct ? '[✓]' : '[ ]'} ${r.text}`)
        );
    });


// ----------------------- RECHERCHER ----------------------
cli
    .command("search", "Rechercher une question")
    .argument("<dir>", "Répertoire contenant les fichiers .gift")
    .argument("<text>", "Texte à rechercher")
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


// ----------------------- SÉLECTIONNER ----------------------
cli
    .command("select", "Ajouter une question à la sélection")
    .argument("<dir>", "Répertoire contenant les fichiers GIFT")
    .argument("<id>", "Identifiant de la question")
    .action(({ args, logger }) => {

        const bank = loadBank(args.dir);

        const q = bank.find(q => q.id === args.id);

        if (!q) return logger.warn("Identifiant introuvable.");

        try {
            ExamSelection.add(q);

            const selected = ExamSelection.list();
            selected.forEach((question, index) => {
                logger.info(` ${index + 1}. ${question.id} - ${question.text}`);
            });

            logger.info(`Question ${q.id} ajoutée.`);
        } catch (e) {
            logger.warn(e.message);
        }
    });


// ----------------------- AFFICHER SÉLECTION ----------------------
cli
    .command("list", "Afficher les questions sélectionnées")
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

// ----------------------- VIDER SÉLECTION ----------------------
cli
    .command("clear", "Vider la sélection actuelle")
    .action(({ logger }) => {
        ExamSelection.clear();
        logger.info("Sélection vidée avec succès.");
    });

// ----------------------- EXPORTER LA SÉLECTION ----------------------

cli
    .command("export", "Générer un fichier GIFT à partir de la sélection")
    .argument("<output>", "Chemin du fichier GIFT de sortie")
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

// ----------------------- F5 : FICHE VCARD ENSEIGNANT ----------------------
cli
    .command("vcard", "Générer une fiche vCard enseignant")
    .argument("<version>", "Version de la vCard")
    .argument("<firstname>", "Prénom de l'enseignant")
    .argument("<birthday>", "Date d'anniversaire de l'enseignant (JJ/MM/YYYY)")
    .argument("<email>", "Email de l'enseignant (TEXTE@TEXTE.TEXTE)")
    .argument("<telephone>", "Téléphone de l'enseignant (10 chiffres)")
    .argument("<organization>", "Organisation de l'enseignant (TEXTE)")
    .option("--out <file>", "Chemin du fichier vCard de sortie", {
        default: "../exports/teacher.vcf",
    })
    .action(({ logger, args, options }) => {
        // Création objet teacher
        const teacher = new Teacher(
            args.firstname,
            args.birthday,
            args.email,
            process.argv[7], // forcer le string avant de regex sinon cela supprime les 0 devant
            args.organization
        );
        const errors = teacher.validate();
        if (errors.length > 0) {
            logger.error("Informations enseignant invalides :\n- " + errors.join("\n- "));
            logger.info("\nUtilisation correcte:");
            logger.info(
                "\t vcard <version> <prénom> <anniversaire> <email> <téléphone> <organisation> --out [sortie]"
            );
            process.exitCode = 1;
            return;
        }
        const outPath = path.join(process.cwd(), options.out);
        try {
            writeVCardFile(teacher, args.version, outPath);
            logger.info(`Fichier vCard généré avec succès: ${outPath}`);
        } catch (err) {
            logger.error(err.message);
            process.exitCode = 1;
        }
    });

// ----------------------- F6 : SIMULATION D'EXAMEN ----------------------

cli
    .command("simulate", "Simuler un examen complet à partir d'un fichier GIFT")
    .argument("<file>", "Chemin du fichier examen GIFT")
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

// ----------------------- NF2 : CONFORMITÉ DES FORMATS ----------------------
cli
    .command('validate', 'Valider un fichier .gift ou .vcf selon les règles de syntaxe')
    .argument('<file>', 'Chemin du fichier à valider (.gift ou .vcf)')
    .action(({ args, logger }) => {
        const filePath = path.resolve(args.file);
        const content = fs.readFileSync(filePath, 'utf8');

        if (filePath.endsWith('.gift')) {
            const res = checkGift(content);
            logger.info(res.isValid ? 'Format GIFT valide' : `Erreurs: ${res.errors.join('; ')}`);
            process.exit(res.isValid ? 0 : 1);
        } else if (filePath.endsWith('.vcf') || filePath.endsWith('.vcard')) {
            const res = checkVcf(content);
            logger.info(res.isValid ? 'Format vCard valide' : `Erreurs: ${res.errors.join('; ')}`);
            process.exit(res.isValid ? 0 : 1);
        } else {
            logger.info('Extension non supportée. Utilisez .gift ou .vcf');
            process.exit(1);
        }
    })

// ----------------------- NF7 : SÉCURITÉ DES DONNÉES ----------------------
cli
    .command('secure-gift', 'Sécurise les données d\'un fichier GIFT')
    .argument('<file>', 'Chemin vers le fichier .gift')
    .action(({ args, logger }) => {
        try {
            secureGift(args.file);
            logger.info('Les données sont bien sécurisées!');
        } catch (err) {
            logger.error(err.message);
        }
    })

// ----------------------- NF7 : SÉCURITÉ DES DONNÉES ----------------------
cli
    .command('secure-vcard', 'Sécurise les données d\'une fiche vCard')
    .argument('<file>', 'Chemin vers le fichier .vcf ou .vcard')
    .action(({ args, logger }) => {
        try {
            secureVCard(args.file);
            logger.info('Les données sont bien sécurisées!');
        } catch (err) {
            logger.error(err.message);
        }
    })

// ----------------------- F9 : GÉNÉRATION DE PROFIL D'EXAMEN ----------------------
cli
    .command('generate-profile', 'Génère le profil statistique d\'un examen GIFT')
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

            logger.info('Profil généré avec succès: ' + outputPath);
        } catch (err) {
            logger.error('Erreur lors de la génération du profil: ' + err.message);
        }
    })

// ----------------------- F10 : COMPARAISON DE PROFILS ----------------------
cli
    .command('compare-profiles', 'Compare le profil statistique de deux examens GIFT')
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

            logger.info('Comparaison générée avec succès: ' + outputPath);
        } catch (err) {
            logger.error('Erreur lors de la comparaison: ' + err.message);
        }
    });

// ----------------------- LANCER L'APPLICATION ----------------------

// Afficher l'aide/menu si aucune commande n'est fournie
if (process.argv.slice(2).length === 0) {
    console.log("\n╔════════════════════════════════════════════════════════════╗");
    console.log("║       CLI BANQUE DE QUESTIONS - COMMANDES DISPONIBLES      ║");
    console.log("╚════════════════════════════════════════════════════════════╝\n");

    console.log("📋 GESTION DES QUESTIONS:");
    console.log("  node questionCli.js view <répertoire> <id>       Visualiser une question");
    console.log("  node questionCli.js search <répertoire> <texte>  Rechercher des questions");
    console.log("  node questionCli.js select <répertoire> <id>     Ajouter une question à la sélection");
    console.log("  node questionCli.js list                         Afficher les questions sélectionnées");
    console.log("  node questionCli.js clear                        Vider la sélection\n");

    console.log("📤 EXPORT ET GÉNÉRATION:");
    console.log("  node questionCli.js export <fichier>             Exporter la sélection au format GIFT");
    console.log("  node questionCli.js vcard <version> <prénom> <anniversaire> <email> <téléphone> <organisation>");
    console.log("         --out <fichier>            Générer une fiche vCard enseignant");
    console.log("  node questionCli.js simulate <fichier>           Simuler un examen à partir d'un fichier GIFT\n");

    console.log("✓ VALIDATION ET SÉCURITÉ:");
    console.log("  node questionCli.js validate <fichier>           Valider un fichier .gift ou .vcf");
    console.log("  node questionCli.js secure-gift <fichier>        Sécuriser les données d'un fichier GIFT");
    console.log("  node questionCli.js secure-vcard <fichier>       Sécuriser les données d'une vCard\n");

    console.log("📊 ANALYSE:");
    console.log("  node questionCli.js generate-profile <fichier>   Générer le profil statistique d'un examen");
    console.log("  node questionCli.js compare-profiles <f1> <f2>   Comparer deux profils d'examen\n");

    console.log("ℹ️  AIDE:");
    console.log("  node questionCli.js menu                         Afficher ce menu\n");

    process.exit(0);
}

cli.run(process.argv.slice(2));



