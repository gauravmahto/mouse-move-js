# mouse-move-js

A simple Node.js script that gently moves your mouse cursor at regular intervals to prevent your computer from going to sleep or appearing inactive.

## Features

- Configurable delay between mouse movements
- Smooth mouse movement within a small range around the current position
- Uses cryptographically secure random numbers for natural movement

## Requirements

- Node.js 18+ (for `node:crypto` and ES modules)
- `robotjs` (native bindings required; may need build tools on some systems)

## Installation

