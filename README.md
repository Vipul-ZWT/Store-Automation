Mobile testing --> Done with the scroll
recording --> can record but will create a sperate file
server load --> normal browser
playwright paid version --> It is open resource (It's the azure service which is asking cost)
CWV research --> Check Image size and aspect ratio
Cicd research --> Pending


281M  chromium-XXXXXX
187M  firefox-XXXX
180M  webkit-XXXX

# Script to generate the token

echo "Checking if Gmail token is expired..."

if [ -f token.json ]; then
  EXPIRY_DATE=$(jq -r '.expiry_date' token.json)

  CURRENT_TIME=$(($(date +%s) * 1000))

  SEVEN_DAYS=$((7 * 24 * 60 * 60 * 1000))

  TIME_LEFT=$((EXPIRY_DATE - CURRENT_TIME))

  if [ "$TIME_LEFT" -lt "$SEVEN_DAYS" ]; then
    node node_modules/gmail-tester/init.js credentials.json token.json magento.qa.testing@gmail.com
  fi
fi
