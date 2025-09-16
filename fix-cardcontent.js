const fs = require('fs');

// Read the file
const filePath = './components/budget/FamilyAllowanceSystem.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix the pattern: Remove extra div with p-6 class after CardContent
content = content.replace(
  /(<CardContent>\s*)\n\s*<div className="p-6">/g,
  '$1'
);

// Also remove the corresponding closing </div> before </CardContent>
content = content.replace(
  /\s*<\/div>\s*\n\s*<\/Card>/g,
  '\n            </CardContent>\n          </Card>'
);

// Write back the file
fs.writeFileSync(filePath, content);

console.log('Fixed CardContent structure issues');
