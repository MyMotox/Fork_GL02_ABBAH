const fs = require('fs');
const path = require('path');

const SAVE_FILE = path.join(__dirname, "../utils/selection.json");

class ExamSelection {

    constructor() {
    try {
        if (fs.existsSync(SAVE_FILE)) {
            const nempty = fs.readFileSync(SAVE_FILE, "utf8").trim();

            // fichier vide
            if (nempty.length === 0) {
                this.selected = [];
            } else {
                this.selected = JSON.parse(nempty);
            }

        } else {
            this.selected = [];
        }

    } catch (e) {
        console.error("Erreur lors du chargement de selection.json :", e);
        this.selected = [];
    }
}


    save() {
        fs.writeFileSync(SAVE_FILE, JSON.stringify(this.selected, null, 2), "utf8");
    }

    add(question) {
        if (this.selected.some(q => q.id === question.id)) {
            throw new Error(`Question ${question.id} déjà présente`); // F7
        }
        this.selected.push(question);
        this.save();
    }

    list() {
        return this.selected;
    }

    clear() {
        this.selected = [];
        this.save();
    }
}

module.exports = new ExamSelection();
