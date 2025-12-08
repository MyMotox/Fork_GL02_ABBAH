const Question = require("../../src/classes/Question");
const Reponse = require("../../src/classes/Reponse");

describe("Question class", () => {

    it("possede id, texte et questionType", () => {
        const q = new Question("Q1", "Test ?", "MCQ", []);

        expect(q.getId()).toBe("Q1");
        expect(q.getText()).toBe("Test ?");
        expect(q.getQuestionType()).toBe("MCQ");
        expect(q.getResponses().length).toBe(0);
    });

    it("appRep", () => {
        const q = new Question("Q1", "Test ?", "MCQ", []);

        const rep1 = new Reponse("Yes", true);
        const rep2 = new Reponse("No", false);

        q.addRep(rep1);
        q.addRep(rep2);

        expect(q.getResponses().length).toBe(2);
        expect(q.getResponses()[0].text).toBe("Yes");
        expect(q.getResponses()[0].correct).toBeTrue();
        expect(q.getResponses()[1].text).toBe("No");
        expect(q.getResponses()[1].correct).toBeFalse();
    });

});
