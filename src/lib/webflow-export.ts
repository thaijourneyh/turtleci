import fs from "node:fs";
import path from "node:path";

const exportRoot = "/Users/thaitran/Downloads/JH Codex/turtleci.webflow";

const routeMap: Record<string, string> = {
  "index.html": "/",
  "about-us.html": "/about-us",
  "blogs.html": "/blogs",
  "contact-us.html": "/contact-us",
  "documentation.html": "/documentation",
  "features-turtleci.html": "/features-turtleci",
  "pricing-plan.html": "/pricing-plan",
  "privacy-and-policy.html": "/privacy-and-policy",
  "startup-support-event.html": "/startup-support-event",
  "terms-of-service.html": "/terms-of-service"
};

function rewriteAssets(input: string) {
  return input
    .replace(/(["'(])css\//g, '$1/webflow/css/')
    .replace(/(["'(])images\//g, '$1/webflow/images/')
    .replace(/(["'(])js\//g, '$1/webflow/js/')
    .replace(/(["'(])documents\//g, '$1/webflow/documents/');
}

function rewriteRoutes(input: string) {
  let output = input;

  for (const [from, to] of Object.entries(routeMap)) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    output = output.replace(new RegExp(`(["'])${escaped}(["'])`, "g"), `$1${to}$2`);
  }

  return output;
}

function rewriteHtml(input: string) {
  return rewriteRoutes(rewriteAssets(input));
}

export interface ExportedPage {
  htmlAttrs: string;
  headHtml: string;
  bodyHtml: string;
}

export interface WebflowPageAttrs {
  lang: string;
  dataWfPage?: string;
  dataWfSite?: string;
}

export function loadExportedPage(fileName: string): ExportedPage {
  const filePath = path.join(exportRoot, fileName);
  const html = fs.readFileSync(filePath, "utf8");

  const htmlTagMatch = html.match(/<html([^>]*)>/i);
  const headMatch = html.match(/<head>([\s\S]*?)<\/head>/i);
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);

  if (!headMatch || !bodyMatch) {
    throw new Error(`Could not parse exported page: ${fileName}`);
  }

  return {
    htmlAttrs: htmlTagMatch?.[1]?.trim() || 'lang="en"',
    headHtml: rewriteHtml(headMatch[1].trim()),
    bodyHtml: rewriteHtml(bodyMatch[1].trim())
  };
}

export function getPageAttrs(page: ExportedPage): WebflowPageAttrs {
  const langMatch = page.htmlAttrs.match(/\blang="([^"]+)"/i);
  const dataWfPageMatch = page.htmlAttrs.match(/\bdata-wf-page="([^"]+)"/i);
  const dataWfSiteMatch = page.htmlAttrs.match(/\bdata-wf-site="([^"]+)"/i);

  return {
    lang: langMatch?.[1] || "en",
    dataWfPage: dataWfPageMatch?.[1],
    dataWfSite: dataWfSiteMatch?.[1]
  };
}

export function replaceInBody(page: ExportedPage, searchValue: string | RegExp, replacement: string) {
  return {
    ...page,
    bodyHtml: page.bodyHtml.replace(searchValue, replacement)
  };
}

export function replaceInHead(page: ExportedPage, searchValue: string | RegExp, replacement: string) {
  return {
    ...page,
    headHtml: page.headHtml.replace(searchValue, replacement)
  };
}
