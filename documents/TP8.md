# Réponses TP8

## 2. Aide du programme
0) Prenez connaissance de l’aide du programme caporalCli.js. Lancez le programme (si ce n’est pas déjà fait) avec la commande help. Chaque commande dispose de sa propre aide aussi (ie, node
caporalCli.js help check).

1) Regarder à quoi ressemble le type des fichier .vpf qui sont analysés par le programme avec un éditeur de texte. Quels sont les attributs d’un objet de type POI ?
> // The list of POI parsed from the input file.
> 	this.name = nm;
	this.lat = lt;
	this.lng = lg;
	this.ratings = [].concat(r);

## 3. Analyse de la grammaire ABNF – README.txt
2) Quel est le non terminal de départ de la grammaire implémentée ?
> <liste_poi> = *(<poi> <eol>) "$$"

3) Quels sont les symboles de départ et de fin d'un point d'intérêt ?*
> <poi> = "START_POI" <eol> <body> "END_POI"

## 4. Analyse du parser – VpfParser.js
node caporalCli.js check ./sample.vpf
4) Dans VpfParser.js, que fait précisément la méthode « tokenize » ? Faîtes affichez le résultat de cette opération en vous aidants des options déjà défini pour la commande check (avec l’option -t de la commande check).
> Tokenize converti en liste le fichier.
5) Faîtes afficher au fur et à mesure les symboles reconnus par le parser afin de mieux comprendre son fonctionnement (avec l’option -s de la commande check).
//  node caporalCli.js check ./sample.vpf -s
6) Quelles différences faîtes-vous entre les point d'intérêt contenu dans un fichier vpf et ceux qui sont construits avec new POI() ?
> Le new POI dans VpfParser.js est sans ratings.

## 5. Ajout de commandes basiques à la CLI – caporalCli.js
7) Prenez le temps de comprendre l’organisation du framework Caporal.js (https://caporal.io/guide).
8) Ajouter une commande « readme » permettant d’afficher le contenu du fichier README.txt dans la console (vous pouvez utiliser : fs.readFile(<file>, "utf-8", callback)).

node caporalCli.js readme ./documents/README.txt
9) Ajoutez une commande « search » à un argument permettant de rechercher les point d’intérêt contenant une certaine chaîne de caractère. Pour ce faire utilisez la fonction « filter ».


## 6. Ajout de commandes à base de map() et reduce() – caporalCli.js
10) Ajouter une commande « average » permettant de modifier chaque POI en ajoutant un attribut contenant la moyenne des notes obtenues et de l’afficher dans la console (s’il n’y a pas de note, la moyenne pour ce point d’intérêt est 0). Pour ce faire utilisez la fonction « map ».
11) Ajouter une commande « abc » permettant de restructurer la liste de POI sous la forme d’un objet classant les point d’intérêt par rapport à la première lettre de leur nom (ie, { "a" : [ POI, POI … ], "b" : [ etc.). Pour ce faire utilisez la fonction « reduce ».

## 7. Génération de graphique et fonctionnement du framework
13) La commande « averageChart » doit permettre de générer un graphique au format SVG des notes moyennes reçues par chaque POI. Pour le moment elle est incomplète car elle aucune donnée ne lui est fournie. Corrigez le code associé à la commande pour pouvoir générer le graphique. (you will need to install the canvas module if you want to make .png output : https://github.com/Automattic/node-canvas)

14) En étudiant le code source du programme de caporalCli.js : Quelle différence faîtes-vous entre les abstractions commande, argument, option et argument que vous offre le framework ? Faîtes une hypothèse sur le type de la valeur de retour des fonctions argument() et option() ?

# X. Explications cas VpfParser
Le vpfParser donne un exemple d'un parser récursif descendant. Un parser passe tout d'abord par
une opération de segmentation (tokenisation) du fichier lu. On définit ce qui sépare chaque symbole
en entrée (en l'occurrence le saut de ligne et les ": "). L'intérêt est d'en tirer une succession de
symbole sous forme d'un tableau afin de pouvoir vérifier la conformité à la grammaire.
## Aspects syntaxiques :
Le principe d'un parser récursif descendant est de générer de proche en proche une structure bien
formée pour le fichier lu en partant du symbole de départ de la grammaire. Il applique les règles
possibles jusqu'à trouver un premier symbole terminal qui permette de confirmer l'analyse et
continue jusqu'à avoir analysé tous les symboles.
Dans le cas où le parser est correct, si l'analyse échoue alors le fichier ne respecte pas le format.
Comme dans les grammaires formelles, il est possible d'utiliser des définitions récursives des règles
afin de reconnaître autant d'éléments que nécessaire. Il reproduit de façon très proche les règles de
la grammaire définie pour le format vpf.
## Opérations de bases :
Les opérations de bases de l'algorithme sont :
next() --> avance dans le tableau d’entrées en renvoyant le prochain élément. L'élément est sorti du
tableau à chaque appel.
accept(s) --> vérifie qu'un symbole appartient bien à l’alphabet du langage modélisé par la
grammaire.
check(s, input) --> test si un symbole s correspond au prochain symbole lu sur input.
expect(s, input) --> lit un symbole de input et test sa correspondance à s. Provoque une erreur si le
symbole lu ne correspond pas au symbole attendu.
Les opérations permettent de reconnaître les symboles au fur et à mesure tout en contrôlant
l’avancée dans la chaîne d’entrée.
## Aspects sémantiques :
Au-delà de vérifier la conformité syntaxique au format, l'analyseur construit également au fur et à
mesure des objets de type POI. Au fil de l'analyse du fichier, ces objets POI sont instanciés pour le
programme et peuvent donc réaliser des traitements et opérations (de niveau donc sémantique). Par
exemple on peut demander à un POI de calculer la moyenne de ses notes ce qui n'était pas possible
avec le seul fichier vpf. En quelques sortes, on fait en sorte que javascript comprenne le "sens" des
éléments contenus dans un fichier vpf valide.