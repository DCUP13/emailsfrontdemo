import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

// Files and directories to exclude
const excludeList = [
  'node_modules',
  'dist',
  '.git',
  '.bolt',
  '.env',
  '.env.local',
  '.env.development',
  '.env.production',
];

// Create README.md content
const readmeContent = `# Email Campaign Manager

A modern email campaign management system built with React, TypeScript, and Supabase.

## Features

- Campaign Management
- Template Editor
- Email Provider Integration (Amazon SES & Gmail)
- Contact Management
- Dark Mode Support
- Responsive Design

## Tech Stack

- React
- TypeScript
- Vite
- Tailwind CSS
- Supabase
- Lucide Icons

## Getting Started

1. Clone the repository
2. Install dependencies:
   \`\`\`bash
   npm install
   \`\`\`
3. Create a Supabase project and update the environment variables:
   \`\`\`env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   \`\`\`
4. Run the development server:
   \`\`\`bash
   npm run dev
   \`\`\`

## Environment Variables

Create a \`.env\` file in the root directory with the following variables:

\`\`\`env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
\`\`\`

## Database Setup

The application uses Supabase as its database. Run the migration files in the \`supabase/migrations\` directory to set up the database schema.

## License

MIT
`;

// Create .gitignore content
const gitignoreContent = `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Dependencies
node_modules
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment variables
.env
.env.local
.env.development
.env.production

# Supabase
.bolt
`;

// Function to create a zip-friendly file structure
function createGitHubStructure() {
  // Create README.md
  fs.writeFileSync(path.join(rootDir, 'README.md'), readmeContent);
  console.log('✓ Created README.md');

  // Create .gitignore
  fs.writeFileSync(path.join(rootDir, '.gitignore'), gitignoreContent);
  console.log('✓ Created .gitignore');

  console.log('\nYour project is ready to be uploaded to GitHub!');
  console.log('\nFollow these steps to create your repository:');
  console.log('\n1. Go to https://github.com/new');
  console.log('2. Create a new repository');
  console.log('3. Download your project files');
  console.log('4. Initialize git and push to your new repository:');
  console.log('\n   git init');
  console.log('   git add .');
  console.log('   git commit -m "Initial commit"');
  console.log('   git branch -M main');
  console.log('   git remote add origin https://github.com/USERNAME/REPOSITORY.git');
  console.log('   git push -u origin main');
}

// Run the script
createGitHubStructure();