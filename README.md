# Projet GL02 - Groupe ABBAH


Notre projet est développé en JavaScript (Node.js) dans le cadre du cours GL02 – Fondements de l'ingénierie logicielle.
Le code est structuré pour répondre directement au cahier des charges d'une application console "Outil de gestion еt dе génération d’еxamеns au format GIFT".

---

## 1. Installation (à la première utilisation)

```bash
npm install         # installe les dépendances
npm link            # rend les commandes bin accessibles depuis le terminal
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