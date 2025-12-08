const GiftParser = require("../../src/parsers/GiftParser");
const Question = require("../../src/classes/Question");
const Reponse = require("../../src/classes/Reponse");

describe("GiftParser", () => {

    it("parse GIFT question", () => {
        const parser = new GiftParser();

        const gift = `
            ::Q1:: 2+2? {
                =4
                ~3
                ~5
            }
        `;

        const questions = parser.parseGift(gift);
        expect(questions.length).toBe(1);
        const q = questions[0];

        expect(q instanceof Question).toBeTrue();
        expect(q.id).toBe("Q1");
        expect(q.text).toBe("2+2?");
        expect(q.getQuestionType()).toBe("multichoice");

        expect(q.responses.length).toBe(3);
        expect(q.responses[0] instanceof Reponse).toBeTrue();
        expect(q.responses[0].text).toBe("4");
        expect(q.responses[0].correct).toBeTrue();
    });

    it("parse plusieurs questions", () => {
        const parser = new GiftParser();

        const gift = `
            ::Q1:: Avant? {
                =A
                ~B
            }
            ::Q2:: Ensuite? {
                =C
                ~D
            }
        `;
        const questions = parser.parseGift(gift);
        expect(questions.length).toBe(2);
        expect(questions[0].id).toBe("Q1");
        expect(questions[1].id).toBe("Q2");
    });

    it("fichier introuvable", () => {
        const parser = new GiftParser();
        expect(() => {
            parser.parseFile("fichier/pas/trouvable.gift");
        }).toThrowError(/introuvable/);
    });
});
