#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import matter from 'gray-matter';

const MASTODON_URL = 'https://mastodon.world';
const ACCESS_TOKEN = process.env.MASTODON_ACCESS_TOKEN;
const SITE_URL = 'https://blog.arda.tr/blog';

async function postToMastodon(status: string) {
    if (!ACCESS_TOKEN) {
        console.warn('⚠️ MASTODON_ACCESS_TOKEN is not set.');
        console.log('Dry run mode. Would have posted:\n-------------------');
        console.log(status);
        console.log('-------------------');
        return;
    }

    try {
        const response = await fetch(`${MASTODON_URL}/api/v1/statuses`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                status: status,
                visibility: 'public'
            })
        });

        if (!response.ok) {
            const text = await response.text();
            console.error('❌ Failed to post to Mastodon:', response.status, text);
            process.exit(1);
        } else {
            const data = await response.json();
            console.log(`✅ Successfully posted to Mastodon! URL: ${data.url}`);
        }
    } catch (error) {
        console.error('❌ Error posting to Mastodon:', error);
        process.exit(1);
    }
}

function processFile(filePath: string) {
    console.log(`Processing file: ${filePath}`);
    if (!fs.existsSync(filePath)) {
        console.error(`❌ File not found: ${filePath}`);
        return;
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(content);

    if (parsed.data.draft === true || parsed.data.draft === 'true') {
        console.log(`⏭️ Skipping ${filePath} (draft)`);
        return;
    }

    const title = parsed.data.title || 'New Blog Post';
    const excerpt = parsed.data.excerpt || '';
    const tags = parsed.data.tags || [];

    // Extract slug - assume it's the filename without extension, matching Astro's default routing
    // Note: Astro 5 post.id might be '2026/filename' but split('/').pop() gets 'filename'
    let slug = path.basename(filePath);
    // Remove markdown extension if present
    slug = slug.replace(/\.mdx?$/, '');

    const postUrl = `${SITE_URL}/${slug}`;

    // Format hashtags
    const hashtags = tags
        .map((tag: string) => `#${tag.replace(/[^a-zA-Z0-9_]/g, '')}`)
        .join(' ');

    // Create status text
    const compose = (body: string) => {
        let s = `📝 New blog post: ${title}\n\n`;
        if (body) {
            s += `${body}\n\n`;
        }
        s += `${postUrl}`;
        if (hashtags) {
            s += `\n\n${hashtags}`;
        }
        return s;
    };

    // Mastodon rejects statuses over 500 characters (422). Trim the excerpt to
    // fit rather than failing the whole deploy. Mastodon counts any URL as 23
    // characters regardless of its real length, so measure accordingly.
    const LIMIT = 495;
    const effectiveLength = (s: string) => s.length - postUrl.length + 23;
    let statusText = compose(excerpt);
    if (effectiveLength(statusText) > LIMIT) {
        const overhead = effectiveLength(statusText) - excerpt.length;
        const room = Math.max(LIMIT - overhead - 1, 0);
        const trimmed = room > 0 ? `${excerpt.slice(0, room).trimEnd()}…` : '';
        console.warn(`⚠️ Status too long (effective ${effectiveLength(statusText)}); trimming excerpt to fit.`);
        statusText = compose(trimmed);
    }

    return postToMastodon(statusText);
}

async function main() {
    const args = process.argv.slice(2);

    // Local testing mode: specific file path provided
    if (args.length > 0) {
        const filePath = args[0];
        console.log('🚀 Running in local test mode for specific file...');
        await processFile(filePath);
        return;
    }

    // GitHub Actions mode
    console.log('🚀 Running in GitHub Actions mode...');
    const beforeSha = process.env.BEFORE_SHA;
    const afterSha = process.env.AFTER_SHA;

    if (!beforeSha || !afterSha) {
        console.warn('⚠️ BEFORE_SHA or AFTER_SHA are not set. Cannot determine new files.');
        console.log('Skipping Mastodon post step.');
        return;
    }

    try {
        let diffOutput = '';
        try {
            // Get list of added files between commits
            // A status means added
            const diffCmd = `git diff --name-status ${beforeSha} ${afterSha}`;
            console.log(`Executing: ${diffCmd}`);
            diffOutput = execSync(diffCmd, { encoding: 'utf-8' });
        } catch (gitError: any) {
            console.warn('⚠️ Git diff failed. This can happen on new branches or shallow clones. Skipping Mastodon post. Details:', gitError.message);
            return;
        }

        const newFiles = diffOutput
            .split('\n')
            .filter(line => line.startsWith('A\t') || line.startsWith('A ')) // Added files
            .map(line => line.split('\t')[1] || line.split(' ')[1]) // Get file path
            .filter(filePath => filePath?.startsWith('src/content/blog/') && filePath?.endsWith('.md'));

        if (newFiles.length === 0) {
            console.log('ℹ️ No new blog posts found in this commit range.');
            return;
        }

        console.log(`Found ${newFiles.length} new blog post(s) to publish.`);

        for (const file of newFiles) {
            const fullPath = path.join(process.cwd(), file);
            await processFile(fullPath);
        }
    } catch (error) {
        console.error('❌ Error finding new files via Git:', error);
        process.exit(1);
    }
}

main().catch(console.error);
