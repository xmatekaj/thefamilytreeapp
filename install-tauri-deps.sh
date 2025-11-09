#!/bin/bash

echo "Installing Tauri dependencies for Linux..."

# Update package list
sudo apt update

# Try webkit2gtk-4.1 first (newer), fallback to 4.0
if apt-cache show libwebkit2gtk-4.1-dev &> /dev/null; then
    echo "Installing libwebkit2gtk-4.1-dev (newer version)..."
    WEBKIT_PKG="libwebkit2gtk-4.1-dev"
elif apt-cache show libwebkit2gtk-4.0-dev &> /dev/null; then
    echo "Installing libwebkit2gtk-4.0-dev..."
    WEBKIT_PKG="libwebkit2gtk-4.0-dev"
else
    echo "Error: Neither libwebkit2gtk-4.1-dev nor libwebkit2gtk-4.0-dev found!"
    exit 1
fi

# Install all dependencies
sudo apt install -y \
    $WEBKIT_PKG \
    build-essential \
    curl \
    wget \
    file \
    libssl-dev \
    libgtk-3-dev \
    libayatana-appindicator3-dev \
    librsvg2-dev \
    libsoup2.4-dev \
    libjavascriptcoregtk-4.0-dev \
    libjavascriptcoregtk-4.1-dev

echo "✓ Tauri dependencies installed successfully!"
echo ""
echo "Now you can run: npm run tauri:dev"
