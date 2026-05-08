# Deploy TamilEelam On Render

## 1. Push The Project To GitHub

Make sure these files are committed:

- `render.yaml`
- `backend/package.json`
- `backend/server.js`
- `sample code.html`
- `enhanced_site.html`
- `Pic.jpeg`
- `pic/`

Do not commit `backend/.env`.

## 2. Create MongoDB Atlas Free Database

Create a free Atlas cluster, then create a database user and copy the connection string.

Use a database name at the end, for example:

```text
mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/tamileelam
```

In Atlas Network Access, allow Render to connect. For a simple first deploy, add:

```text
0.0.0.0/0
```

## 3. Deploy On Render

1. Go to Render.
2. Create a new Blueprint or Web Service from your GitHub repo.
3. If using the blueprint, Render reads `render.yaml`.
4. Add the secret environment variables:

```text
MONGO_URI=your MongoDB Atlas connection string
EMAIL_USER=your Gmail address
EMAIL_PASSWORD=your Gmail app password
ADMIN_EMAIL=where inquiries should be sent
```

Render provides `PORT` automatically, so do not set it manually.

## 4. Test These URLs

After deployment, open:

```text
https://your-render-app.onrender.com/
https://your-render-app.onrender.com/health
https://your-render-app.onrender.com/api/health
```

The homepage should load at `/`, and the API should respond at `/health`.
