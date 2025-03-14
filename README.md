# showthework-backend
Backend server for ShowTheWork application


# Secure Content Viewer

A secure client-facing website for viewing protected content with anti-screenshot and content protection features.

## Features

- **Screenshot Prevention**:
  - Disabled right-click, drag-and-drop, and text/image selection
  - Blocked keyboard shortcuts (Print Screen, Ctrl/Cmd+C, etc.)
  - Transparent overlay to prevent screen capture
  - Mobile screenshot prevention using allowContentCapture meta tag

- **Dynamic Watermarking**:
  - Semi-transparent watermarks with timestamp
  - Canvas-based overlay
  - Customizable watermark text

- **Access Control**:
  - Password protection
  - Session timeout (30 minutes by default)
  - Automatic logout on inactivity

- **Additional Security**:
  - Fullscreen mode enforcement
  - Content blur on tab switching/window resize
  - DevTools detection
  - Legal warnings for unauthorized capture attempts

- **Mobile Optimization**:
  - Disabled pinch-to-zoom
  - Responsive design
  - Cross-browser compatibility

## Setup

1. Place your protected content (images, designs) in the same directory
2. Update the `ACCESS_CODE` in `security.js` (default: 'demo123')
3. Customize the `CONFIG` object in `security.js` for:
   - Session timeout duration
   - Watermark text
   - Fullscreen requirement

## Usage

1. Host the files on a secure HTTPS server
2. Access the website through a modern browser
3. Enter the access code to view protected content
4. Content will be displayed with security measures active

## Security Notes

- This implementation provides multiple layers of protection but is not 100% foolproof
- For additional security:
  - Implement server-side authentication
  - Store sensitive configuration on the server
  - Add rate limiting for access attempts
  - Use secure cookies and session management
  - Implement IP-based access control

## Browser Compatibility

Tested and working on:
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+
- Mobile Chrome and Safari

## Development

To modify the security features:
1. Edit `security.js` for behavior changes
2. Modify `styles.css` for visual adjustments
3. Update `index.html` for content structure

## License

This project is protected by copyright law. Unauthorized distribution or modification is prohibited. 
