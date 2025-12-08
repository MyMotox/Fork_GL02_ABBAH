#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const colors = require('colors');
const VpfParser = require('../parsers/VpfParser.js');
const vg = require('vega');
const vegalite = require('vega-lite');
const { checkGift, checkVcf } = require('../utils/ConformiteFormats'); 
const { VerifSecureGIFT, VerifSecureVCARD } = require('../utils/SecureData');
const VerificationExam = require('../classes/VerificationExam');
const Question = require('../classes/Question');
const program = require('@caporal/core').default;

// Imports pour F9 et F10
const ProfileGenerator = require('../profiling/profileGenerator');
const ProfileComparator = require('../profiling/profileComparator');
const VegaCharts = require('../profiling/vegaCharts');
const loadBank = require('../utils/loadbank');

program
  .name('vpf-parser-cli')
  .version('0.07')

  // check Vpf
  .command('check', 'Check if <file> is a valid Vpf file') 
  .argument('<file>', 'The file to check with Vpf parser')
  .option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : program.BOOLEAN, default: false }) 
  .option('-t, --showTokenize', 'log the tokenization results', { validator: program.BOOLEAN, default: false }) 
  .action(({args, options, logger}) => { 
    fs.readFile(args.file, 'utf8', function (err,data) { 
      if (err) { 
        return logger.warn(err);
      } 
      
      var analyzer = new VpfParser(options.showTokenize, options.showSymbols); 
      analyzer.parse(data);

      if(analyzer.errorCount === 0){
        logger.info("The .vpf file is a valid vpf file".green);
      }else{
        logger.info("The .vpf file contains error".red);
      } 
      logger.debug(analyzer.parsedPOI); 
    });
  })

  // readme
  .command('readme', 'Display the README.txt file')
  .action(({ logger }) => {
    fs.readFile('./documents/README.txt', 'utf8', (err, data) => {
      if (err) return logger.warn(err);
      logger.info(data);
    });
  })

  // search
  .command('search', "Free text search on POIs' name")
  .argument('<file>', 'The Vpf file to search')
  .argument('<needle>', "The text to look for in POIs' names")
  .action(({ args, logger }) => {
    fs.readFile(args.file, 'utf8', (err, data) => {
      if (err) return logger.warn(err);

      const parser = new VpfParser();
      parser.parse(data);

      if (parser.errorCount === 0) {
        let pois = parser.parsedPOI;
        pois = pois.filter(poi => poi.name.includes(args.needle));
        logger.info("%s", JSON.stringify(pois, null, 2));
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // average
  .command('average', 'Compute the average note of each POI')
  .alias('avg')
  .argument('<file>', 'The Vpf file to search')
  .action(({ args, logger }) => {
    fs.readFile(args.file, 'utf8', (err, data) => {
      if (err) return logger.warn(err);

      const parser = new VpfParser();
      parser.parse(data);

      if (parser.errorCount === 0) {
        const pois = parser.parsedPOI;
        pois.forEach(poi => {
          const sum = poi.ratings.reduce((acc, r) => acc + parseInt(r, 10), 0);
          poi.rateAvg = poi.ratings.length ? sum / poi.ratings.length : 0;
        });
        logger.info("%s", JSON.stringify(pois, null, 2));
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // abc
  .command('abc', "Restructure POIs by the first letter of their name")
  .argument('<file>', 'The Vpf file to read')
  .action(({ args, logger }) => {
    fs.readFile(args.file, 'utf8', (err, data) => {
      if (err) return logger.warn(err);

      const parser = new VpfParser();
      parser.parse(data);

      if (parser.errorCount === 0) {
        const pois = parser.parsedPOI;
        const byFirstLetter = pois.reduce((acc, poi) => {
          const k = poi.name[0].toLowerCase();
          if (!acc[k]) acc[k] = [];
          acc[k].push(poi);
          return acc;
        }, {});
        logger.info("%s", JSON.stringify(byFirstLetter, null, 2));
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  // average with chart
  .command('averageChart', 'Compute the average note of each POI and export a Vega-Lite chart')
  .alias('avgChart')
  .argument('<file>', 'The Vpf file to use')
  .action(({ args, logger }) => {
    fs.readFile(args.file, 'utf8', (err, data) => {
      if (err) return logger.warn(err);

      const parser = new VpfParser();
      parser.parse(data);

      if (parser.errorCount === 0) {
        const pois = parser.parsedPOI.map(poi => {
          const sum = poi.ratings.reduce((acc, r) => acc + parseInt(r, 10), 0);
          const averageRatings = poi.ratings.length ? sum / poi.ratings.length : 0;
          return { ...poi, averageRatings };
        });

        const avgChart = {
          $schema: 'https://vega.github.io/schema/vega-lite/v5.json',
          data: { values: pois },
          mark: 'bar',
          encoding: {
            x: { field: 'name', type: 'nominal', axis: { title: "Restaurants' name." } },
            y: { field: 'averageRatings', type: 'quantitative', axis: { title: `Average ratings for ${args.file}.` } }
          }
        };

        const compiled = vegalite.compile(avgChart).spec;
        const runtime = vg.parse(compiled);
        const view = new vg.View(runtime).renderer('svg').run();
        view.toSVG().then(svg => {
          fs.writeFileSync('./result.svg', svg);
          view.finalize();
          logger.info("%s", JSON.stringify(compiled, null, 2));
          logger.info('Chart output: ./result.svg');
        });
      } else {
        logger.info("The .vpf file contains error".red);
      }
    });
  })

  //Validate GIFT/vCard formats
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

  //Check exam validity (duplicates + 15–20 questions)
  .command('check-exam', 'Validate exam from a JSON file')
  .argument('<file>', 'Path to JSON file containing questions')
  .action(({ args, logger }) => {
    const filePath = path.resolve(args.file);
    const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    const questions = raw.map(q =>
      new Question(q.id, q.text, q.questionType, q.responses)
    );

    const result = VerificationExam.checkQuestions(questions);

    logger.info(result.valid ? `Exam valid: ${result.message}` : `Exam invalid: ${result.message}`);

    if (result.duplicates.length > 0) {
      logger.info(`Duplicates detected: ${result.duplicates.join(', ')}`);
    }
  })
  
  //Secure GIFT file
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
  
  //Secure vCard file
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

  // F9 - Generate profile
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

  // F10 - Compare profiles
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

program.run();