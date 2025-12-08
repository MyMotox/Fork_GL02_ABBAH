const fs = require("fs");
const path = require("path");
const realSaveFile = path.join(__dirname, "../../src/utils/selection.json");
const tempSaveFile = path.join(__dirname, "temp_selection.json");

function resetToTempFile() {
    if (fs.existsSync(tempSaveFile)) {
        fs.copyFileSync(tempSaveFile, realSaveFile);
    } else {
        fs.writeFileSync(realSaveFile, "[]", "utf8");
    }
}

describe("ExamSelection class", () => {

    beforeEach(() => {
        fs.writeFileSync(tempSaveFile, "[]", "utf8");
        resetToTempFile();
        delete require.cache[require.resolve("../../src/classes/ExamSelection")];
        ExamSelection = require("../../src/classes/ExamSelection");
    });

    it("vide", () => {
        expect(ExamSelection.list().length).toBe(0);
    });

    it("add question", () => {
        ExamSelection.add({ id: "Q1", text: "Test" });

        const list = ExamSelection.list();
        expect(list.length).toBe(1);
        expect(list[0].id).toBe("Q1");
    });

    it("non doublons", () => {
        ExamSelection.add({ id: "Q1" });

        expect(() => ExamSelection.add({ id: "Q1" }))
            .toThrowError("Question Q1 déjà présente");
    });

    it("clear", () => {
        ExamSelection.add({ id: "Q1" });
        ExamSelection.add({ id: "Q2" });

        ExamSelection.clear();

        expect(ExamSelection.list().length).toBe(0);
    });
});
