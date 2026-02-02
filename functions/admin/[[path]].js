// This function injects the GitHub token into the admin page
// Cloudflare Access protects this route, so only authenticated users reach here

export async function onRequestGet(context) {
  const { request, env, next } = context;

  // Get the original response (the static admin/index.html)
  const response = await next();

  // Only modify HTML responses
  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('text/html')) {
    return response;
  }

  // Get the GitHub token from environment variable
  const token = env.GITHUB_TOKEN;

  if (!token) {
    return response;
  }

  // Read the HTML and inject the token
  let html = await response.text();

  // Inject the token as a global variable before other scripts run
  const tokenScript = `<script>window.CMS_GITHUB_TOKEN = "${token}";</script>`;
  html = html.replace('<head>', `<head>\n  ${tokenScript}`);

  return new Response(html, {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  });
}
