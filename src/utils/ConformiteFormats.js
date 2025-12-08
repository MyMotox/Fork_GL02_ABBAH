/**
 * Utility module to validate .gift and .vcf file formats
 * Returns { isValid: boolean, errors: string[] }
 */

function checkGift(content) {
  const errs = [];
  if (!content || typeof content !== 'string') {
    errs.push('Content must be a non-empty string');
    return { isValid: false, errors: errs };
  }

  const lines = content.split('\n');
  let foundQuestion = false;
  let braceCount = 0;

  lines.forEach((line, idx) => {
    const txt = line.trim();
    if (txt === '') return; // allow empty lines
    if (txt.startsWith('//')) return; // allow comments

    if (txt.startsWith('::')) {
      foundQuestion = true;
      if (!/^::[A-Za-z0-9_\-\s]+::\s.+\s\{$/.test(txt)) {
        errs.push(`Line ${idx + 1}: invalid GIFT question header`);
      }
      braceCount++;
      return;
    }

    // Answer line
    if (/^(=|~)\s.+?(?:\s#.*)?$/.test(txt)) return;

    if (txt === '}') {
      braceCount--;
      return;
    }

    errs.push(`Line ${idx + 1}: invalid GIFT syntax`);
  });


  if (braceCount !== 0) errs.push('Unbalanced braces in GIFT file');

  return { isValid: errs.length === 0, errors: errs };
}

function checkVcf(content) {
  const errs = [];
  if (!content || typeof content !== 'string') {
    errs.push('Content must be a non-empty string');
    return { isValid: false, errors: errs };
  }

  const lines = content.trim().split('\n');

  if (!lines[0]?.startsWith('BEGIN:VCARD')) errs.push('Must start with BEGIN:VCARD');
  if (!lines[lines.length - 1]?.startsWith('END:VCARD')) errs.push('Must end with END:VCARD');

  if (!/^VERSION:\d+\.\d+$/m.test(content)) errs.push('VERSION:x.y required');
  if (!/^FN:.+/m.test(content)) errs.push('FN property required');
  if (!/^EMAIL:[^@\s]+@[^@\s]+\.[^@\s]+$/m.test(content)) errs.push('Valid EMAIL property required');
  if (!/^TEL:\d{10}$/m.test(content)) errs.push('TEL must contain 10 digits');
  if (!/^ORG:.+/m.test(content)) errs.push('ORG property required');

  if (/^BDAY:.+/m.test(content) && !/^BDAY:\d{2}\/\d{2}\/\d{4}$/m.test(content)) {
    errs.push('BDAY must be in DD/MM/YYYY format');
  }

  return { isValid: errs.length === 0, errors: errs };
}

module.exports = {
  checkGift,
  checkVcf
};
