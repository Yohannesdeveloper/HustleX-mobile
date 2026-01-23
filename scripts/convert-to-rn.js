#!/usr/bin/env node

/**
 * React Native Conversion Helper Script
 * Helps convert React web components to React Native
 * 
 * Usage: node scripts/convert-to-rn.js <file-path>
 */

const fs = require('fs');
const path = require('path');

// Component mappings
const COMPONENT_MAPPINGS = {
  'div': 'View',
  'span': 'Text',
  'p': 'Text',
  'h1': 'Text',
  'h2': 'Text',
  'h3': 'Text',
  'h4': 'Text',
  'h5': 'Text',
  'h6': 'Text',
  'img': 'Image',
  'input': 'TextInput',
  'button': 'TouchableOpacity',
  'a': 'TouchableOpacity',
  'ul': 'View',
  'ol': 'View',
  'li': 'View',
};

// Import replacements
const IMPORT_REPLACEMENTS = [
  {
    from: /import\s+.*from\s+['"]react-router-dom['"]/g,
    to: "import { useNavigation } from '@react-navigation/native';"
  },
  {
    from: /import\s+.*from\s+['"]react-dom['"]/g,
    to: "// Removed react-dom import (not needed in React Native)"
  },
  {
    from: /from\s+['"]lucide-react['"]/g,
    to: "from '@expo/vector-icons'"
  }
];

function convertFile(filePath) {
  console.log(`Converting ${filePath}...`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace imports
  IMPORT_REPLACEMENTS.forEach(replacement => {
    content = content.replace(replacement.from, replacement.to);
  });
  
  // Add React Native imports
  if (!content.includes("from 'react-native'")) {
    const reactImport = content.match(/import\s+.*from\s+['"]react['"]/);
    if (reactImport) {
      content = content.replace(
        reactImport[0],
        `${reactImport[0]}\nimport { View, Text, TouchableOpacity, Image, TextInput, ScrollView, StyleSheet } from 'react-native';`
      );
    }
  }
  
  // Replace HTML elements (basic)
  Object.entries(COMPONENT_MAPPINGS).forEach(([html, rn]) => {
    const regex = new RegExp(`<${html}(\\s|>)`, 'g');
    content = content.replace(regex, `<${rn}$1`);
    const closingRegex = new RegExp(`</${html}>`, 'g');
    content = content.replace(closingRegex, `</${rn}>`);
  });
  
  // Replace className with style (basic - needs manual refinement)
  content = content.replace(/className=/g, 'style=');
  
  // Replace useNavigate
  content = content.replace(/const\s+navigate\s*=\s*useNavigate\(\)/g, 
    "const navigation = useNavigation();\n  const navigate = (route, params) => navigation.navigate(route, params);");
  
  // Replace navigate() calls
  content = content.replace(/navigate\((['"])([^'"]+)\1\)/g, 
    "navigation.navigate('$2')");
  
  // Write converted file
  const outputPath = filePath.replace(/\.tsx?$/, '.rn.tsx');
  fs.writeFileSync(outputPath, content, 'utf8');
  console.log(`✅ Converted to ${outputPath}`);
  console.log(`⚠️  Manual review and refinement required!`);
}

// Main
const filePath = process.argv[2];
if (!filePath) {
  console.log('Usage: node scripts/convert-to-rn.js <file-path>');
  process.exit(1);
}

convertFile(filePath);
