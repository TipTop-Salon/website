#!/usr/bin/env node

/**
 * Tiptop Shears & Nails - System Docs Sync Utility
 * Checks and syncs documentation from https://github.com/TipTop-Salon/Tiptop-System-Docs
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const REPO_OWNER = 'TipTop-Salon';
const REPO_NAME = 'Tiptop-System-Docs';
const GITHUB_API = 'https://api.github.com';
const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';

async function checkSystemDocs() {
  console.log(`\n🔍 Checking repository: https://github.com/${REPO_OWNER}/${REPO_NAME}...`);

  const docsDir = path.resolve(process.cwd(), 'system_docs');

  // If local git clone exists, perform git pull
  if (fs.existsSync(path.join(docsDir, '.git'))) {
    console.log(`📦 Local git clone detected in ./system_docs`);
    try {
      const pullOutput = execSync('git pull origin main', { cwd: docsDir, encoding: 'utf8' });
      console.log(`📥 Git sync: ${pullOutput.trim()}`);
      
      const logOutput = execSync('git log -n 3 --pretty=format:"   - [%h] %s (%cr by %an)"', { cwd: docsDir, encoding: 'utf8' });
      console.log(`\n📝 Latest Commits in system_docs:\n${logOutput}`);
    } catch (e) {
      console.warn(`⚠️ Git pull failed, falling back to API: ${e.message}`);
    }
  }

  const headers = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'Tiptop-Docs-Sync'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${GITHUB_API}/repos/${REPO_OWNER}/${REPO_NAME}`, { headers });
    
    if (res.status === 404) {
      console.warn(`\n⚠️  Repository returned HTTP 404 Not Found.`);
      return;
    }

    if (!res.ok) {
      console.error(`❌ GitHub API returned HTTP ${res.status}: ${res.statusText}`);
      return;
    }

    const repoData = await res.json();
    console.log(`\n✅ Repository Connected: ${repoData.full_name}`);
    console.log(`   Visibility: ${repoData.visibility}`);
    console.log(`   Default branch: ${repoData.default_branch}`);
    console.log(`   Last pushed: ${repoData.pushed_at}`);

    // Scan questions directory for open questions
    const questionsDir = path.join(docsDir, 'questions');
    if (fs.existsSync(questionsDir)) {
      const qFiles = fs.readdirSync(questionsDir).filter(f => f.endsWith('.md') && f !== 'README.md' && f !== 'TEMPLATE.md');
      console.log(`\n❓ Registered Cross-Platform Questions (${qFiles.length}):`);
      for (const qf of qFiles) {
        const content = fs.readFileSync(path.join(questionsDir, qf), 'utf8');
        const firstLine = content.split('\n')[0].replace(/^#\s*/, '');
        const statusMatch = content.match(/-\s*Status:\s*([^\n]+)/i);
        const status = statusMatch ? statusMatch[1].trim() : 'unknown';
        console.log(`   • [${status.toUpperCase()}] ${qf}: ${firstLine}`);
      }
    }

  } catch (err) {
    console.error('❌ Failed to connect to GitHub:', err.message);
  }
}

checkSystemDocs();
