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
$T src/v8.js -c -m -o dist/_v8.js
$T src/v11.js -c -m -o dist/_v11.js
$T src/logo.js -c -m -o dist/_logo.js
$T src/hours.js -c -m -o dist/_hours.js
$T src/agenda.js -c -m -o dist/_agenda.js
w(){ printf 'try{'; cat "$1"; printf '\n}catch(e){console.error("cmd:",e)}\n'; }
{ cat dist/_pre.js; w dist/_hours.js; w dist/_agenda.js; w src/core.min.js; w dist/_logo.js; w src/siteui.min.js; w dist/_v3.js; w dist/_v6.js; w dist/_v7.js; w dist/_v8.js; w dist/_v11.js; } > dist/cmd.min.js
$T src/gl.js -c -m -o dist/gl.min.js
$T src/home.min.js -c -m -o dist/home.min.js
rm dist/_*.js
node -e "new Function(require('fs').readFileSync('dist/cmd.min.js','utf8'));new Function(require('fs').readFileSync('dist/gl.min.js','utf8'));console.log('sintaxe ok')"
wc -c dist/*.js
# CSS que vive no Global Styles do Designer (colar no embed cmd-v8)
cat css/v6.css css/v7.css css/v8.css css/v9.css css/v10.css css/v11.css | tr '\n' ' ' | sed 's#/\*[^*]*\*\+\([^/*][^*]*\*\+\)*/##g; s/  */ /g' > dist/site.css
wc -c dist/site.css
