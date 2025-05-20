# Personal Portfolio Website

A modern, responsive personal portfolio website with productivity tools built using HTML, CSS, and JavaScript.

## Features

- Responsive design that works on all devices
- Dark mode support
- Background music player
- Productivity tools:
  - Pomodoro Timer
  - To-Do List
  - Notes App
  - Habit Tracker
  - Password Generator
  - Unit Converter
  - Focus Music Player
  - Quote Generator
- Cookie-based data persistence
- Modern animations and transitions

## Deployment on Netlify

1. Push your code to a GitHub repository

2. Log in to Netlify (https://www.netlify.com)

3. Click "New site from Git"

4. Choose your GitHub repository

5. Configure build settings:
   - Build command: Leave empty (no build required)
   - Publish directory: Leave empty (root directory)

6. Click "Deploy site"

## Environment Variables

No environment variables are required for this project.

## Local Development

To run this project locally:

1. Clone the repository
2. Use a local server (due to ES6 modules):
   - Using Python: `python -m http.server 8000`
   - Using Node.js: `npx serve`
   - Using VS Code: Install "Live Server" extension

## Notes

- The website uses ES6 modules, so it must be served from a web server
- Data is stored in cookies with a 30-day expiration
- Audio files should be placed in the root directory
- Images should be replaced with your own content

## License

MIT License - Feel free to use this code for your own projects 