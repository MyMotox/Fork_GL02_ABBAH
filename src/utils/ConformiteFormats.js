/**
 * Utility module to validate .gift and .vcf file formats
 * Ensures files respect syntactic standards before import/usage
 */

/**
 * Validates GIFT (General Import Format Template) file format
 * @param {string} content - File content to validate
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
function validateGiftFormat(content) {
  const errors = [];
  
  if (!content || typeof content !== 'string') {
	errors.push('Content must be a non-empty string');
	return { isValid: false, errors };
  }

  // Check for basic GIFT structure
  const giftQuestionPattern = /^::/m;
  if (!giftQuestionPattern.test(content)) {
	errors.push('GIFT format requires questions starting with ::');
  }

  // Check for balanced braces and brackets
  const openBraces = (content.match(/{/g) || []).length;
  const closeBraces = (content.match(/}/g) || []).length;
  if (openBraces !== closeBraces) {
	errors.push(`Unbalanced braces: ${openBraces} opening, ${closeBraces} closing`);
  }

  return { isValid: errors.length === 0, errors };
}

/**
 * Validates VCF (Virtual Contact File) format
 * @param {string} content - File content to validate
 * @returns {object} - { isValid: boolean, errors: string[] }
 */
function validateVcfFormat(content) {
  const errors = [];
  
  if (!content || typeof content !== 'string') {
	errors.push('Content must be a non-empty string');
	return { isValid: false, errors };
  }

  const lines = content.trim().split('\n');

  // Check BEGIN and END structure
  if (!lines[0]?.includes('BEGIN:VCARD')) {
	errors.push('VCF must start with BEGIN:VCARD');
  }
  if (!lines[lines.length - 1]?.includes('END:VCARD')) {
	errors.push('VCF must end with END:VCARD');
  }

  // Check for required FN property
  if (!content.includes('FN:')) {
	errors.push('VCF requires FN (Full Name) property');
  }

  // Validate VERSION
  if (!content.includes('VERSION:')) {
	errors.push('VCF requires VERSION property');
  }

  // Check property format (KEY:VALUE)
  const invalidLines = lines.filter(line => 
	line.trim() && 
	!line.includes(':') && 
	!line.includes('BEGIN:') && 
	!line.includes('END:')
  );
  if (invalidLines.length > 0) {
	errors.push(`Invalid property format in lines: ${invalidLines.join(', ')}`);
  }

  return { isValid: errors.length === 0, errors };
}

module.exports = {
  validateGiftFormat,
  validateVcfFormat
};
