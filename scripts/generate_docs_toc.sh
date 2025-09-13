#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
cd "$ROOT_DIR"

README="$ROOT_DIR/README.md"
DOCS_DIR="$ROOT_DIR/docs"
SITEMAP="$DOCS_DIR/sitemap.md"

mkdir -p "$DOCS_DIR"

TOC_FILE="$(mktemp)"
{
  echo "<!-- DOCS_TOC:START -->"
  echo "## Mục lục"
  if [ -d "$DOCS_DIR" ]; then
    while IFS= read -r -d "" dir; do
      name="$(basename "$dir")"
      echo "- $name"
      while IFS= read -r -d "" f; do
        bn="$(basename "$f")"
        rel="${f#$ROOT_DIR/}"
        echo "  - [$bn]($rel)"
      done < <(find "$dir" -maxdepth 1 -type f \( -iname "*.md" -o -iname "*.pdf" \) -print0 | sort -z)
    done < <(find "$DOCS_DIR" -mindepth 1 -maxdepth 1 -type d -print0 | sort -z)
  else
    echo "- (chưa có tài liệu trong docs/)"
  fi
  echo "<!-- DOCS_TOC:END -->"
} > "$TOC_FILE"

if [ -f "$README" ]; then
  TMP_README="$(mktemp)"
  sed "/<!-- DOCS_TOC:START -->/,/<!-- DOCS_TOC:END -->/d" "$README" > "$TMP_README" || true
  echo "" >> "$TMP_README"
  echo "" >> "$TMP_README"
  cat "$TOC_FILE" >> "$TMP_README"
  mv "$TMP_README" "$README"
fi

# Enhanced sitemap with metadata
file_count=0
{
  echo "# Docs Sitemap"
  echo ""
  echo "_Generated: $(date -u +"%Y-%m-%d %H:%M:%S UTC")_"
  echo ""
  if [ -d "$DOCS_DIR" ]; then
    while IFS= read -r -d "" f; do
      rel="${f#$ROOT_DIR/}"
      echo "- [$rel]($rel)"
      file_count=$((file_count + 1))
    done < <(find "$DOCS_DIR" -type f \( -iname "*.md" -o -iname "*.pdf" \) -print0 | sort -z)
    echo ""
    echo "**Total files:** $file_count"
  else
    echo "- (no docs)"
  fi
} > "$SITEMAP"

echo "Generated TOC and sitemap into $README and $SITEMAP ($file_count files)"
