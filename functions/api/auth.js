// OAuth handler for Decap CMS with GitHub
// Based on https://github.com/sveltia/sveltia-cms-auth

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  const client_id = env.GITHUB_CLIENT_ID;
  const client_secret = env.GITHUB_CLIENT_SECRET;

  // Step 1: Redirect to GitHub for authorization
  if (url.searchParams.get('auth') === 'github') {
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    authUrl.searchParams.set('client_id', client_id);
    authUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth`);
    authUrl.searchParams.set('scope', 'repo user');
    authUrl.searchParams.set('state', crypto.randomUUID());

    return Response.redirect(authUrl.toString(), 302);
  }

  // Step 2: Handle callback from GitHub
  const code = url.searchParams.get('code');

  if (code) {
    try {
      // Exchange code for access token
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

      // Return HTML that sends the token back to the CMS
      const html = `
<!DOCTYPE html>
<html>
<head>
  <title>Authorization Complete</title>
</head>
<body>
  <script>
    (function() {
      function sendMessage(message) {
        const target = window.opener || window.parent;
        target.postMessage(message, '*');
      }

      sendMessage('authorization:github:success:${JSON.stringify({
        token: tokenData.access_token,
        provider: 'github',
      })}');

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

  // Default: redirect to GitHub auth
  const authUrl = new URL('https://github.com/login/oauth/authorize');
  authUrl.searchParams.set('client_id', client_id);
  authUrl.searchParams.set('redirect_uri', `${url.origin}/api/auth`);
  authUrl.searchParams.set('scope', 'repo user');

  return Response.redirect(authUrl.toString(), 302);
}
