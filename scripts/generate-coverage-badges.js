#!/usr/bin/env node

/**
 * Coverage Badge Generator
 * 
 * Generates coverage badges in SVG format and saves them to .github/badges
 * Supports shield.io style badges for coverage metrics
 */

const fs = require('fs');
const path = require('path');

const BADGES_DIR = path.join(__dirname, '../.github/badges');
const COVERAGE_DIRS = {
  frontend: path.join(__dirname, '../frontend/coverage/coverage-summary.json'),
  backend: path.join(__dirname, '../backend/coverage/coverage-summary.json'),
};

// Ensure badges directory exists
if (!fs.existsSync(BADGES_DIR)) {
  fs.mkdirSync(BADGES_DIR, { recursive: true });
}

/**
 * Get color based on coverage percentage
 */
function getColor(percentage) {
  if (percentage >= 90) return '4c1'; // green
  if (percentage >= 80) return 'dfb317'; // yellow
  if (percentage >= 70) return 'fe7d37'; // orange
  return 'e05d44'; // red
}

/**
 * Generate SVG badge
 */
function generateBadge(label, message, color) {
  const labelWidth = label.length * 6 + 10;
  const messageWidth = message.length * 6 + 10;
  const totalWidth = labelWidth + messageWidth;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${totalWidth}" height="20" role="img" aria-label="${label}: ${message}">
    <title>${label}: ${message}</title>
    <linearGradient id="s" x2="0" y2="100%">
      <stop offset="0" stop-color="#bbb"/>
      <stop offset="1" stop-color="#999"/>
    </linearGradient>
    <clipPath id="r">
      <rect width="${totalWidth}" height="20" rx="3" fill="#fff"/>
    </clipPath>
    <g clip-path="url(#r)">
      <rect width="${labelWidth}" height="20" fill="#555"/>
      <rect x="${labelWidth}" width="${messageWidth}" height="20" fill="#${color}"/>
      <rect width="${totalWidth}" height="20" fill="url(#s)"/>
    </g>
    <g fill="#fff" text-anchor="middle" font-family="Verdana,Geneva,DejaVu Sans,sans-serif" text-rendering="geometricPrecision" font-size="110">
      <text aria-hidden="true" x="${(labelWidth * 10 + 50) / 2}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(labelWidth - 10) * 10}">${label}</text>
      <text x="${(labelWidth * 10 + 50) / 2}" y="140" transform="scale(.1)" fill="#fff" textLength="${(labelWidth - 10) * 10}">${label}</text>
      <text aria-hidden="true" x="${(labelWidth * 10 + messageWidth * 10 + 50) / 2}" y="150" fill="#010101" fill-opacity=".3" transform="scale(.1)" textLength="${(messageWidth - 10) * 10}">${message}</text>
      <text x="${(labelWidth * 10 + messageWidth * 10 + 50) / 2}" y="140" transform="scale(.1)" fill="#fff" textLength="${(messageWidth - 10) * 10}">${message}</text>
    </g>
  </svg>`;
}

/**
 * Process coverage report and generate badges
 */
function processCoverage(name, coveragePath) {
  try {
    if (!fs.existsSync(coveragePath)) {
      console.warn(`⚠️  Coverage file not found for ${name}`);
      return;
    }

    const coverage = JSON.parse(fs.readFileSync(coveragePath, 'utf8'));
    const total = coverage.total;

    const metrics = {
      lines: total.lines.pct,
      functions: total.functions.pct,
      branches: total.branches.pct,
      statements: total.statements.pct,
    };

    // Generate individual badges
    Object.entries(metrics).forEach(([metric, value]) => {
      const badgeContent = generateBadge(
        `${name} ${metric}`,
        `${value.toFixed(2)}%`,
        getColor(value)
      );

      const badgePath = path.join(BADGES_DIR, `${name}-${metric}.svg`);
      fs.writeFileSync(badgePath, badgeContent);
      console.log(`✅ Generated badge for ${metric}`);
    });

    // Generate combined badge
    const avgCoverage =
      (metrics.lines + metrics.functions + metrics.branches + metrics.statements) / 4;
    const badgeContent = generateBadge(
      `${name} coverage`,
      `${avgCoverage.toFixed(2)}%`,
      getColor(avgCoverage)
    );

    const badgePath = path.join(BADGES_DIR, `${name}-coverage.svg`);
    fs.writeFileSync(badgePath, badgeContent);
    console.log(`✅ Generated coverage badge`);

    return {
      name,
      metrics,
      average: avgCoverage,
    };
  } catch (error) {
    console.error(`❌ Error processing ${name} coverage`);
    return null;
  }
}

/**
 * Generate README badge references
 */
function generateBadgeReferences(coverageData) {
  const references = [];

  coverageData.forEach((data) => {
    if (data) {
      references.push(`
## ${data.name.charAt(0).toUpperCase() + data.name.slice(1)} Coverage

![${data.name}-lines](https://raw.githubusercontent.com/YOUR-ORG/YOUR-REPO/main/.github/badges/${data.name}-lines.svg)
![${data.name}-functions](https://raw.githubusercontent.com/YOUR-ORG/YOUR-REPO/main/.github/badges/${data.name}-functions.svg)
![${data.name}-branches](https://raw.githubusercontent.com/YOUR-ORG/YOUR-REPO/main/.github/badges/${data.name}-branches.svg)
![${data.name}-statements](https://raw.githubusercontent.com/YOUR-ORG/YOUR-REPO/main/.github/badges/${data.name}-statements.svg)

**Overall Coverage:** ![${data.name}-coverage](https://raw.githubusercontent.com/YOUR-ORG/YOUR-REPO/main/.github/badges/${data.name}-coverage.svg)

- **Lines:** ${data.metrics.lines.toFixed(2)}% / 85% target
- **Functions:** ${data.metrics.functions.toFixed(2)}% / 85% target
- **Branches:** ${data.metrics.branches.toFixed(2)}% / 80% target
- **Statements:** ${data.metrics.statements.toFixed(2)}% / 85% target
`);
    }
  });

  return references.join('\n');
}

// Main execution
console.log('🎨 Generating coverage badges...\n');

const coverageData = Object.entries(COVERAGE_DIRS).map(([name, path]) =>
  processCoverage(name, path)
);

console.log('\n✅ All badges generated successfully!\n');
console.log('Use these references in your README.md:\n');
console.log(generateBadgeReferences(coverageData));

// Output summary
const validCoverage = coverageData.filter((d) => d !== null);
if (validCoverage.length > 0) {
  console.log('\n📊 Coverage Summary:');
  validCoverage.forEach((data) => {
    console.log(`  Coverage: ${data.average.toFixed(2)}%`);
  });
}
