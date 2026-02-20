# Zenith AI Task Manager - Troubleshooting Guide

## Common Problems & Fixes

| Problem | Potential Cause | Solution |
| :--- | :--- | :--- |
| **Blank Screen on Load** | Missing or invalid Firebase keys in `.env`. | Verify `VITE_FIREBASE_*` variables and restart the dev server. |
| **AI Suggestions Not Appearing** | `API_KEY` (Gemini) missing or quota exceeded. | Check `process.env.API_KEY` in the console. Ensure the key has Gemini API enabled. |
| **"Establishing Neural Link" Stuck** | Firebase Auth listener not firing. | Check internet connection and Firebase project status. |
| **Terminal Returns "ERR"** | Antigravity model (Pro) failing or key invalid. | Verify the API key supports `gemini-3-pro-preview`. |
| **Camera/Mic Access Denied** | Browser permissions blocked or non-HTTPS env. | Grant permissions in the browser address bar. HAL requires a secure context. |
| **OTP Signal Not Received** | Invalid phone format or Firebase quota. | Use E.164 format (e.g., +1234567890). Check Firebase SMS usage limits. |

## Error Log Reference

### `Extraction_Error`
- **Cause**: Gemini Flash failed to parse the input or returned invalid JSON.
- **Fix**: Try a clearer task title. Check if `responseMimeType: "application/json"` is supported.

### `HAL_ACCESS_DENIED`
- **Cause**: User rejected camera/mic permission or hardware is in use by another app.
- **Fix**: Refresh the page and accept the permission prompt.

### `Firebase Critical Handshake Error`
- **Cause**: Network block or invalid project ID.
- **Fix**: Check firewall settings and ensure the `projectId` matches your Firebase console.

## Technical Support
For advanced debugging, open the **Antigravity Console** and type `system status` to see internal neural weights and connection integrity.
