const cli = require("@caporal/core").default;
const QuestionParser = require('../parsers/QuestionParser.js');
const vg = require('vega');
const vegalite = require('vega-lite');
const fs = require('fs');

cli
    .command('view', 'display question')
    .argument('<file>', 'The gift file to use')
    .argument('<id>', 'The question id')
    .action(({args, options, logger}) => {
        fs.readFile(args.file, 'utf8', function (err,data) {
            if (err) {
                return logger.warn(err);
            }

            const analyzer = new QuestionParser();
            analyzer.parseGift(data);
            // console.log(JSON.stringify(analyzer.parsedQuestion, null, 2));

            if (analyzer.errorCount === 0) {
                let quest = analyzer.parsedQuestion.filter( (q) => {return q.id === args.id;});

                if (quest.length === 0) {
                    logger.warn("Identifiant absent ou incorrect.")
                } else {
                    logger.info(JSON.stringify(quest, null, 2));
                }
            }
        });
    })

    .command('search', 'search question')
    .argument('<file>', 'The gift file to use')
    .argument('<text>', 'search by texte')
    .action(({args, options, logger}) => {
        fs.readFile(args.file, 'utf8', function (err,data) {
            if (err) {
                return logger.warn(err);
            }

            const analyzer = new QuestionParser();
            analyzer.parseGift(data);

            if (analyzer.errorCount === 0) {
                let quest = analyzer.parsedQuestion.filter( (q) => {return q.id.includes(args.text) || q.questionType.includes(args.text) || q.text.includes(args.text)});

                if (quest.length === 0) {
                    logger.warn("Aucun résultat trouvé.")
                } else {
                    logger.info(JSON.stringify(quest, null, 2));
                }
            }
        });
    })



cli.run(process.argv.slice(2));