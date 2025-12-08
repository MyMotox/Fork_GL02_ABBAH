const Teacher = require("../../src/classes/Teacher");

describe("Teacher class", () => {

    it("champs valides", () => {
        const t = new Teacher(
            "test",
            "12/12/2000",
            "test@test.fr",
            "0123456789",
            "UTT"
        );

        expect(t.firstName).toBe("test");
        expect(t.bday).toBe("12/12/2000");
        expect(t.email).toBe("test@test.fr");
        expect(t.tel).toBe("0123456789");
        expect(t.org).toBe("UTT");
    });

    it("correct Teacher", () => {
        const t = new Teacher(
            "test",
            "01/01/1999",
            "test@example.com",
            "0123456789",
            "UTT"
        );

        const errors = t.validate();
        expect(errors.length).toBe(0);
    });

    it("invalid Teacher", () => {
        const t = new Teacher(
            "",              // invalide
            "31-12-2000",    // invalide 
            "pasbonmail",  // invalide
            "123",           // invalide
            ""               // invalide
        );

        const errors = t.validate();

        expect(errors.length).toBe(5);
    });

});
