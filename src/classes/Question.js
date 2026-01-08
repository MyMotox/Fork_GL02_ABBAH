const Reponse = require('./Reponse');

/**
 *
 * @param {string} id
 * @param {string} text
 * @param {string} type
 * @param {Array<string>} responses
 */
var Question = function (id, text, type, responses) {
    this.id = id;
    this.text = text;
    this.questionType = type;
    this.responses = responses ? [].concat(responses) : [];
};

Question.prototype.getId = function () {
    return this.id;
};

Question.prototype.getText = function () {
    return this.text;
};

Question.prototype.getQuestionType = function () {
    return this.questionType;
};

Question.prototype.getResponses = function () {
    return this.responses;
};

Question.prototype.equal = function (question1, question2) {
    return question1.id === question2.id;
};

Question.prototype.addRep = function (rep) {
    this.responses.push(rep);
}

module.exports = Question;
