### README - Verbose POI Format (VPF) Parser - TP GL02

Description : Offer a recursive descent parser implemented in Javascript for reading and processing the Verbose POI Format (VPF). This format allows to describe any list of Point of Interest (POI) with an associated list of evaluation. The files are in text format and should respect the following grammar.

<liste_poi> = *(<poi> <eol>) "$$"
<poi> = "START_POI" <eol> <body> "END_POI"
<body> = <name> <eol> <latlng> <eol> <optional>
<optional> = *(<note> <eol>)
<name> = "name: " 1*WCHAR
<latlng> = "latlng: " ?"-" 1*3DIGIT "." 1*DIGIT ";" ?"-" 1*3DIGIT "." 1*DIGIT
<note> = "note: " "0"/"1"/"2"/"3"/"4"/"5"
<eol> = CRLF

### Installation

$ npm install

### Utilisation :

$ node caporalCli.js <command> fileToParse [-hts]

<command> : check

-h or --help 	:	 display the program help
-t or --showTokenize :	 display the tokenization result 
-s or --showSymbols :	 display each step of the analysis

Optional parameters have to be before the mandatory file parameter.

### Version : 

# 0.07

- Caporal 2.0 Migration.

# 0.06

- Add vega-lite visualization and export.

# 0.05

- Utilisation du framework Caporal.js pour gérer la cli

# 0.04

- Découplage CLI dans module à part : cli.js
- Refactoring POI et VpfParser

# 0.03

- Ajout d'une option help permettant de lire le readme depuis la console
- Ajout d'un mode verbose pour suivre l'action du parser

# 0.02

- Prise en charge des notes
- Construction d'une liste d'objet POI afin de permettre des traitement ultérieur

# 0.01

- Parse entièrement les fichiers simples du jeu de test (mais termine avec une erreur)
- Prise en compte des noms de POI s'ils ne comportent pas d'espaces

TODO :

- Modification de la grammaire (à vérifier)
- Ajout de tests unitaires ./test/unit (qunit - lancer avec testRunner.js) - à compléter.

- Ajout d'une option pour afficher chaque POI avec sa note moyenne


### Liste des contributeurs
M. Tixier (matthieu.tixier@utt.fr)


