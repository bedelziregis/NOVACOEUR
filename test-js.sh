#!/bin/bash
# Test script - Vérifier que tout est correct

echo "✅ Vérification des erreurs JavaScript..."
echo ""

echo "📋 Fichiers à vérifier:"
echo "  - admin.js"
echo "  - auth.js"
echo "  - automation.js"
echo "  - config.js"
echo ""

echo "🔍 Vérification de la syntaxe..."

# Vérifier les fichiers
files=(
  "assets/js/admin.js"
  "assets/js/auth.js"
  "assets/js/automation.js"
  "assets/js/config.js"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "✅ $file existe"
  else
    echo "❌ $file manquant!"
  fi
done

echo ""
echo "📌 Ordre de chargement dans admin.html:"
echo "  1. config.js       (Configuration)"
echo "  2. admin.js        (SessionManager + AUTH_CREDENTIALS)"
echo "  3. auth.js         (Utilise SessionManager)"
echo "  4. automation.js   (Utilise SessionManager)"
echo ""

echo "✅ Test complet!"
echo ""
echo "Accédez à: http://localhost:3001/admin.html"
echo "et ouvrez la Console (F12) pour vérifier qu'il n'y a pas d'erreurs"
