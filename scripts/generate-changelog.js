#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

/**
 * Generate changelog from git commits
 * @param {string} fromTag - Starting tag (optional)
 * @param {string} toTag - Ending tag (default: HEAD)
 * @returns {string} Formatted changelog
 */
function generateChangelog(fromTag = null, toTag = 'HEAD') {
  try {
    // Get git log command
    const gitRange = fromTag ? `${fromTag}..${toTag}` : toTag;
    const gitLogCommand = `git log ${gitRange} --pretty=format:"%h|%s|%an|%ad" --date=short --no-merges`;
    
    console.log(`Generating changelog for range: ${gitRange}`);
    
    // Execute git log
    const gitOutput = execSync(gitLogCommand, { encoding: 'utf8' }).trim();
    
    if (!gitOutput) {
      return '### No changes found in this release.';
    }
    
    // Parse commits
    const commits = gitOutput.split('\n').map(line => {
      const [hash, subject, author, date] = line.split('|');
      return { hash, subject, author, date };
    });
    
    // Categorize commits
    const categories = {
      features: [],
      fixes: [],
      improvements: [],
      docs: [],
      chore: [],
      other: []
    };
    
    commits.forEach(commit => {
      const subject = commit.subject.toLowerCase();
      
      if (subject.includes('feat') || subject.includes('add') || subject.includes('new')) {
        categories.features.push(commit);
      } else if (subject.includes('fix') || subject.includes('bug') || subject.includes('resolve')) {
        categories.fixes.push(commit);
      } else if (subject.includes('improve') || subject.includes('enhance') || subject.includes('update') || subject.includes('optimize')) {
        categories.improvements.push(commit);
      } else if (subject.includes('doc') || subject.includes('readme')) {
        categories.docs.push(commit);
      } else if (subject.includes('chore') || subject.includes('build') || subject.includes('ci') || subject.includes('test')) {
        categories.chore.push(commit);
      } else {
        categories.other.push(commit);
      }
    });
    
    // Generate changelog sections
    let changelog = '';
    
    if (categories.features.length > 0) {
      changelog += '### ✨ New Features\n';
      categories.features.forEach(commit => {
        changelog += `- ${commit.subject} ([${commit.hash}](../../commit/${commit.hash}))\n`;
      });
      changelog += '\n';
    }
    
    if (categories.improvements.length > 0) {
      changelog += '### 🚀 Improvements\n';
      categories.improvements.forEach(commit => {
        changelog += `- ${commit.subject} ([${commit.hash}](../../commit/${commit.hash}))\n`;
      });
      changelog += '\n';
    }
    
    if (categories.fixes.length > 0) {
      changelog += '### 🐛 Bug Fixes\n';
      categories.fixes.forEach(commit => {
        changelog += `- ${commit.subject} ([${commit.hash}](../../commit/${commit.hash}))\n`;
      });
      changelog += '\n';
    }
    
    if (categories.docs.length > 0) {
      changelog += '### 📚 Documentation\n';
      categories.docs.forEach(commit => {
        changelog += `- ${commit.subject} ([${commit.hash}](../../commit/${commit.hash}))\n`;
      });
      changelog += '\n';
    }
    
    if (categories.chore.length > 0) {
      changelog += '### 🔧 Maintenance\n';
      categories.chore.forEach(commit => {
        changelog += `- ${commit.subject} ([${commit.hash}](../../commit/${commit.hash}))\n`;
      });
      changelog += '\n';
    }
    
    if (categories.other.length > 0) {
      changelog += '### 📝 Other Changes\n';
      categories.other.forEach(commit => {
        changelog += `- ${commit.subject} ([${commit.hash}](../../commit/${commit.hash}))\n`;
      });
      changelog += '\n';
    }
    
    // Add contributors
    const contributors = [...new Set(commits.map(c => c.author))];
    if (contributors.length > 0) {
      changelog += '### 👥 Contributors\n';
      contributors.forEach(contributor => {
        changelog += `- ${contributor}\n`;
      });
      changelog += '\n';
    }
    
    return changelog;
    
  } catch (error) {
    console.error('Error generating changelog:', error.message);
    return '### Error generating changelog. Please check git history.';
  }
}

/**
 * Get the latest git tag
 * @returns {string|null} Latest tag or null if no tags exist
 */
function getLatestTag() {
  try {
    return execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
  } catch (error) {
    return null;
  }
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const fromTag = args[0] || getLatestTag();
  const toTag = args[1] || 'HEAD';
  const outputFile = args[2];
  
  console.log('🔄 Generating changelog...');
  console.log(`From: ${fromTag || 'beginning'}`);
  console.log(`To: ${toTag}`);
  
  const changelog = generateChangelog(fromTag, toTag);
  
  if (outputFile) {
    fs.writeFileSync(outputFile, changelog);
    console.log(`✅ Changelog written to ${outputFile}`);
  } else {
    console.log('\n📝 Generated Changelog:\n');
    console.log(changelog);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateChangelog, getLatestTag }; 