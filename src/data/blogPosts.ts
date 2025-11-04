export interface BlogPost {
  id: string;
  title: string;
  date: string;
  excerpt: string;
  content: string;
  tags: string[];
  slug: string;
}

export const blogPosts: BlogPost[] = [
  {
    id: "1",
    slug: "serving-aws-s3-private-content-with-golang",
    title: "Serving AWS S3 private content with Golang and AWS SDK for Go v2",
    date: "February 5, 2024",
    excerpt: "Have you ever wanted to serve private files from your AWS S3 storage to your users, but making the bucket public is not a safe option? Learn how to do it with presigned URLs.",
    tags: ["go", "aws", "s3"],
    content: `Have you ever wanted to serve private files from your AWS S3 storage to your users, but making the bucket public is not a safe option? In this post, I will show you how to do it using Golang and AWS SDK for Go v2 with a presigned URL, and later, you can integrate it with your own authentication system.

## Prerequisites

- Go 1.19 or later
- AWS SDK for Go v2
- Private S3 bucket and credentials to access it (at least s3:GetObject permission)

## Implementation

We'll use presigned URLs to provide temporary access to private S3 objects. This approach ensures security while maintaining flexibility in how you serve files to your users.

### Creating the AWS S3 client

There are two options for creating the AWS S3 client - using access keys (not recommended for production) or using IAM role for service account credentials (recommended).

### Using presigned URLs

Presigned URLs are a secure way to grant temporary access to private S3 objects without making your bucket public. The URL contains authentication information in the query string parameters.

This method is perfect for serving private content while maintaining security and control over your S3 resources.`
  },
  {
    id: "2",
    slug: "setting-up-virtual-environment-with-vagrant",
    title: "Setting up a virtual environment with Vagrant for testing",
    date: "October 11, 2023",
    excerpt: "In the world of software development, testing is a critical aspect of ensuring the reliability and functionality of your applications.",
    tags: ["vagrant", "devops", "testing"],
    content: `In the world of software development, testing is a critical aspect of ensuring the reliability and functionality of your applications. Vagrant provides an excellent solution for creating reproducible development environments.

## Why Vagrant?

Vagrant allows you to create and configure lightweight, reproducible, and portable development environments. It's particularly useful for testing applications in different environments without affecting your local machine.

## Getting Started

Setting up Vagrant is straightforward. You'll need VirtualBox (or another provider) and Vagrant itself. Once installed, you can define your environment in a Vagrantfile.

## Benefits

- Consistent development environments across team members
- Easy to set up and tear down
- Perfect for testing different configurations
- Doesn't pollute your local machine

Vagrant is an invaluable tool for modern development workflows.`
  },
  {
    id: "3",
    slug: "golang-create-combinations-from-n-arrays",
    title: "Golang Create Combinations From N Arrays",
    date: "September 24, 2022",
    excerpt: "This snippet is useful when you need create combinations from n arrays with picking one element from each array.",
    tags: ["go", "algorithms"],
    content: `This snippet is useful when you need create combinations from n arrays with picking one element from each array.

For example, you want to create variants from product attributes:

Product: Tshirt
Color: White, Black
Size: S, M, L

Variants of this Tshirt: White - S, White - M, White - L, Black - S, Black - M, Black - L

## The Algorithm

The solution uses a clever index-tracking approach to generate all possible combinations. It maintains an array of indices, one for each input array, and systematically generates combinations by incrementing these indices.

## Implementation

The function iterates through all possible combinations by treating the indices like a counter. When one position reaches its maximum, it resets to zero and increments the next position, similar to how a mechanical counter works.

## Use Cases

This is particularly useful for:
- E-commerce product variants
- Test case generation
- Combinatorial analysis
- Configuration management

The algorithm is efficient and straightforward to implement in Go.`
  },
  {
    id: "4",
    slug: "building-golang-docker-image-for-production",
    title: "Building Golang Docker Image For Production",
    date: "August 3, 2021",
    excerpt: "Learn how to create optimized Docker images for your Go applications with multi-stage builds and best practices.",
    tags: ["go", "docker", "devops"],
    content: `Building production-ready Docker images for Go applications requires careful consideration of image size, security, and build efficiency.

## Multi-Stage Builds

Multi-stage builds are essential for creating small, efficient Docker images. They allow you to use a full build environment while keeping the final image minimal.

## Best Practices

1. Use Alpine or scratch as base images
2. Leverage build cache effectively
3. Copy only necessary files
4. Use .dockerignore
5. Run as non-root user

## Optimization

The key to optimized Go Docker images is using multi-stage builds. Build your application in one stage with all necessary tools, then copy only the binary to a minimal final image.

This approach can reduce image sizes from hundreds of MBs to just a few MBs, significantly improving deployment speed and security.`
  },
  {
    id: "5",
    slug: "how-to-use-multiple-ssh-keys-effectively",
    title: "How To Use Multiple SSH Keys Effectively",
    date: "October 10, 2021",
    excerpt: "Managing multiple SSH keys for different services and accounts can be tricky. Here's how to do it right.",
    tags: ["ssh", "devops", "security"],
    content: `Managing multiple SSH keys for different services and accounts is a common challenge for developers. Whether you're working with GitHub, GitLab, personal servers, or client infrastructure, proper SSH key management is crucial.

## The Problem

Using a single SSH key for everything is convenient but not ideal for security. Different contexts require different keys:
- Personal GitHub
- Work GitHub/GitLab
- Production servers
- Client servers

## The Solution: SSH Config

The ~/.ssh/config file is your friend. It allows you to specify which key to use for different hosts.

## Configuration Example

You can create aliases for different services and specify which key to use for each. This makes SSH connections more manageable and secure.

## Best Practices

1. Use different keys for different contexts
2. Name your keys descriptively
3. Use passphrases for extra security
4. Keep your config file organized
5. Document your setup

With proper SSH key management, you can work seamlessly across multiple accounts and services.`
  },
  {
    id: "6",
    slug: "zero-downtime-deployments-kubernetes",
    title: "How to archive zero downtime deployments in Kubernetes",
    date: "November 20, 2020",
    excerpt: "Achieving true zero-downtime deployments requires understanding Kubernetes rolling updates, readiness probes, and graceful shutdowns.",
    tags: ["kubernetes", "devops", "deployment"],
    content: `Zero-downtime deployments are essential for maintaining service availability during updates. Kubernetes provides several features to achieve this goal.

## Rolling Updates

Kubernetes rolling updates gradually replace old pods with new ones, ensuring that some instances are always available to serve traffic.

## Readiness Probes

Readiness probes tell Kubernetes when a pod is ready to receive traffic. This prevents routing requests to pods that aren't fully initialized.

## Graceful Shutdown

Proper shutdown handling ensures that in-flight requests are completed before a pod terminates.

## Configuration

Key configurations include:
- maxSurge and maxUnavailable settings
- Appropriate readiness probe endpoints
- PreStop hooks for graceful shutdown
- Connection draining

## Best Practices

1. Always implement readiness probes
2. Handle SIGTERM signals properly
3. Use appropriate update strategies
4. Test your deployment process
5. Monitor during deployments

With these practices, you can achieve truly zero-downtime deployments in Kubernetes.`
  }
];

export const getTags = (): string[] => {
  const tagSet = new Set<string>();
  blogPosts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
};

export const getPostsByTag = (tag: string): BlogPost[] => {
  return blogPosts.filter(post => post.tags.includes(tag));
};

export const getPostBySlug = (slug: string): BlogPost | undefined => {
  return blogPosts.find(post => post.slug === slug);
};
