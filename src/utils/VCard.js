const fs = require("fs");

function generateVCard(version,teacher) {
    const lines = [
        "BEGIN:VCARD",
        `VERSION:${version}`,
        `FN:${teacher.firstName}`, // que le prénom car le cdc l'a voulu
        `BDAY:${teacher.bday}`,
        `EMAIL:${teacher.email}`,
        `TEL:${teacher.tel}`,
        `ORG:${teacher.org}`,
        "END:VCARD"
    ];

    return lines.join("\r\n") + "\r\n";
}


function writeVCardFile(teacher, version, outPath) {
    const vcard = generateVCard(version,teacher); // fonction accesible que d'ici
    fs.writeFileSync(outPath,vcard,"utf8");
}

module.exports = {
    writeVCardFile
};