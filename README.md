# Coze's Blog

This is my personal blog where I write about my journey through software development, exploring programming languages, frameworks, design patterns, and more.

## Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

*   Node.js
*   npm

### Installation

1.  Clone the repo
    ```sh
    git clone https://github.com/your_username/your_repository.git
    ```
2.  Install NPM packages
    ```sh
    npm install
    ```
3.  Run the development server
    ```sh
    npm run dev
    ```

## Creating a New Post

To create a new blog post, run the following command:

```sh
npm run post "Your New Post Title"
```

This will create a new markdown file in `content/blog` with the current date and a pre-filled header.

## Deployment

This project includes a GitHub Actions workflow that automatically deploys the site to GitHub Pages on every push to the `main` branch.