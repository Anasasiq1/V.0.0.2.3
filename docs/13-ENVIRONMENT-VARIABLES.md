# 13 - Environment Variables Reference

This reference lists all supported environment variables used across development and production environments.

---

## Environment Variables Matrix

| Variable Name | Description | Required | Default Value | Example |
|---------------|-------------|----------|---------------|---------|
| `PORT` | HTTP Server port | Yes | `3000` | `3000` |
| `NODE_ENV` | Runtime environment mode | Recommended | `development` | `production` |
| `APP_URL` | Fully qualified domain URL | Yes | `http://localhost:3000` | `https://store-wa.hm-q.in` |
| `GEMINI_API_KEY` | Gemini AI API key | Optional | Empty | `AIzaSy...` |
| `MYSQL_HOST` | MySQL database host | Optional | `localhost` | `127.0.0.1` |
| `MYSQL_PORT` | MySQL database port | Optional | `3306` | `3306` |
| `MYSQL_USER` | MySQL database user | Optional | `root` | `hmqin` |
| `MYSQL_PASSWORD` | MySQL database password | Optional | Empty | `<SECURE_PASSWORD>` |
| `MYSQL_DATABASE` | MySQL database name | Optional | `hyperlocal` | `hmqin` |

---

## Security Best Practices for Environment Variables

1. **Never commit `.env` to Git**: Ensure `.env` is listed in `.gitignore`.
2. **Use `.env.example` as template**: Keep `.env.example` committed with safe placeholders.
3. **Restricted Server Permissions**: Set file permissions on production `.env`:
   ```bash
   chmod 600 .env
   ```
