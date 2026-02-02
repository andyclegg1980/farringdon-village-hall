export async function onRequestGet(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const client_id = env.GITHUB_CLIENT_ID;
  const client_secret = env.GITHUB_CLIENT_SECRET;

  const code = url.searchParams.get('code');

  // If we have a code, exchange it for a token
  if (code) {
    try {
      const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id,
          client_secret,
          code,
        }),
      });

      const tokenData = await tokenResponse.json();

      if (tokenData.error) {
        return new Response(`Error: ${tokenData.error_description}`, { status: 400 });
      }

      const html = `<!DOCTYPE html>
<html>
<head><title>Authorization Complete</title></head>
<body>
<script>
(function() {
  const token = "${tokenData.access_token}";
  const message = "authorization:github:success:" + JSON.stringify({ token: token, provider: "github" });
  (window.opener || window.parent).postMessage(message, "*");
  window.close();
})();
</script>
<p>Authorization complete. This window should close automatically.</p>
</body>
</html>`;

      return new Response(html, {
        headers: { 'Content-Type': 'text/html' },
      });

    } catch (error) {
      return new Response(`Authentication error: ${error.message}`, { status: 500 });
    }
  }

  // No code - redirect to GitHub for authorization
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', client_id);
  authUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth`);
  authUrl.searchParams.set('scope', 'repo user');

  return Response.redirect(authUrl.toString(), 302);
}
