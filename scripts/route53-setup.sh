#!/bin/bash

# Route53 DNS Setup Script for BorderlessBits.com
# This script helps configure Route53 for GitHub Pages hosting

echo "🌐 Route53 DNS Configuration for GitHub Pages"
echo "============================================="
echo ""
echo "Please add these records in your Route53 Hosted Zone:"
echo ""
echo "1. A Records (GitHub Pages IPs):"
echo "   Type: A"
echo "   Name: @ (or leave blank for root domain)"
echo "   Values:"
echo "   - 185.199.108.153"
echo "   - 185.199.109.153"
echo "   - 185.199.110.153"
echo "   - 185.199.111.153"
echo "   TTL: 300"
echo ""
echo "2. CNAME Record (www redirect):"
echo "   Type: CNAME"
echo "   Name: www"
echo "   Value: ${GITHUB_USERNAME:-YOUR_USERNAME}.github.io"
echo "   TTL: 300"
echo ""
echo "3. Optional: MX Records (if using email)"
echo "   Configure based on your email provider"
echo ""

# Check if AWS CLI is installed
if command -v aws &> /dev/null; then
    echo "📦 AWS CLI detected. Would you like to configure automatically? (y/n)"
    read -r response
    
    if [[ "$response" == "y" ]]; then
        echo "Enter your Route53 Hosted Zone ID:"
        read -r ZONE_ID
        
        echo "Enter your GitHub username:"
        read -r GITHUB_USER
        
        # Create JSON for batch change
        cat > /tmp/route53-change.json <<EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "borderlessbits.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [
          {"Value": "185.199.108.153"},
          {"Value": "185.199.109.153"},
          {"Value": "185.199.110.153"},
          {"Value": "185.199.111.153"}
        ]
      }
    },
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "www.borderlessbits.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [
          {"Value": "${GITHUB_USER}.github.io"}
        ]
      }
    }
  ]
}
EOF
        
        echo "📤 Applying DNS changes to Route53..."
        aws route53 change-resource-record-sets \
            --hosted-zone-id "$ZONE_ID" \
            --change-batch file:///tmp/route53-change.json
        
        echo "✅ DNS records created successfully!"
        echo ""
        echo "⏱️  DNS propagation can take up to 48 hours, but usually completes within 1 hour."
        
        # Cleanup
        rm /tmp/route53-change.json
    fi
else
    echo "ℹ️  AWS CLI not found. Please configure manually in AWS Console."
fi

echo ""
echo "📝 Next Steps:"
echo "1. Create CNAME file in your repository:"
echo "   echo 'borderlessbits.com' > public/CNAME"
echo "2. Commit and push the CNAME file"
echo "3. Enable GitHub Pages in repository settings"
echo "4. Wait for DNS propagation (5-60 minutes typically)"
echo ""
echo "🔍 To verify DNS propagation:"
echo "   nslookup borderlessbits.com"
echo "   dig borderlessbits.com"
echo ""
echo "✅ Once propagated, your site will be live at:"
echo "   https://borderlessbits.com"
echo "   https://www.borderlessbits.com"

pause