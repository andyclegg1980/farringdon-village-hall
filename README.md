# Farringdon Village Hall Website

This is the Hugo-based website for Farringdon Village Hall.

## Getting Started

1. Install a Hugo theme (if not already installed):
   ```bash
   git init
   git submodule add https://github.com/theNewDynamic/gohugo-theme-ananke themes/ananke
   ```

2. Run the development server:
   ```bash
   hugo server -D
   ```

3. Visit http://localhost:1313 to preview your site

## Directory Structure

- `content/` - All your page content in Markdown format
- `static/` - Images, CSS, JS, and other static assets
- `layouts/` - Custom templates (if needed)
- `themes/` - Hugo theme files
- `hugo.toml` - Site configuration

## Adding Content

Edit the Markdown files in the `content/` directory. Each file has front matter (between the `---` markers) that controls metadata like title and date.

## Deployment

Build the site with:
```bash
hugo
```

The output will be in the `public/` directory, ready to upload to your hosting provider.

