// Validation reporting utilities

/**
 * Report circular reference errors
 */
function reportCircularReferences(issues) {
  if (issues.circular.length === 0) {
    return false;
  }
  
  console.error('❌ Circular references found:');
  issues.circular.forEach(({ token, path }) => {
    console.log("🚀 ~ reportCircularReferences ~ path:", path)
    console.error(`   ${path.join(' → ')}`);
  });
  return true;
}

/**
 * Report self-reference errors
 */
function reportSelfReferences(issues) {
  if (issues.selfReference.length === 0) {
    return false;
  }
  
  console.error('❌ Self-references found:');
  issues.selfReference.forEach(token => {
    console.error(`   ${token} references itself`);
  });
  return true;
}

/**
 * Report missing reference warnings
 */
function reportMissingReferences(issues, failOnWarnings) {
  if (issues.missingReference.length === 0) {
    return false;
  }
  
  console.error('❌   Missing references:');
  issues.missingReference.forEach(({ token, missingRef }) => {
    console.error(`   ${token} references non-existent token: ${missingRef}`);
  });
  
  return failOnWarnings;
}

/**
 * Report deep nesting information
 */
function reportDeepNesting(issues, isVerbose) {
  if (issues.deepNesting.length > 0 && isVerbose) {
    console.log('ℹ️  Deeply nested tokens:');
    issues.deepNesting.forEach(({ token, depth }) => {
      console.log(`   ${token} has nesting depth of ${depth}`);
    });
  }
}

/**
 * Report invalid modifier warnings
 */
function reportInvalidModifiers(issues, failOnWarnings) {
  if (issues.invalidModifiers.length === 0) {
    return false;
  }
  
  console.warn('⚠️  Invalid modifiers:');
  issues.invalidModifiers.forEach(({ token, modifier }) => {
    console.warn(`   ${token} has invalid modifier: ${modifier}`);
  });
  
  return failOnWarnings;
}

/**
 * Report all validation issues
 */
function reportValidationIssues(issues, buildConfig) {
  let hasErrors = false;
  
  hasErrors = reportCircularReferences(issues) || hasErrors;
  hasErrors = reportSelfReferences(issues) || hasErrors;
  hasErrors = reportMissingReferences(issues, buildConfig.failOnWarnings) || hasErrors;
  reportDeepNesting(issues, buildConfig.verbose);
  hasErrors = reportInvalidModifiers(issues, buildConfig.failOnWarnings) || hasErrors;
  
  return hasErrors;
}

module.exports = {
  reportValidationIssues,
  reportCircularReferences,
  reportSelfReferences,
  reportMissingReferences,
  reportDeepNesting,
  reportInvalidModifiers
};