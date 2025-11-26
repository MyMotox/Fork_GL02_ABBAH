#!/usr/bin/env node
const fs = require('fs');
const colors = require('colors');
const VpfParser = require('../parsers/VpfParser.js');

const vg = require('vega');
const vegalite = require('vega-lite');
const analyzer = require("../parsers/VpfParser");

const cli = require("@caporal/core").default;

cli
	.version('vpf-parser-cli')
	.version('0.07')
	// check Vpf
	.command('check', 'Check if <file> is a valid Vpf file')
	.argument('<file>', 'The file to check with Vpf parser')
	.option('-s, --showSymbols', 'log the analyzed symbol at each step', { validator : cli.BOOLEAN, default: false })
	.option('-t, --showTokenize', 'log the tokenization results', { validator: cli.BOOLEAN, default: false })
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
	.action(({args, options, logger}) => {
		fs.readFile('./documents/README.txt', 'utf8', function (err, data) {
			if (err) {
				return logger.warn(err);
			}
			logger.info(data);
		});
			})
	//.action(({args, options, logger}) =>
	//  ...
	//})
	
	
	// search
	.command('search', 'Free text search on POIs\' name')
	.argument('<file>', 'The Vpf file to search')
	.argument('<needle>', 'The text to look for in POI\'s names')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}
	
			const analyzer = new VpfParser();
			analyzer.parse(data);
			
			if(analyzer.errorCount === 0){
			
				// Filtre à ajouter //
				let poiAFiltrer = analyzer.parsedPOI;
				poiAFiltrer = poiAFiltrer.filter( (poi) => {return poi.name.includes(args.needle);});
				logger.info("%s", JSON.stringify(poiAFiltrer, null, 2));
				// Filtre à ajouter //
				
			}else{
				logger.info("The .vpf file contains error".red);
			}
		
		});
	})

	// average
	.command('average', 'Compute the average note of each POI')
	.alias('avg')
    .argument('<file>', 'The Vpf file to search')
    .action(({args, options, logger}) => {
        fs.readFile(args.file, 'utf8', function (err,data) {
            if (err) {
                return logger.warn(err);
            }

            const analyzer = new VpfParser();
            analyzer.parse(data);

            if (analyzer.errorCount === 0) {
                const POIs = analyzer.parsedPOI;
                POIs.forEach(poi => {
                    let sum = 0
                    poi.ratings.forEach(rating => {
                        sum += parseInt(rating);
                    })
                    console.log(poi.ratings.length);
                    poi.rateAvg = sum / poi.ratings.length;
                    console.log(poi)
                });
            } else {
                logger.info("The .vpf file contains error".red);
            }
        })
    })

	// abc
.command('abc', 'permettant de restructurer la liste de POI sous la forme d’un objet classant les point d’intérêt par rapport à la première lettre de leur nom')
.argument('<file>', 'The Vpf file to read')
.action(({args, options, logger}) => {
    fs.readFile(args.file, 'utf8', function (err, data) {
        if (err) {
            return logger.warn(err);
        }
        let analyzer = new VpfParser();
        analyzer.parse(data);
        if(analyzer.errorCount === 0) {
            let poiAFiltrer = analyzer.parsedPOI;

            // Restructuration des POI par la première lettre de leur nom
            const restructuredPOI = poiAFiltrer.reduce((acc, poi) => {
                const firstLetter = poi.name[0].toLowerCase();
                if (!acc[firstLetter]) {
                    acc[firstLetter] = [];
                }
                acc[firstLetter].push(poi);
                return acc;
            }, {});

            logger.info("%s", JSON.stringify(restructuredPOI, null, 2));
        } else {
            logger.info("The .vpf file contains error".red);
        }
    });
})



	// average with chart
	.command('averageChart', 'Compute the average note of each POI and export a Vega-lite chart')
	.alias('avgChart')
	.argument('<file>', 'The Vpf file to use')
	.action(({args, options, logger}) => {
		fs.readFile(args.file, 'utf8', function (err,data) {
			if (err) {
				return logger.warn(err);
			}
	
			const analyzer = new VpfParser();
			analyzer.parse(data);
			
			if(analyzer.errorCount === 0){

				// ToDo: Prepare the data for avg //
				// let avg = <un array de POI ayant un attribut "averageRatings" égal à la moyenne des notes qu'il a reçu>
				const avg = analyzer.parsedPOI;
				avg.forEach(poi => {
					if (poi.ratings.length === 0){
						poi.averageRatings = 0;
					} else {
						let sum = 0
						poi.ratings.forEach(rating => {
							sum += parseInt(rating);
						})
						poi.averageRatings = sum / poi.ratings.length;
					}

				});

				var avgChart = {
					$schema: 'https://vega.github.io/schema/vega-lite/v5.json',
					//"width": 320,
					//"height": 460,
					"data" : {
							"values" : avg
					},
					"mark" : "bar",
					"encoding" : {
						"x" : {"field" : "name", "type" : "nominal",
								"axis" : {"title" : "Restaurants' name."}
							},
						"y" : {"field" : "averageRatings", "type" : "quantitative",
								"axis" : {"title" : "Average ratings for "+args.file+"."}
							}
					}
				}
				
				
				
				const myChart = vegalite.compile(avgChart).spec;
				
				/* SVG version */
				var runtime = vg.parse(myChart);
				var view = new vg.View(runtime).renderer('svg').run();
				var mySvg = view.toSVG();
				mySvg.then(function(res){
					fs.writeFileSync("./result.svg", res)
					view.finalize();
					logger.info("%s", JSON.stringify(myChart, null, 2));
					logger.info("Chart output : ./result.svg");
				});
				
				/* Canvas version */
				/*
				var runtime = vg.parse(myChart);
				var view = new vg.View(runtime).renderer('canvas').background("#FFF").run();
				var myCanvas = view.toCanvas();
				myCanvas.then(function(res){
					fs.writeFileSync("./result.png", res.toBuffer());
					view.finalize();
					logger.info(myChart);
					logger.info("Chart output : ./result.png");
				})			
				*/
				
				
			}else{
				logger.info("The .vpf file contains error".red);
			}
			
		});
	})	

	
cli.run(process.argv.slice(2));
	