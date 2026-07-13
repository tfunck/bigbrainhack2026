#!/usr/bin/env node
/**
 * Reads every open issue carrying the project label and writes projects.json,
 * which the site renders. Runs in CI on every issue event; needs no packages.
 *
 *   node scripts/sync-projects.mjs
 *
 * Environment:
 *   GITHUB_REPOSITORY  owner/repo   (set automatically by GitHub Actions)
 *   GITHUB_TOKEN       optional, raises the API rate limit
 *   PROJECT_LABEL      defaults to "Project"
 */

import { writeFileSync } from "node:fs";

const REPO = process.env.GITHUB_REPOSITORY;
const TOKEN = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || "";
const LABEL = process.env.PROJECT_LABEL || "Project";
const OUT = "projects.json";

if (!REPO) {
  console.error("GITHUB_REPOSITORY is not set. Run this in Actions, or set it yourself.");
  process.exit(1);
}

const headers = {
  Accept: "application/vnd.github+json",
  "User-Agent": "bigbrain-hackathon-site"
};
if (TOKEN) headers.Authorization = `Bearer ${TOKEN}`;

const url =
  `https://api.github.com/repos/${REPO}/issues` +
  `?state=open&per_page=100&labels=${encodeURIComponent(LABEL)}`;

const res = await fetch(url, { headers });
if (!res.ok) {
  console.error(`GitHub API returned ${res.status}: ${await res.text()}`);
  process.exit(1);
}

const issues = (await res.json()).filter((i) => !i.pull_request);
const projects = issues.map(parseIssue).sort((a, b) => a.number - b.number);

writeFileSync(
  OUT,
  JSON.stringify({ generated: new Date().toISOString(), repo: REPO, projects }, null, 2) + "\n"
);
console.log(`Wrote ${projects.length} project(s) to ${OUT}.`);

/* ---------------------------------------------------------------------- */

function parseIssue(issue) {
  const fields = {};
  String(issue.body || "")
    .split(/^###\s+/m)
    .forEach((block) => {
      const nl = block.indexOf("\n");
      if (nl === -1) return;
      const key = block.slice(0, nl).trim().toLowerCase();
      let val = block.slice(nl).trim();
      if (!val || val === "_No response_") val = "";
      fields[key] = val;
    });

  const pick = (...keys) => {
    for (const k of keys) {
      const hit = Object.keys(fields).find((f) => f.startsWith(k));
      if (hit && fields[hit]) return fields[hit];
    }
    return "";
  };

  const themes = pick("theme")
    .split(/[\n,]/)
    .map((s) => s.replace(/^[-*]\s*/, "").replace(/^\[[xX ]\]\s*/, "").trim())
    .filter(Boolean);

  return {
    number: issue.number,
    title: pick("project title") || issue.title,
    description: pick("short description", "description"),
    url: issue.html_url,
    projectUrl: firstUrl(pick("project link", "link to")),
    image: firstUrl(pick("image", "logo")),
    leads: pick("project lead").split("\n").map((s) => s.trim()).filter(Boolean),
    skills: pick("skills"),
    firstIssues: pick("good first"),
    pitch: firstUrl(pick("pitch")),
    themes,
    gpu: /yes/i.test(pick("gb10", "would this project")),
    updated: issue.updated_at
  };
}

function firstUrl(text) {
  const m = String(text || "").match(/https?:\/\/[^\s)"'<>]+/);
  return m ? m[0] : "";
}
