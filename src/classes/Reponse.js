/**
 *
 * @param {string} text
 * @param {boolean} correct
 * @param {string} feedback
 */
var Reponse = function(text, correct, feedback){
    this.text = text;
    this.correct = correct;
    this.feedback = feedback;
};

module.exports = Reponse;