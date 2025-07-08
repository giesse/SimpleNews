import fs from 'fs';
import path from 'path';

/**
 * This test suite verifies that Tailwind CSS is properly configured in the project.
 * It checks configuration files and dependencies.
 */
describe('Tailwind CSS Configuration', () => {
  // Path to project root relative to this test file
  const PROJECT_ROOT = path.resolve(__dirname, '../..');
  
  test('tailwind.config.ts exists and has correct content paths', () => {
    const configPath = path.join(PROJECT_ROOT, 'tailwind.config.ts');
    
    // Check if config file exists
    expect(fs.existsSync(configPath)).toBe(true);
    
    // Read and check config content
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check content paths
    expect(configContent).toMatch(/content\s*:/);
    expect(configContent).toMatch(/['"]\.\/src\/app\/.*['"]/);
    expect(configContent).toMatch(/['"]\.\/src\/components\/.*['"]/);
  });
  
  test('postcss.config.mjs exists and has correct plugins', () => {
    const configPath = path.join(PROJECT_ROOT, 'postcss.config.mjs');
    
    // Check if config file exists
    expect(fs.existsSync(configPath)).toBe(true);
    
    // Read and check config content
    const configContent = fs.readFileSync(configPath, 'utf8');
    
    // Check for proper @tailwindcss/postcss plugin (Tailwind v4 syntax)
    expect(configContent).toMatch(/@tailwindcss\/postcss/);
    
    // Check plugin format is object-style, not array
    expect(configContent).toMatch(/plugins\s*:\s*{/);
  });
  
  test('globals.css has required Tailwind directives', () => {
    const cssPath = path.join(PROJECT_ROOT, 'src/app/globals.css');
    
    // Check if file exists
    expect(fs.existsSync(cssPath)).toBe(true);
    
    // Read and check content
    const cssContent = fs.readFileSync(cssPath, 'utf8');
    
    // Check for Tailwind v4 import syntax
    expect(cssContent).toMatch(/@import\s+["']tailwindcss["']/);
    
    // V4 no longer uses the @tailwind directives
    expect(cssContent).not.toMatch(/@tailwind\s+base/);
    expect(cssContent).not.toMatch(/@tailwind\s+components/);
    expect(cssContent).not.toMatch(/@tailwind\s+utilities/);
  });
  
  test('package.json has required Tailwind dependencies', () => {
    const packagePath = path.join(PROJECT_ROOT, 'package.json');
    
    // Check if file exists
    expect(fs.existsSync(packagePath)).toBe(true);
    
    // Read and parse package.json
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    // Check for @tailwindcss/postcss (required for v4) in dependencies or devDependencies
    const hasTailwindPostcss = Boolean(
      packageJson.dependencies?.['@tailwindcss/postcss'] ||
      packageJson.devDependencies?.['@tailwindcss/postcss']
    );
    
    expect(hasTailwindPostcss).toBe(true);
    
    // Check for tailwindcss package (should still be present)
    const hasTailwind = Boolean(
      packageJson.dependencies?.tailwindcss ||
      packageJson.devDependencies?.tailwindcss
    );
    
    expect(hasTailwind).toBe(true);
    
    // Check for postcss
    const hasPostcss = Boolean(
      packageJson.dependencies?.postcss ||
      packageJson.devDependencies?.postcss
    );
    
    expect(hasPostcss).toBe(true);
  });
});