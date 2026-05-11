const fs = require('fs');
const path = require('path');

const directory = './src';

// Robust regex for console statements (handles simple nested parentheses)
const consoleRegex = /console\.(log|debug|info|warn|error|group|groupEnd|table|time|timeEnd|count|trace)\s*\((?:[^)(]+|\((?:[^)(]+|\([^)(]*\))*\))*\);?/g;

// Regex for emoji-prefixed debug logs if any (e.g., 🔍 [DEBUG])
const emojiDebugRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}].*?\[DEBUG\].*?;?/gu;

function processDirectory(dir) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            processDirectory(filePath);
        } else if (file.endsWith('.js') || file.endsWith('.jsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            let content = fs.readFileSync(filePath, 'utf8');
            
            const originalContent = content;
            
            // Remove console logs
            content = content.replace(consoleRegex, '');
            
            // Remove emoji debug patterns if they are not inside strings (simplified check)
            // Note: This is more aggressive and should be used with caution.
            // For now, we mainly focus on console logs as requested.

            if (content !== originalContent) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log(`Updated: ${filePath}`);
            }
        }
    });
}

console.log('🚀 Starting log removal in frontend/src...');
processDirectory(directory);
console.log('✅ Finished removing console logs.');
