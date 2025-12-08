const fs = require('fs');
//Nécessaire de mettre le chemin du ficher
function VerifSecureGIFT (GFilePath) {

    if (!GFilePath.endsWith('.gift')) {
        throw new Error('Le fichier doit être au format .gift');
    }

    if (!fs.existsSync(GFilePath)) {
        throw new Error('Le fichier n\'a pas été trouvé, veillez vérifier le chemin: ${GFilePath}');
    }

    if (!fs.readFileSync(GFilePath, 'utf-8')) {
        throw new Error('Le fichier est vide');
    }

    console.log('Les données sont bien sécurisées!');
}

function VerifSecureVCARD (VFilePath) {

    if (fullPath.endsWith('.vcf') || fullPath.endsWith('.vcard')) {
        throw new Error('Le fichier doit avoir une extension .vcf ou .vcard');
    }

    if (!fs.existsSync(VFilePath)) {
        throw new Error('Le fichier n\'a pas été trouvé, veillez vérifier le chemin: ${VFilePath}');
    }

    if (!fs.readFileSync(VFilePath, 'utf-8')) {
        throw new Error('Le fichier est vide');
    }

    console.log('Les données sont bien sécurisées!');
}

module.exports = { 
    VerifSecureGIFT, 
    VerifSecureVCARD 
};