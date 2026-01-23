#!/bin/bash

# Batch Conversion Script for React Native
# Converts all .tsx files from web to React Native

echo "🚀 Starting batch conversion to React Native..."

# Create screens directory if it doesn't exist
mkdir -p src/screens

# Convert Pages to screens
echo "📄 Converting Pages to screens..."
for file in src/Pages/*.tsx; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .tsx)
        echo "Converting $filename..."
        node scripts/convert-to-rn.js "$file"
        # Move converted file
        if [ -f "${file%.tsx}.rn.tsx" ]; then
            mv "${file%.tsx}.rn.tsx" "src/screens/${filename}.tsx"
            echo "✅ Moved to src/screens/${filename}.tsx"
        fi
    fi
done

# Convert components
echo "🧩 Converting components..."
for file in src/components/*.tsx; do
    if [ -f "$file" ]; then
        filename=$(basename "$file" .tsx)
        echo "Converting $filename..."
        node scripts/convert-to-rn.js "$file"
    fi
done

echo "✅ Batch conversion complete!"
echo "⚠️  Remember to manually refine all converted files!"
