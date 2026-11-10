#!/usr/bin/env bash
# Gera dist/cmd.min.js (todas as páginas) e dist/gl.min.js (hero da home).
set -e
T=${TERSER:-npx --yes terser}
cd "$(dirname "$0")"
mkdir -p dist
printf '%s\n' 'window.CMD_BASE=window.CMD_BASE||((document.currentScript&&document.currentScript.src)||"").replace(/dist\/[^/]*$/,"");' > dist/_pre.js
$T src/v3.js -c -m -o dist/_v3.js
$T src/v6.js -c -m -o dist/_v6.js
$T src/v7.js -c -m -o dist/_v7.js
$T src/logo.js -c -m -o dist/_logo.js
w(){ printf 'try{'; cat "$1"; printf '\n}catch(e){console.error("cmd:",e)}\n'; }
{ cat dist/_pre.js; w src/core.min.js; w dist/_logo.js; w src/siteui.min.js; w dist/_v3.js; w dist/_v6.js; w dist/_v7.js; } > dist/cmd.min.js
$T src/gl.js -c -m -o dist/gl.min.js
$T src/home.min.js -c -m -o dist/home.min.js
rm dist/_*.js
node -e "new Function(require('fs').readFileSync('dist/cmd.min.js','utf8'));new Function(require('fs').readFileSync('dist/gl.min.js','utf8'));console.log('sintaxe ok')"
wc -c dist/*.js
