set -e

# MAIN APP INSTALLATION
npm i
npm run build

# MAIN APP AUTOSTART
echo '~/hydrogen-energy-ui/dist/linux-armv7l-unpacked/hydrogen-energy-ui' > ~/.xinitrc
chmod +x ~/.xinitrc