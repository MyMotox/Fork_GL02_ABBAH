# Projet GL02 - Groupe ABBAH - V1.1


Notre projet est développé en JavaScript (Node.js) dans le cadre du cours GL02 – Fondements de l'ingénierie logicielle.

Le code est structuré pour répondre directement au cahier des charges d'une application console "Sujet B : Outil de gestion еt dе génération d’еxamеns au format GIFT" de l'équipe Team SoftMakers.

Notre feuille de route de développement se trouve sur Github : https://github.com/orgs/ABBAH-GL02/projects/2

---


## 1. Pré-requis & Installation (à la première utilisation)

Avant d'utiliser l'application, assurez-vous d'avoir :
- Node.js 18+ installé : https://nodejs.org/

Option A — Utilisation directe via Node.js
```bash
npm install         # installe les dépendances
cd src/cli
node questionCli.js <commande>
```

Option B — Installation globale (npm)
```bash
npm install         # installe les dépendances
npm i -g            
npm link            # rend les commandes bin accessibles depuis le terminal
gift <commande>
```


## 2. Architecture du code
```powershell
├── documents/               # livrables et documentation
├── src/
│   ├── classes/             # Modèles de données
│   ├── parsers/             # Extraction du texte en Objets JS
│   ├── cli/                 # Interface utilisateur
│       └── data/            # fichiers GIFT de test
│   ├── logging /            # Journalisation
│   ├── profiling /          # Analyse Vega-lite
│   ├── utils /              # Fichiers utilitaires à QuestionCli.js
│   └── exports/             # Génération de sorties (visualisations)
├── spec/                    # Tests unitaires Jasmine
```

Dans le cadre des TD de GL02, les fichiers caporalCli.js et POI.js sont conservés dans le repository car ils faisaient partie des supports pédagogiques fournis.
Ils ne sont toutefois pas utilisés dans l’implémentation finale du projet.

## 3. Equipe

Chef d'équipe: Héléna Chevalier

Membres: Sacha Himber; Jules Andrea; Fadi-Farhat; Emeline Nerot

## 4. Utilisation des commandes

Si vous utilisez npm i -g, vous pouvez utiliser à la racine du repository avec "gift" suivi des commandes. Sinon, allez dans le dossier "src/cli" et exécutez "node questionCli.js" suivi des commandes.

Pour afficher le menu d'aide :
```bash
node questionCli.js
# ou
node questionCli.js menu
```

### 📋 Gestion des questions

**Visualiser une question**
```bash
node questionCli.js view <répertoire> <id>
```
Exemple : 
```bash
node questionCli.js view data "U5 p49 GR2.5"
```

**Rechercher une question**
```bash
node questionCli.js search <répertoire> <texte>
```
Exemple : 
```bash
node questionCli.js search data "Ultimate"
```

### 📤 Gestion des examens

**Sélectionner une question**
```bash
node questionCli.js select <répertoire> <id>
```
Exemple : 
```bash
node questionCli.js select data "U5 p49 GR2.5"
```

**Afficher la sélection actuelle**
```bash
node questionCli.js list
```

**Vider la sélection**
```bash
node questionCli.js clear
```

**Exporter un examen au format GIFT**
```bash
node questionCli.js export <fichier-sortie>
```
Exemple : 
```bash
node questionCli.js export ./exports/examen.gift
```

**Simuler un examen**
```bash
node questionCli.js simulate <fichier-examen>
```
Exemple : 
```bash
node questionCli.js simulate ./exports/examen.gift
```

### 👤 Création d'une fiche vCard enseignant

**Créer une carte vCard enseignant**
```bash
node questionCli.js vcard <version> <prénom> <anniversaire> <email> <téléphone> <organisation> [--out <fichier-sortie>]
```
Exemple : 
```bash
node questionCli.js vcard "3.0" "Jean" "15/03/1985" "jean.dupont@mail.fr" "0123456789" "UTC" --out ./exports/enseignant.vcf
```

### ✓ Validation et sécurité des données

**Valider un fichier GIFT ou vCard**
```bash
node questionCli.js validate <fichier>
```
Exemple : 
```bash
node questionCli.js validate ./exports/examen.gift
```

**Sécuriser les données d'un fichier GIFT**
```bash
node questionCli.js secure-gift <fichier>
```

**Sécuriser les données d'un fichier vCard**
```bash
node questionCli.js secure-vcard <fichier>
```

### 📊 Analyse des profils d'examen

**Générer le profil statistique d'un examen**
```bash
node questionCli.js generate-profile <fichier-ou-répertoire>
```
Exemple : 
```bash
node questionCli.js generate-profile ./data
```

**Comparer deux profils d'examen**
```bash
node questionCli.js compare-profiles <fichier1> <fichier2>
```
Exemple : 
```bash
node questionCli.js compare-profiles ./exports/examen.gift ./data
```

**Note :** Les graphiques Vega-Lite sont générés dans `./outputs/` et visualisables sur https://vega.github.io/editor/

## 5. Tests unitaires

L’application inclut une suite de tests unitaires fondée sur Jasmine (vu en TD), conformément aux exigences de Robustesse (NF3) du cahier des charges.

En installation : 
```bash
npm install --save-dev jasmine
npx jasmine init
```

A la racine du projet :
```bash
npm test
```

## 6. Licence

Projet développé dans un contexte académique — diffusion restreinte aux étudiants du module GL02.