# Projet GL02 - Groupe ABBAH


Notre projet est développé en JavaScript (Node.js) dans le cadre du cours GL02 – Fondements de l'ingénierie logicielle.
Le code est structuré pour répondre directement au cahier des charges d'une application console "Outil de gestion еt dе génération d’еxamеns au format GIFT".

---


## 1. Installation (à la première utilisation)

Option A — Utilisation directe via Node.js
```bash
npm i -g            # installe les dépendances
node questionCli.js <commande>
```

Option B — Installation globale (npm)
```bash
npm i -g            # installe les dépendances
npm link            # rend les commandes bin accessibles depuis le terminal
gift <commande>
```


## 2. Architecture du code
```powershell
├── data/                    # fichiers GIFT
├── documents/               # livrables et documentation
├── src/
│   ├── classes/             # Modèles de données
│   ├── parsers/             # Extraction du texte en Objets JS
│   ├── cli/                 # Interface utilisateur
│   └── exports/             # Génération de sorties (visualisations)
├── tests/                   # Tests unitaires
```

## 3. Equipe

Chef d'équipe: Héléna Chevalier

Membres: Sacha Himber; Jules Andrea; Fadi-Farhat; Emeline Nerot

## 4. Utilisation des commandes

Si vous utilisez npm i -g, vous pouvez utiliser à la racine du repository avec "gift" suivi des commandes. Sinon il est recommandé d'aller dans le dossier "src/cli" et d'effectuer "node questionCli.js" suivi des commandes

### Questions
- Visualiser une question
```bash
node questionCli.js view <dir> <id>
```
Exemple : 
```bash
node questionCli.js view data "EM U42 Ultimate q2"
```

- Rechercher une question
```bash
node questionCli.js search <dir> <text>
```
Exemple : 
```bash
node questionCli.js search data "Ultimate"
```

### Examen
- Séléctionner une question
```bash
node questionCli.js select <dir> <text>
```
Exemple : 
```bash
node questionCli.js select data "EM U42 Ultimate q2"
```

- Afficher la séléction
```bash
node questionCli.js list
```

- Vider la séléction
```bash
node questionCli.js clear
```

- Exporter un examen
```bash
node questionCli.js export "../exports/examen.gift"  
```

- Simuler un examen
```bash
node questionCli.js simulate "..\exports\examen.gift"
```

### Création d'une fiche VCard enseignants
- Créer une carte enseignante
```bash
node questionCli.js vcard "1.1" "Test" "12/12/2000" "test.test@test.fr" "0123456789" "UTT1" --out "../exports/Vcard.vcf"
```

