#!/bin/bash

# cesta ke složce s PSD
INPUT_DIR="/Users/martinakurkovanozickova/Documents/_WORK_IN_PROGRESS/pekseso/images/fotky/resize/"
OUTPUT_DIR="$INPUT_DIR/output"

# vytvoření složek pro výstup
mkdir -p "$OUTPUT_DIR/small" "$OUTPUT_DIR/medium" "$OUTPUT_DIR/large" "$OUTPUT_DIR/xl"

# smyčka přes všechny soubory
for img in "$INPUT_DIR"/*.webp; do
  filename=$(basename "$img" .webp)   # název souboru bez přípony

  convert "$img" -resize 400x -quality 100 "$OUTPUT_DIR/small/${filename}_small_400.webp"
  convert "$img" -resize 650x -quality 100 "$OUTPUT_DIR/medium/${filename}_medium_650.webp"
  convert "$img" -resize 800x -quality 100 "$OUTPUT_DIR/large/${filename}_large_800.webp"
  convert "$img" -resize 1000x -quality 100 "$OUTPUT_DIR/xl/${filename}_xl_1000.webp"
done

echo "✅ Hotovo! Výsledky jsou ve složce $OUTPUT_DIR"
