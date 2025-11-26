var Question = require('../classes/Question');
var reponse = require('../classes/Reponse');

var QuestionParser = function(sTokenize, sParsedSymb){
    this.parsedQuestion = [];
    this.symb = ["//","::","{","}","=","~"];
    this.showTokenize = sTokenize;
    this.showParsedSymbols = sParsedSymb;
    this.errorCount = 0;
}

// Parser procedure

// tokenize : tranform the data input into a list
// <eol> = CRLF
QuestionParser.prototype.tokenize = function(data){
    var separator = /(\/\/|::|\{|\}|=|~)/;
    data = data.split(separator);
    data = data.filter((val, idx) => !val.match(separator));
    return data;
}

// parse : analyze data by calling the first non terminal rule of the grammar
QuestionParser.prototype.parse = function(data){
    var tData = this.tokenize(data);
    if(this.showTokenize){
        console.log(tData);
    }
    this.listQuestion(tData);
}

// Parser operand

QuestionParser.prototype.errMsg = function(msg, input){
    this.errorCount++;
    console.log("Parsing Error ! on "+input+" -- msg : "+msg);
}

// Read and return a symbol from input
QuestionParser.prototype.next = function(input){
    var curS = input.shift();
    if(this.showParsedSymbols){
        console.log(curS);
    }
    return curS
}

// accept : verify if the arg s is part of the language symbols.
QuestionParser.prototype.accept = function(s){
    var idx = this.symb.indexOf(s);
    // index 0 exists
    if(idx === -1){
        this.errMsg("symbol "+s+" unknown", [" "]);
        return false;
    }

    return idx;
}



// check : check whether the arg elt is on the head of the list
QuestionParser.prototype.check = function(s, input){
    if(this.accept(input[0]) == this.accept(s)){
        return true;
    }
    return false;
}

// expect : expect the next symbol to be s.
QuestionParser.prototype.expect = function(s, input) {
    if (s == this.next(input)) {
        //console.log("Reckognized! "+s)
        return true;
    } else {
        this.errMsg("symbol " + s + " doesn't match", input);
    }
}

QuestionParser.prototype.question = function(input){
    if (this.check("//", input)){
        this.next(input);
    }

    // console.log(input)

    if(this.check("::", input)){
        // this.expect("::", input);
        var args = this.body(input);
        var p = new Question(args.id, args.text,"", []);
        this.reponses(input, p);
        // this.expect("\r\n",input);
        this.parsedQuestion.push(p);
        if(input.length > 0){
            this.question(input);
        }
        return true;
    }else{
        return false;
    }
}

QuestionParser.prototype.listQuestion = function(input){
    this.question(input);
    // this.expect("$$", input);
}

QuestionParser.prototype.body = function(input){
    var id = this.id(input);
    var text = this.text(input);
    return { id: id, text: text };
}

QuestionParser.prototype.id = function(input){
    this.expect("::",input)
    var curS = this.next(input);
    if(matched = curS.match(/^[a-zA-Z0-9\s_-]+$/)){
        return matched[0];
    }else{
        this.errMsg("Invalid name", input);
    }
}

QuestionParser.prototype.text = function(input){
    this.expect("::",input)
    var curS = this.next(input);
    if(matched = curS.match(/^[a-zA-Z0-9\s_-]+$/)){
        return matched[0];
    }else{
        this.errMsg("Invalid name", input);
    }
}

QuestionParser.prototype.reponses = function (input, curPoi){
    if(this.check("{", input)){
        this.expect("{", input);
        var curS = this.next(input);
        if(matched = curS.match(/^[a-zA-Z0-9\s_-]+$/)){
            curPoi.addRating(matched[0]);
            if(input.length > 0){
                this.reponses(input, curPoi);
            }
        }else{
            this.errMsg("Invalid note");
        }
        this.expect("}", input);
    }
}

module.exports = QuestionParser;