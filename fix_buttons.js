const fs = require('fs');
function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx')) {
      results.push(file);
    }
  });
  return results;
}
const files = walk('frontend/src');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let newC = c.replace(/<button([^>]*onClick={onClose}[^>]*)>/g, function(match, p1) {
    if (!p1.includes('aria-label')) {
      return '<button' + p1 + ' aria-label="Close">';
    }
    return match;
  });
  if (c !== newC) {
    fs.writeFileSync(f, newC);
    console.log('Fixed ' + f);
  }
});
