Mobile testing --> Done with the scroll
recording --> can record but will create a sperate file
server load --> normal browser
playwright paid version --> It is open resource (It's the azure service which is asking cost)
CWV research --> Check Image size and aspect ratio
Cicd research --> Pending


281M  chromium-XXXXXX
187M  firefox-XXXX
180M  webkit-XXXX

echo "Checking if Gmail token is expired..."

if [ -f token.json ]; then
  # Extract expiry from token.json (milliseconds)
  EXPIRY_DATE=$(jq -r '.expiry_date' token.json)

  # Get current time in milliseconds
  CURRENT_TIME=$(($(date +%s) * 1000))

  # 7 days in milliseconds
  SEVEN_DAYS=$((7 * 24 * 60 * 60 * 1000))

  # Time left until token expires
  TIME_LEFT=$((EXPIRY_DATE - CURRENT_TIME))

  # Compare the time
  if [ "$TIME_LEFT" -lt "$SEVEN_DAYS" ]; then
    node node_modules/gmail-tester/init.js credentials.json token.json magento.qa.testing@gmail.com
  fi
fi
