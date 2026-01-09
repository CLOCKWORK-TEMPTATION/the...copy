/**
 * Example: Generate Production Readiness Report with AI
 * 
 * This example shows how to use the Production Readiness Report Generator
 * with an AI service (OpenAI GPT-4 or Google Gemini) to get a complete
 * assessment of your repository.
 */

import { ReadinessService } from './readiness.service.js';
import { RepositoryAnalysisService } from './repository-analysis.service.js';
import { PromptGeneratorService } from './prompt-generator.service.js';

// Initialize services
const repositoryAnalysisService = new RepositoryAnalysisService();
const promptGeneratorService = new PromptGeneratorService();
const readinessService = new ReadinessService(
  repositoryAnalysisService,
  promptGeneratorService
);

async function generateProductionReadinessReport() {
  console.log('🔍 Analyzing repository...\n');

  // Step 1: Generate analysis and prompt
  const report = await readinessService.generateReport(
    'CLOCKWORK-TEMPTATION',
    'breakbreak',
    process.cwd().replace('/apps/backend', '')
  );

  console.log('📊 Repository Analysis Complete:');
  console.log(`   Repository: ${report.metadata.repository}`);
  console.log(`   Languages: ${report.metadata.primaryLanguages.join(', ')}`);
  console.log(`   Date: ${report.metadata.reportDate}`);
  console.log('');

  console.log('📦 Detected Files:');
  console.log(`   package.json: ${report.analysisData?.hasPackageJson ? '✓' : '✗'}`);
  console.log(`   Dockerfile: ${report.analysisData?.hasDockerfile ? '✓' : '✗'}`);
  console.log(`   Tests: ${report.analysisData?.hasTests ? '✓' : '✗'}`);
  console.log(`   CI/CD: ${report.analysisData?.hasCI ? '✓' : '✗'}`);
  console.log(`   README: ${report.analysisData?.hasReadme ? '✓' : '✗'}`);
  console.log('');

  // Step 2: Use the prompt with an AI service
  console.log('📝 AI Prompt Generated:');
  console.log(`   Length: ${report.prompt?.length || 0} characters`);
  console.log('');

  // Example with OpenAI (uncomment and add API key to use)
  /*
  const OpenAI = require('openai');
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  console.log('🤖 Sending to OpenAI GPT-4...\n');

  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "You are an expert engineering consultant specializing in production readiness assessments."
      },
      {
        role: "user",
        content: report.prompt
      }
    ],
    temperature: 0.3,
    max_tokens: 4000,
  });

  const fullReport = JSON.parse(completion.choices[0].message.content);
  
  console.log('✅ Production Readiness Report Generated!\n');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('Summary:', fullReport.summary);
  console.log('Overall Status:', fullReport.overallStatus);
  console.log('Overall Score:', fullReport.overallScore);
  console.log('Readiness Level:', fullReport.readinessLevel);
  console.log('═══════════════════════════════════════════════════════════\n');

  console.log('Domains Evaluated:');
  fullReport.domains.forEach(domain => {
    console.log(`${domain.id}. ${domain.title}: ${domain.status} (${domain.score})`);
  });

  console.log('\nCritical Issues:', fullReport.criticalIssues.length);
  fullReport.criticalIssues.forEach(issue => {
    console.log(`  - [${issue.priority}] ${issue.domain}: ${issue.issue}`);
  });

  // Save the full report
  const fs = require('fs');
  fs.writeFileSync(
    'production-readiness-report.json',
    JSON.stringify(fullReport, null, 2)
  );

  console.log('\n📄 Full report saved to: production-readiness-report.json');
  */

  // Example with Google Gemini (uncomment and add API key to use)
  /*
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  console.log('🤖 Sending to Google Gemini...\n');

  const result = await model.generateContent(report.prompt);
  const response = await result.response;
  const fullReport = JSON.parse(response.text());

  console.log('✅ Production Readiness Report Generated!\n');
  // ... (same output handling as OpenAI example)
  */

  // For now, just save the prompt and analysis
  const fs = require('fs');
  if (report.prompt) {
    fs.writeFileSync(
      'readiness-prompt.txt',
      report.prompt
    );
  }
  
  fs.writeFileSync(
    'readiness-analysis.json',
    JSON.stringify({
      metadata: report.metadata,
      analysisData: report.analysisData
    }, null, 2)
  );

  console.log('✅ Files Generated:');
  console.log('   📝 readiness-prompt.txt - Use this prompt with an AI service');
  console.log('   📊 readiness-analysis.json - Repository analysis data');
  console.log('');
  console.log('💡 Next Steps:');
  console.log('   1. Copy the prompt from readiness-prompt.txt');
  console.log('   2. Use it with ChatGPT, Gemini, or Claude');
  console.log('   3. Get a comprehensive production readiness assessment in Arabic');
  console.log('');

  return report;
}

// Run if executed directly
if (require.main === module) {
  generateProductionReadinessReport()
    .then(() => {
      console.log('Done! ✨');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Error:', error);
      process.exit(1);
    });
}

export { generateProductionReadinessReport };
