#!/bin/sh

npm run build
sudo cp -fr ./dist/linux-armv7l-unpacked/** /opt/hydrogen-energy/

