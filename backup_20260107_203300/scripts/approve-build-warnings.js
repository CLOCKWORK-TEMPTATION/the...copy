#!/usr/bin/env node

/**
 * Build Warning Approval Script
 * 
 * This script analyzes build output and approves expected warnings
 * while flagging unexpected ones for review.
 */

const fs = require('fs');
const path = require('path');

// Expected warning patterns that are safe to ignore
const EXPECTED_WARNINGS = [
  // OpenTelemetry critical dependency warnings
  /Critical dependency: the request of a dependency is an expression.*@opentelemetry/,
  /Critical dependency: require function is used in a way.*require-in-the-middle/,
  
  // Sentry related warnings
  /Critical dependency.*@sentry/,
  
  // ESLint deprecated options
  /ESLint: Invalid Options.*extensions.*has been removed/,
  /Unknown options: useEslintrc, extensions/,
];

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${colors[color]}${message}${colors.reset}`);
  }
}

function analyzeWarnings(buildOutput) {
  const lines = buildOutput.split('\n');
  const warnings = [];
  const errors = [];
  
  let currentWarning = '';
  let isWarning = false;
  
  for (const line of lines) {
    // Detect warning start
    if (line.includes('Critical dependency:') || line.includes('ESLint: Invalid Options')) {
      isWarning = true;
      currentWarning = line;
    } else if (isWarning && line.trim() === '') {
      // Warning ended
      if (currentWarning) {
        warnings.push(currentWarning);
        currentWarning = '';
      }
      isWarning = false;
    } else if (isWarning) {
      // Continue building warning message
      currentWarning += '\n' + line;
    }
    
    // Detect errors
    if (line.includes('Error:') || line.includes('Failed to compile')) {
      errors.push(line);
    }
  }
  
  // Add last warning if exists
  if (currentWarning) {
    warnings.push(currentWarning);
  }
  
  return { warnings, errors };
}

function categorizeWarnings(warnings) {
  const expected = [];
  const unexpected = [];
  
  for (const warning of warnings) {
    const isExpected = EXPECTED_WARNINGS.some(pattern => pattern.test(warning));
    
    if (isExpected) {
      expected.push(warning);
    } else {
      unexpected.push(warning);
    }
  }
  
  return { expected, unexpected };
}

function main() {
  log('🔍 Analyzing build warnings...', 'blue');
  
  // Read build output from stdin if available, otherwise use sample
  let buildOutput = '';
  
  if (process.argv[2]) {
    // Read from file if provided
    try {
      buildOutput = fs.readFileSync(process.argv[2], 'utf8');
    } catch (error) {
      log(`❌ Could not read file: ${process.argv[2]}`, 'red');
      process.exit(1);
    }
  } else {
    // Read from stdin
    process.stdin.setEncoding('utf8');
    process.stdin.on('readable', () => {
      const chunk = process.stdin.read();
      if (chunk !== null) {
        buildOutput += chunk;
      }
    });
    
    process.stdin.on('end', () => {
      processOutput(buildOutput);
    });
    
    return;
  }
  
  processOutput(buildOutput);
}

function processOutput(buildOutput) {
  const { warnings, errors } = analyzeWarnings(buildOutput);
  
  if (errors.length > 0) {
    log('❌ Build errors detected:', 'red');
    errors.forEach(error => log(`  ${error}`, 'red'));
    process.exit(1);
  }
  
  if (warnings.length === 0) {
    log('✅ No warnings detected - build is clean!', 'green');
    process.exit(0);
  }
  
  const { expected, unexpected } = categorizeWarnings(warnings);
  
  log(`\n📊 Warning Analysis:`, 'bold');
  log(`  Total warnings: ${warnings.length}`, 'blue');
  log(`  Expected warnings: ${expected.length}`, 'green');
  log(`  Unexpected warnings: ${unexpected.length}`, unexpected.length > 0 ? 'red' : 'green');
  
  if (expected.length > 0) {
    log('\n✅ Expected warnings (approved):', 'green');
    expected.forEach((warning, index) => {
      const preview = warning.split('\n')[0].substring(0, 80) + '...';
      log(`  ${index + 1}. ${preview}`, 'yellow');
    });
  }
  
  if (unexpected.length > 0) {
    log('\n⚠️  Unexpected warnings (require review):', 'red');
    unexpected.forEach((warning, index) => {
      log(`  ${index + 1}. ${warning}`, 'red');
    });
    
    log('\n❌ Build approval failed due to unexpected warnings', 'red');
    log('Please review the warnings above and update the approval script if they are safe to ignore.', 'yellow');
    process.exit(1);
  }
  
  log('\n🎉 All warnings are expected and approved!', 'green');
  log('Build can proceed safely.', 'green');
  process.exit(0);
}

// Handle direct execution
if (require.main === module) {
  main();
}

module.exports = { analyzeWarnings, categorizeWarnings };