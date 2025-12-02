/**
 *
 * @param {string} birthday
 * @param {string} firstname
 * @param {string} telephone
 * @param {string} mail
 * @param {string} location
 */
var Teacher = function(firstname, birthday, mail, telephone, location) {
    this.firstName = firstname;     
    this.bday = birthday; 
    this.email = mail;       
    this.tel = telephone;           
    this.org = location;   
};

Teacher.prototype.validate = function() {
    var errors = [];

    // TEXT
    if (!this.firstName || this.firstName.trim() === "") {
        errors.push("First name is required.");
    }

    // date = 2*DIGIT “/” 2*DIGIT “/” 4*DIGIT
    var dateRegex = /^\d{2}\/\d{2}\/\d{4}$/;
    if (!this.bday || !dateRegex.test(this.bday)) {
        errors.push("Birthday must follow the format DD/MM/YYYY.");
    }

    // mail = TEXT “@” TEXT “.” TEXT
    var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!this.email || !emailRegex.test(this.email)) {
        errors.push("Email must match TEXT@TEXT.TEXT.");
    }

    // tel = 10*DIGIT
    var telRegex = /^\d{10}$/;
    if (!this.tel || !telRegex.test(this.tel)) {
        errors.push("Telephone number must be exactly 10 digits.");
    }

    // TEXT
    if (!this.org || this.org.trim() === "") {
        errors.push("Organization is required.");
    }

    return errors;
};

module.exports = Teacher;
