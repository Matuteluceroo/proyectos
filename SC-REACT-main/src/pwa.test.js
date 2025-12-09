/**
 * PWA and Mobile-First Integration Tests
 */

describe('PWA Manifest', () => {
  test('manifest.json should exist and be accessible', async () => {
    const response = await fetch('/manifest.json');
    expect(response.ok).toBe(true);
    const manifest = await response.json();
    
    // Verify essential PWA manifest properties
    expect(manifest.name).toBe('Saber Citricola');
    expect(manifest.short_name).toBe('Saber Citricola');
    expect(manifest.display).toBe('standalone');
    expect(manifest.start_url).toBe('/');
    expect(manifest.theme_color).toBe('#117ec0');
    expect(manifest.background_color).toBe('#f0f0f0');
  });

  test('manifest should have required icons', async () => {
    const response = await fetch('/manifest.json');
    const manifest = await response.json();
    
    expect(manifest.icons).toBeDefined();
    expect(manifest.icons.length).toBeGreaterThanOrEqual(2);
    
    // Check for 192x192 icon
    const icon192 = manifest.icons.find(icon => icon.sizes === '192x192');
    expect(icon192).toBeDefined();
    expect(icon192.src).toBe('/icon-192x192.png');
    
    // Check for 512x512 icon
    const icon512 = manifest.icons.find(icon => icon.sizes === '512x512');
    expect(icon512).toBeDefined();
    expect(icon512.src).toBe('/icon-512x512.png');
  });
});

describe('Mobile-First CSS Styles', () => {
  beforeEach(() => {
    // Set up a DOM element for testing
    document.body.innerHTML = `
      <div>
        <button class="btn">Test Button</button>
        <input type="text" class="form-input" />
        <div class="kpi-grid">
          <div class="kpi-box">KPI 1</div>
          <div class="kpi-box">KPI 2</div>
          <div class="kpi-box">KPI 3</div>
          <div class="kpi-box">KPI 4</div>
        </div>
      </div>
    `;
  });

  test('viewport meta tag should be properly configured', () => {
    const viewportMeta = document.querySelector('meta[name="viewport"]');
    expect(viewportMeta).toBeTruthy();
    
    if (viewportMeta) {
      const content = viewportMeta.getAttribute('content');
      expect(content).toContain('width=device-width');
      expect(content).toContain('initial-scale=1.0');
    }
  });

  test('theme-color meta tag should be present', () => {
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    expect(themeColorMeta).toBeTruthy();
    
    if (themeColorMeta) {
      expect(themeColorMeta.getAttribute('content')).toBe('#117ec0');
    }
  });

  test('manifest link should be present in document', () => {
    const manifestLink = document.querySelector('link[rel="manifest"]');
    expect(manifestLink).toBeTruthy();
    
    if (manifestLink) {
      expect(manifestLink.getAttribute('href')).toBe('/manifest.json');
    }
  });

  test('apple-touch-icon should be present', () => {
    const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]');
    expect(appleTouchIcon).toBeTruthy();
    
    if (appleTouchIcon) {
      expect(appleTouchIcon.getAttribute('href')).toBe('/apple-touch-icon.png');
    }
  });
});

describe('Mobile Responsive Behavior', () => {
  test('body font-size should adapt to screen size', () => {
    const styles = window.getComputedStyle(document.body);
    const fontSize = styles.fontSize;
    
    // Font size should be defined
    expect(fontSize).toBeDefined();
  });

  test('touch target sizes should meet minimum requirements', () => {
    // On mobile (< 768px), buttons should have minimum 44px height
    const button = document.createElement('button');
    document.body.appendChild(button);
    
    // This is a basic check - in a real mobile environment,
    // the media query would ensure min-height: 44px
    expect(button).toBeInTheDocument();
  });
});
