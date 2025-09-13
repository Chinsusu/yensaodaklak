#!/bin/bash

API_BASE="https://yensaodaklak.vn/api/admin"
PASSWORD="Calomam@12"
COOKIE_FILE="/tmp/admin_session.txt"

echo "🔐 Logging in to admin panel..."

# Login and get session cookie
LOGIN_RESPONSE=$(curl -s -c "$COOKIE_FILE" -X POST \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "password=$PASSWORD" \
  "$API_BASE/login")

if echo "$LOGIN_RESPONSE" | grep -q '"ok":true'; then
  echo "✅ Login successful"
else
  echo "❌ Login failed: $LOGIN_RESPONSE"
  exit 1
fi

echo "📂 Creating categories..."

# Create categories and store their IDs
declare -A category_ids

jq -r '.categories[] | @base64' products_data.json | while read -r encoded_cat; do
  cat_data=$(echo "$encoded_cat" | base64 -d)
  cat_name=$(echo "$cat_data" | jq -r '.name')
  
  echo "Creating category: $cat_name"
  
  response=$(curl -s -b "$COOKIE_FILE" -X POST \
    -H "Content-Type: application/json" \
    -d "$cat_data" \
    "$API_BASE/categories")
  
  if echo "$response" | grep -q '"ok":true'; then
    cat_id=$(echo "$response" | jq -r '.data.id')
    slug=$(echo "$cat_data" | jq -r '.slug')
    echo "$slug=$cat_id" >> /tmp/category_mapping.txt
    echo "  ✅ Created: $cat_name (ID: $cat_id)"
  else
    echo "  ❌ Failed to create: $cat_name - $response"
  fi
done

echo "🛍️ Creating products..."

# Create products with category mapping
jq -r '.products[] | @base64' products_data.json | while read -r encoded_prod; do
  prod_data=$(echo "$encoded_prod" | base64 -d)
  prod_name=$(echo "$prod_data" | jq -r '.name')
  cat_slug=$(echo "$prod_data" | jq -r '.category_slug')
  
  # Get category ID from mapping
  cat_id=$(grep "^$cat_slug=" /tmp/category_mapping.txt | cut -d'=' -f2)
  
  if [ -z "$cat_id" ]; then
    echo "  ❌ Cannot find category ID for slug: $cat_slug"
    continue
  fi
  
  # Prepare product data with category_id
  prod_json=$(echo "$prod_data" | jq --arg cat_id "$cat_id" '. + {category_id: ($cat_id | tonumber)} | del(.category_slug)')
  
  echo "Creating product: $prod_name (Category ID: $cat_id)"
  
  response=$(curl -s -b "$COOKIE_FILE" -X POST \
    -H "Content-Type: application/json" \
    -d "$prod_json" \
    "$API_BASE/products")
  
  if echo "$response" | grep -q '"ok":true'; then
    prod_id=$(echo "$response" | jq -r '.data.id')
    echo "  ✅ Created: $prod_name (ID: $prod_id)"
  else
    echo "  ❌ Failed to create: $prod_name - $response"
  fi
done

echo ""
echo "🎉 Import completed!"
echo ""
echo "📊 Verifying data..."

# Get categories count
cats_response=$(curl -s -b "$COOKIE_FILE" "$API_BASE/categories")
cats_count=$(echo "$cats_response" | jq '.data | length' 2>/dev/null || echo "0")

# Get products count  
prods_response=$(curl -s -b "$COOKIE_FILE" "$API_BASE/products")
prods_count=$(echo "$prods_response" | jq '.data | length' 2>/dev/null || echo "0")

echo "📂 Categories created: $cats_count"
echo "🛍️ Products created: $prods_count"
echo ""
echo "🎯 Access admin panel: https://yensaodaklak.vn/admin"
echo "🔑 Password: $PASSWORD"

# Cleanup
rm -f "$COOKIE_FILE" /tmp/category_mapping.txt
