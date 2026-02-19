// ==UserScript==
// @name         Reddit Hover Comments (All Reddit Domains)
// @namespace    https://github.com/azizLIGHT
// @version      3.0
// @description  Hover over comment links on any Reddit page to preview top comments in a popup
// @author       azizLIGHT (rewritten for reddit.com compatibility)
// @match        *://reddit.com/*
// @match        *://*.reddit.com/*
// @match        *://old.reddit.com/*
// @match        *://new.reddit.com/*
// @match        *://www.reddit.com/*
// @match        *://sh.reddit.com/*
// @match        *://np.reddit.com/*
// @exclude      *://mod.reddit.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM.xmlHttpRequest
// @connect      reddit.com
// @connect      www.reddit.com
// @connect      old.reddit.com
// @homepageURL  https://github.com/azizLIGHT/rComments
// @supportURL   https://github.com/azizLIGHT/rComments/issues
// @license      MIT
// ==/UserScript==

(function () {
  "use strict";

  // ── CSS ──────────────────────────────────────────────────────
  const CSS = `
    ._rc_popup {
      position: absolute;
      background: #1a1a1b;
      border: 1px solid #343536;
      border-radius: 8px;
      padding: 0;
      z-index: 2147483647;
      width: 560px;
      max-width: calc(100vw - 40px);
      max-height: 520px;
      overflow-y: auto;
      overflow-x: hidden;
      box-shadow: 0 8px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05);
      font-size: 13px;
      line-height: 1.5;
      display: none;
      color: #d7dadc;
      box-sizing: border-box;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    ._rc_popup::-webkit-scrollbar { width: 8px; }
    ._rc_popup::-webkit-scrollbar-track { background: transparent; }
    ._rc_popup::-webkit-scrollbar-thumb {
      background: #3a3a3c;
      border-radius: 4px;
    }
    ._rc_popup::-webkit-scrollbar-thumb:hover { background: #4a4a4c; }

    ._rc_popup ._rc_header {
      position: sticky;
      top: 0;
      background: #1a1a1b;
      border-bottom: 1px solid #343536;
      padding: 8px 12px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      z-index: 2;
      font-size: 11px;
      color: #818384;
    }

    ._rc_popup ._rc_header_title {
      font-weight: 600;
      color: #d7dadc;
      font-size: 12px;
      max-width: 70%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    ._rc_popup ._rc_nav {
      display: flex;
      gap: 4px;
      align-items: center;
    }

    ._rc_popup ._rc_nav_btn {
      background: #2a2a2b;
      border: 1px solid #3a3a3b;
      color: #d7dadc;
      padding: 3px 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 11px;
      font-family: inherit;
      user-select: none;
      transition: background 0.15s;
    }

    ._rc_popup ._rc_nav_btn:hover {
      background: #3a3a3b;
    }

    ._rc_popup ._rc_nav_btn:disabled {
      opacity: 0.3;
      cursor: default;
    }

    ._rc_popup ._rc_nav_count {
      font-size: 11px;
      color: #818384;
      min-width: 40px;
      text-align: center;
    }

    ._rc_popup ._rc_body {
      padding: 10px 12px;
    }

    ._rc_popup ._rc_comment {
      margin-bottom: 10px;
      padding: 8px 10px;
      border-left: 3px solid #0079d3;
      background: rgba(255,255,255,0.03);
      border-radius: 0 6px 6px 0;
    }

    ._rc_popup ._rc_comment:last-child { margin-bottom: 0; }

    ._rc_popup ._rc_meta {
      display: flex;
      align-items: baseline;
      gap: 6px;
      margin-bottom: 4px;
      font-size: 11px;
      color: #818384;
      flex-wrap: wrap;
    }

    ._rc_popup ._rc_author {
      color: #0079d3;
      font-weight: 600;
      text-decoration: none;
      font-size: 12px;
    }

    ._rc_popup ._rc_author:hover { text-decoration: underline; }

    ._rc_popup ._rc_author.op { color: #0079d3; }
    ._rc_popup ._rc_author.op::after {
      content: "OP";
      font-size: 9px;
      background: #0079d3;
      color: #fff;
      padding: 1px 4px;
      border-radius: 3px;
      margin-left: 4px;
      font-weight: 700;
      vertical-align: middle;
    }

    ._rc_popup ._rc_score { color: #ff8b60; font-weight: 600; }
    ._rc_popup ._rc_time { color: #818384; }
    ._rc_popup ._rc_awards { color: #ffd635; font-size: 10px; }

    ._rc_popup ._rc_text {
      font-size: 13px;
      line-height: 1.55;
      color: #d7dadc;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }

    ._rc_popup ._rc_text p { margin: 0 0 0.6em 0; }
    ._rc_popup ._rc_text p:last-child { margin-bottom: 0; }

    ._rc_popup ._rc_text a {
      color: #4fbcff;
      text-decoration: none;
      word-break: break-all;
    }
    ._rc_popup ._rc_text a:hover { text-decoration: underline; }

    ._rc_popup ._rc_text blockquote {
      margin: 0.4em 0;
      padding: 2px 0 2px 10px;
      border-left: 3px solid #4a4a4c;
      color: #a0a0a2;
    }

    ._rc_popup ._rc_text code {
      background: rgba(255,255,255,0.08);
      padding: 1px 5px;
      border-radius: 3px;
      font-size: 0.9em;
      font-family: "SF Mono", Monaco, Consolas, monospace;
    }

    ._rc_popup ._rc_text pre {
      background: rgba(255,255,255,0.06);
      padding: 8px 10px;
      border-radius: 4px;
      overflow-x: auto;
      margin: 0.5em 0;
      font-size: 0.85em;
    }

    ._rc_popup ._rc_text pre code {
      background: none;
      padding: 0;
    }

    ._rc_popup ._rc_text ul, ._rc_popup ._rc_text ol {
      padding-left: 20px;
      margin: 0.4em 0;
    }

    ._rc_popup ._rc_text li { margin-bottom: 2px; }

    /* ── Replies ── */
    ._rc_popup ._rc_replies {
      margin-top: 8px;
      margin-left: 12px;
      padding-left: 10px;
      border-left: 2px solid #343536;
    }

    ._rc_popup ._rc_reply {
      margin-bottom: 8px;
      padding: 6px 8px;
      background: rgba(255,255,255,0.02);
      border-radius: 4px;
    }

    ._rc_popup ._rc_reply:last-child { margin-bottom: 0; }

    ._rc_popup ._rc_reply ._rc_meta { font-size: 10px; }
    ._rc_popup ._rc_reply ._rc_author { font-size: 11px; }
    ._rc_popup ._rc_reply ._rc_text { font-size: 12px; }

    ._rc_popup ._rc_more_replies {
      color: #4fbcff;
      cursor: pointer;
      font-size: 11px;
      margin-top: 4px;
      padding: 3px 8px;
      border-radius: 4px;
      background: rgba(255,255,255,0.04);
      display: inline-block;
      user-select: none;
      border: 1px solid transparent;
      transition: all 0.15s;
    }

    ._rc_popup ._rc_more_replies:hover {
      background: rgba(255,255,255,0.08);
      border-color: #4fbcff;
    }

    /* ── States ── */
    ._rc_popup ._rc_loading {
      text-align: center;
      padding: 24px 16px;
      color: #818384;
      font-size: 12px;
    }

    ._rc_popup ._rc_loading::before {
      content: "";
      display: block;
      width: 24px;
      height: 24px;
      border: 2px solid #343536;
      border-top-color: #0079d3;
      border-radius: 50%;
      animation: _rc_spin 0.7s linear infinite;
      margin: 0 auto 10px;
    }

    @keyframes _rc_spin { to { transform: rotate(360deg); } }

    ._rc_popup ._rc_error {
      text-align: center;
      padding: 24px 16px;
      color: #ea0027;
      font-size: 12px;
    }

    ._rc_popup ._rc_empty {
      text-align: center;
      padding: 24px 16px;
      color: #818384;
      font-size: 12px;
    }

    /* ── Light theme detection ── */
    @media (prefers-color-scheme: light) {
      body:not([style*="dark"]) ._rc_popup {
        background: #ffffff;
        border-color: #edeff1;
        color: #1c1c1c;
        box-shadow: 0 8px 24px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.05);
      }
      body:not([style*="dark"]) ._rc_popup ._rc_header {
        background: #ffffff;
        border-color: #edeff1;
      }
      body:not([style*="dark"]) ._rc_popup ._rc_header_title { color: #1c1c1c; }
      body:not([style*="dark"]) ._rc_popup ._rc_text { color: #1c1c1c; }
      body:not([style*="dark"]) ._rc_popup ._rc_comment {
        background: rgba(0,0,0,0.02);
      }
      body:not([style*="dark"]) ._rc_popup ._rc_nav_btn {
        background: #f6f7f8;
        border-color: #edeff1;
        color: #1c1c1c;
      }
      body:not([style*="dark"]) ._rc_popup ._rc_nav_btn:hover {
        background: #edeff1;
      }
    }
  `;

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  // ── Helpers ────────────────────────────────────────────────

  /**
   * Regex to match Reddit comment page URLs.
   * Captures: /r/{subreddit}/comments/{id}/...
   */
  const COMMENT_URL_RE =
    /^https?:\/\/(?:[a-z]+\.)?reddit\.com\/r\/([^/]+)\/comments\/([a-z0-9]+)/i;

  /**
   * Detect if an <a> element is a "comments" link on a listing page.
   * Works on old.reddit.com, new reddit (sh.reddit.com), and www.reddit.com.
   */
  function getCommentLinkFromElement(el) {
    // Walk up to find an <a> tag
    let node = el;
    let depth = 0;
    while (node && depth < 5) {
      if (node.tagName === "A" && node.href && COMMENT_URL_RE.test(node.href)) {
        // Make sure this looks like a "comments" link, not a random in-text link
        if (isCommentsLink(node)) {
          return node;
        }
      }
      node = node.parentElement;
      depth++;
    }
    return null;
  }

  /**
   * Heuristics to decide if an <a> pointing to a comments page is
   * actually a "N comments" link (not a post title or random link).
   */
  function isCommentsLink(anchor) {
    const text = anchor.textContent.trim().toLowerCase();
    const href = anchor.href;

    // old.reddit.com: <a class="bylink comments may-blank" ...>N comments</a>
    if (anchor.classList.contains("bylink") || anchor.classList.contains("comments")) {
      return true;
    }

    // new reddit / sh.reddit.com: text contains "comment" or a number
    if (/\d+\s*comments?/i.test(text) || text === "comment" || text === "comments") {
      return true;
    }

    // Generic: data attribute hints
    if (anchor.getAttribute("data-click-id") === "comments") {
      return true;
    }

    // shreddit (sh.reddit.com) uses <a slot="..."> or faceplate-* elements
    if (anchor.closest("shreddit-post") || anchor.closest("faceplate-tracker[noun='comment']")) {
      return true;
    }

    // Fallback: if the link text is short and contains a number + "comment"
    if (text.length < 30 && /\bcomment/i.test(text)) {
      return true;
    }

    // old reddit: the "N comments" link in .flat-list
    if (anchor.closest(".flat-list") && /comment/i.test(text)) {
      return true;
    }

    return false;
  }

  /**
   * Normalize a Reddit comment URL to a www.reddit.com .json URL.
   */
  function toJsonUrl(href) {
    const m = href.match(COMMENT_URL_RE);
    if (!m) return null;
    // Build canonical URL — always use www.reddit.com for JSON API
    const subreddit = m[1];
    const postId = m[2];
    return `https://www.reddit.com/r/${subreddit}/comments/${postId}.json?limit=15&depth=3&sort=confidence`;
  }

  /**
   * Cross-origin fetch using GM_xmlhttpRequest (works across reddit subdomains).
   * Falls back to regular fetch if GM APIs are unavailable.
   */
  function gmFetch(url) {
    return new Promise((resolve, reject) => {
      const gmXhr =
        typeof GM_xmlhttpRequest === "function"
          ? GM_xmlhttpRequest
          : typeof GM !== "undefined" && GM.xmlHttpRequest
          ? GM.xmlHttpRequest
          : null;

      if (gmXhr) {
        gmXhr({
          method: "GET",
          url: url,
          headers: {
            Accept: "application/json",
            "User-Agent": "Mozilla/5.0 (rComments Userscript)",
          },
          timeout: 15000,
          onload: (resp) => {
            if (resp.status >= 200 && resp.status < 300) {
              resolve(resp.responseText);
            } else {
              reject(new Error(`HTTP ${resp.status}`));
            }
          },
          onerror: (err) => reject(new Error("Network error")),
          ontimeout: () => reject(new Error("Request timed out")),
        });
      } else {
        // Fallback to fetch (may fail cross-origin)
        fetch(url, {
          headers: { Accept: "application/json" },
          credentials: "omit",
        })
          .then((r) => {
            if (!r.ok) throw new Error(`HTTP ${r.status}`);
            return r.text();
          })
          .then(resolve)
          .catch(reject);
      }
    });
  }

  /**
   * Decode HTML entities in Reddit API body_html.
   */
  function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
  }

  /**
   * Format a score number nicely.
   */
  function formatScore(score) {
    if (score === null || score === undefined || score === false) return "•";
    if (Math.abs(score) >= 100000) return (score / 1000).toFixed(0) + "k";
    if (Math.abs(score) >= 10000) return (score / 1000).toFixed(1) + "k";
    return score.toLocaleString();
  }

  /**
   * Relative time string from UTC epoch seconds.
   */
  function timeAgo(utcSeconds) {
    if (!utcSeconds) return "";
    const diff = Math.floor(Date.now() / 1000) - utcSeconds;
    if (diff < 60) return "just now";
    if (diff < 3600) return Math.floor(diff / 60) + "m ago";
    if (diff < 86400) return Math.floor(diff / 3600) + "h ago";
    if (diff < 2592000) return Math.floor(diff / 86400) + "d ago";
    if (diff < 31536000) return Math.floor(diff / 2592000) + "mo ago";
    return Math.floor(diff / 31536000) + "y ago";
  }

  // ── Data Parsing ───────────────────────────────────────────

  /**
   * Parse the Reddit JSON response into a structured comments array.
   * Reddit returns [postListing, commentListing].
   */
  function parseRedditJson(jsonText) {
    const data = JSON.parse(jsonText);

    if (!Array.isArray(data) || data.length < 2) {
      throw new Error("Unexpected API response format");
    }

    const postData = data[0]?.data?.children?.[0]?.data;
    const commentChildren = data[1]?.data?.children || [];

    const postTitle = postData?.title || "";
    const postAuthor = postData?.author || "[deleted]";
    const postSubreddit = postData?.subreddit_name_prefixed || "";

    const comments = [];

    for (const child of commentChildren) {
      if (child.kind !== "t1") continue; // Skip "more" stubs
      const comment = parseComment(child.data, postAuthor);
      if (comment) comments.push(comment);
    }

    return {
      postTitle,
      postAuthor,
      postSubreddit,
      comments,
    };
  }

  /**
   * Recursively parse a single comment and its replies.
   */
  function parseComment(data, opAuthor) {
    if (!data || !data.body_html) return null;

    const author = data.author || "[deleted]";
    const isOP = author === opAuthor && author !== "[deleted]";

    const comment = {
      id: data.id || data.name || "",
      author,
      isOP,
      score: data.score ?? null,
      scoreHidden: data.score_hidden || false,
      body_html: decodeHTML(data.body_html),
      created_utc: data.created_utc,
      edited: data.edited,
      gilded: data.gilded || 0,
      stickied: data.stickied || false,
      distinguished: data.distinguished,
      replies: [],
    };

    // Parse nested replies
    if (data.replies && data.replies.data && data.replies.data.children) {
      for (const child of data.replies.data.children) {
        if (child.kind !== "t1") continue;
        const reply = parseComment(child.data, opAuthor);
        if (reply) comment.replies.push(reply);
      }
    }

    return comment;
  }

  // ── Rendering ──────────────────────────────────────────────

  function renderCommentHTML(comment, depth = 0) {
    const maxDepth = 3;
    const isReply = depth > 0;
    const cls = isReply ? "_rc_reply" : "_rc_comment";

    const scoreDisplay = comment.scoreHidden
      ? "[score hidden]"
      : formatScore(comment.score) + " pts";

    const time = timeAgo(comment.created_utc);
    const edited = comment.edited ? ' <span style="font-style:italic;">(edited)</span>' : "";
    const opClass = comment.isOP ? " op" : "";
    const distinguished =
      comment.distinguished === "moderator"
        ? ' <span style="color:#2ecc71;font-size:10px;font-weight:700;">[M]</span>'
        : comment.distinguished === "admin"
        ? ' <span style="color:#ea0027;font-size:10px;font-weight:700;">[A]</span>'
        : "";
    const stickied = comment.stickied
      ? ' <span style="color:#2ecc71;font-size:10px;">📌</span>'
      : "";
    const gilded =
      comment.gilded > 0
        ? ` <span class="_rc_awards">🏅×${comment.gilded}</span>`
        : "";

    let html = `<div class="${cls}" data-id="${comment.id}">`;
    html += `<div class="_rc_meta">`;
    html += `<a class="_rc_author${opClass}" href="https://www.reddit.com/user/${comment.author}" target="_blank">u/${comment.author}</a>`;
    html += distinguished + stickied;
    html += `<span class="_rc_score">${scoreDisplay}</span>`;
    if (time) html += `<span class="_rc_time">${time}${edited}</span>`;
    html += gilded;
    html += `</div>`;
    html += `<div class="_rc_text">${comment.body_html}</div>`;

    // Render replies up to maxDepth
    if (comment.replies.length > 0 && depth < maxDepth) {
      html += `<div class="_rc_replies">`;
      for (const reply of comment.replies) {
        html += renderCommentHTML(reply, depth + 1);
      }
      html += `</div>`;
    } else if (comment.replies.length > 0 && depth >= maxDepth) {
      html += `<div class="_rc_more_replies" data-count="${comment.replies.length}">`;
      html += `↳ ${comment.replies.length} more ${comment.replies.length === 1 ? "reply" : "replies"}`;
      html += `</div>`;
    }

    html += `</div>`;
    return html;
  }

  // ── Popup Controller ───────────────────────────────────────

  class RedditCommentPreview {
    constructor() {
      this.popup = null;
      this.currentLink = null;
      this.currentUrl = null;
      this.currentIndex = 0;
      this.parsedData = null;
      this.showTimeout = null;
      this.hideTimeout = null;
      this.cache = new Map();
      this.init();
    }

    init() {
      this.popup = document.createElement("div");
      this.popup.className = "_rc_popup";
      document.body.appendChild(this.popup);
      this.bindEvents();
    }

    bindEvents() {
      // Mouseover delegation
      document.addEventListener("mouseover", (e) => {
        const link = getCommentLinkFromElement(e.target);
        if (link && link !== this.currentLink) {
          this.onEnterLink(link);
        }
      });

      document.addEventListener("mouseout", (e) => {
        const link = getCommentLinkFromElement(e.target);
        if (link && !this.popup.contains(e.relatedTarget)) {
          this.scheduleHide();
        }
      });

      this.popup.addEventListener("mouseenter", () => {
        this.cancelHide();
      });

      this.popup.addEventListener("mouseleave", () => {
        this.scheduleHide();
      });

      // Navigation clicks inside popup
      this.popup.addEventListener("click", (e) => {
        const btn = e.target.closest("._rc_nav_btn");
        if (btn) {
          const dir = btn.dataset.dir;
          if (dir === "prev" && this.currentIndex > 0) {
            this.currentIndex--;
            this.render();
          } else if (
            dir === "next" &&
            this.parsedData &&
            this.currentIndex < this.parsedData.comments.length - 1
          ) {
            this.currentIndex++;
            this.render();
          }
        }
      });

      // Close on Escape
      document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") this.hide();
      });

      // Close on scroll (optional — remove if annoying)
      // window.addEventListener("scroll", () => this.hide(), { passive: true });
    }

    onEnterLink(link) {
      this.currentLink = link;
      this.cancelShow();
      this.cancelHide();

      const jsonUrl = toJsonUrl(link.href);
      if (!jsonUrl) return;

      // If cached, show immediately
      if (this.cache.has(jsonUrl)) {
        this.parsedData = this.cache.get(jsonUrl);
        this.currentIndex = 0;
        this.currentUrl = jsonUrl;
        this.render();
        this.position(link);
        this.popup.style.display = "block";
        return;
      }

      // Show loading after short delay
      this.showTimeout = setTimeout(() => {
        this.showLoading(link);
        this.fetchComments(jsonUrl, link);
      }, 300);
    }

    async fetchComments(jsonUrl, link) {
      this.currentUrl = jsonUrl;
      try {
        const text = await gmFetch(jsonUrl);
        // If user moved away while loading, don't render
        if (this.currentUrl !== jsonUrl) return;

        const parsed = parseRedditJson(text);
        this.cache.set(jsonUrl, parsed);
        this.parsedData = parsed;
        this.currentIndex = 0;
        this.render();
        this.position(link);
        this.popup.style.display = "block";
      } catch (err) {
        if (this.currentUrl !== jsonUrl) return;
        this.popup.querySelector("._rc_body").innerHTML = `
          <div class="_rc_error">
            Failed to load comments<br>
            <span style="font-size:11px;color:#818384;">${err.message}</span>
          </div>`;
      }
    }

    showLoading(link) {
      this.popup.innerHTML = `
        <div class="_rc_body">
          <div class="_rc_loading">Loading comments…</div>
        </div>`;
      this.position(link);
      this.popup.style.display = "block";
    }

    render() {
      if (!this.parsedData) return;

      const { postTitle, postSubreddit, comments } = this.parsedData;
      const total = comments.length;

      if (total === 0) {
        this.popup.innerHTML = `
          <div class="_rc_header">
            <span class="_rc_header_title">${this.escapeHTML(postTitle)}</span>
          </div>
          <div class="_rc_body">
            <div class="_rc_empty">No comments yet</div>
          </div>`;
        return;
      }

      const idx = this.currentIndex;
      const comment = comments[idx];

      let html = `
        <div class="_rc_header">
          <span class="_rc_header_title" title="${this.escapeHTML(postTitle)}">${this.escapeHTML(postTitle)}</span>
          <div class="_rc_nav">
            <button class="_rc_nav_btn" data-dir="prev" ${idx === 0 ? "disabled" : ""}>◀</button>
            <span class="_rc_nav_count">${idx + 1} / ${total}</span>
            <button class="_rc_nav_btn" data-dir="next" ${idx === total - 1 ? "disabled" : ""}>▶</button>
          </div>
        </div>
        <div class="_rc_body">`;

      html += renderCommentHTML(comment, 0);
      html += `</div>`;

      this.popup.innerHTML = html;
    }

        position(link) {
      const rect = link.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const popupWidth = 560;

      // Vertical: prefer below the link, flip above if not enough space
      let top = rect.bottom + scrollTop + 4;
      const spaceBelow = viewportHeight - rect.bottom;
      if (spaceBelow < 260 && rect.top > 260) {
        // Show above
        top = rect.top + scrollTop - 4;
        // We'll adjust after display to get actual height
        this.popup.style.top = `${top}px`;
        this.popup.style.left = `0px`;
        this.popup.style.display = "block";
        const popupHeight = this.popup.offsetHeight;
        top = rect.top + scrollTop - popupHeight - 4;
      }

      // Horizontal: align left with link, but keep on screen
      let left = rect.left + scrollLeft;
      if (left + popupWidth > viewportWidth + scrollLeft - 20) {
        left = Math.max(10, viewportWidth + scrollLeft - popupWidth - 20);
      }
      if (left < scrollLeft + 10) {
        left = scrollLeft + 10;
      }

      this.popup.style.top = `${Math.max(scrollTop + 4, top)}px`;
      this.popup.style.left = `${left}px`;
    }

    scheduleHide() {
      this.cancelHide();
      this.hideTimeout = setTimeout(() => {
        this.hide();
      }, 350);
    }

    cancelHide() {
      if (this.hideTimeout) {
        clearTimeout(this.hideTimeout);
        this.hideTimeout = null;
      }
    }

    cancelShow() {
      if (this.showTimeout) {
        clearTimeout(this.showTimeout);
        this.showTimeout = null;
      }
    }

    hide() {
      this.popup.style.display = "none";
      this.currentLink = null;
      this.currentUrl = null;
      this.parsedData = null;
      this.cancelShow();
      this.cancelHide();
    }

    escapeHTML(str) {
      if (!str) return "";
      return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
    }
  }

  // ── Initialization ─────────────────────────────────────────

  // Don't run inside iframes
  if (window.self !== window.top) return;

  // Don't run on individual comment pages (we only want listing/feed pages)
  // But DO allow it — users may want to preview linked threads in comments
  // So we only skip if there's nothing to hover over.

  function start() {
    new RedditCommentPreview();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
