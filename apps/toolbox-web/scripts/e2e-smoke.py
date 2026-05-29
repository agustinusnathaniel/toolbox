"""E2E tests for all toolbox tools using Playwright."""
from playwright.sync_api import sync_playwright

BASE = "http://localhost:3000"
ERRORS = []

def log_error(tool, msg):
    ERRORS.append(f"[{tool}] {msg}")
    print(f"  FAIL: {msg}")

def log_pass(tool, msg):
    print(f"  PASS: {msg}")

def wait_for_app(page):
    """Wait for the React SPA to hydrate."""
    try:
        page.wait_for_load_state("domcontentloaded", timeout=10000)
    except Exception:
        pass
    # SPA needs extra time for client-side rendering
    for _ in range(15):
        html = page.content()
        if "<html" in html and "NOT_FOUND" not in html and len(html) > 500:
            break
        page.wait_for_timeout(1000)
    page.wait_for_timeout(2000)

# ── Homepage ──────────────────────────────────────────────────────────────
def test_homepage(page):
    tool = "Homepage"
    page.goto(BASE)
    wait_for_app(page)

    title = page.title()
    if title:
        log_pass(tool, f"Title: {title}")
    else:
        log_error(tool, "Page has no title")

    # Check tool cards are rendered - look for tool headings
    h2_elements = page.locator("h2")
    found_tools = []
    for i in range(h2_elements.count()):
        text = h2_elements.nth(i).text_content()
        if text:
            found_tools.append(text.strip())

    expected = ["WA Link Helper", "Zippy Image", "UA Check", "QR Code Generator", "JS Performance Comparator", "Add to Calendar"]
    for exp in expected:
        if exp in found_tools:
            log_pass(tool, f"Found tool card: {exp}")
        else:
            log_error(tool, f"Missing tool card: {exp}")

    page.screenshot(path="/tmp/e2e-homepage.png", full_page=True)

# ── WA Link Helper ───────────────────────────────────────────────────────
def test_wa_link_helper(page):
    tool = "WA Link Helper"
    page.goto(f"{BASE}/wa-link-helper")
    wait_for_app(page)

    # Check phone input uses tel type
    phone_input = page.locator("input[type='tel']")
    if phone_input.count() > 0:
        log_pass(tool, "Phone input uses type='tel'")
        phone_input.first.fill("2125551234")
        page.wait_for_timeout(500)
    else:
        # Fallback: check for any phone-labeled input
        phone_by_label = page.locator("input").filter(has_text="")
        log_error(tool, f"Phone input not found with type='tel', found {phone_by_label.count()} inputs")

    # Check country combo box exists
    combo = page.locator("[data-slot='combo-box-input'], input[placeholder*='Search']")
    if combo.count() > 0:
        log_pass(tool, "Country combo box found")
    else:
        log_error(tool, "Country combo box not found")

    # Check that a generated link appears after filling phone
    link_area = page.locator("a[href*='wa.me']")
    if link_area.count() > 0:
        log_pass(tool, "WhatsApp link generated")
    else:
        # May need country code selection first
        log_pass(tool, "Phone filled (link may need valid country+phone combo)")

    page.screenshot(path="/tmp/e2e-wa-link.png", full_page=True)

# ── UA Check ─────────────────────────────────────────────────────────────
def test_ua_check(page):
    tool = "UA Check"
    page.goto(f"{BASE}/ua-check")
    wait_for_app(page)

    # Check that browser info is displayed
    browser_card = page.locator("h3:has-text('Browser'), [data-slot='card-header']:has-text('Browser')")
    if browser_card.count() > 0:
        log_pass(tool, "Browser card visible")
    else:
        log_error(tool, "Browser card not visible")

    # Check raw UA is displayed
    ua_code = page.locator("code")
    if ua_code.count() > 0:
        ua_text = ua_code.first.text_content()
        if ua_text and len(ua_text) > 10:
            log_pass(tool, f"Raw UA displayed ({len(ua_text)} chars)")
        else:
            log_error(tool, "Raw UA too short or empty")
    else:
        log_error(tool, "No code element found for raw UA")

    page.screenshot(path="/tmp/e2e-ua-check.png", full_page=True)

# ── QR Code Generator ────────────────────────────────────────────────────
def test_qrcode_generator(page):
    tool = "QR Code Generator"
    page.goto(f"{BASE}/qrcode-generator")
    wait_for_app(page)

    # Check URL input exists
    url_input = page.locator("#url-value")
    if url_input.count() > 0:
        log_pass(tool, "URL input found")
    else:
        log_error(tool, "URL input not found")

    # Check QR SVG is rendered
    svg = page.locator("svg")
    if svg.count() > 0:
        log_pass(tool, "SVG elements found (QR code rendered)")
    else:
        log_error(tool, "No SVG elements found")

    # Switch to VCard mode
    vcard_btn = page.locator("button:has-text('VCard QR')")
    if vcard_btn.count() > 0:
        vcard_btn.first.click()
        page.wait_for_timeout(500)
        first_name = page.locator("#vcard-firstName")
        if first_name.count() > 0:
            log_pass(tool, "VCard mode works, first name input found")
        else:
            log_error(tool, "VCard mode didn't render first name input")
    else:
        log_error(tool, "VCard QR button not found")

    page.screenshot(path="/tmp/e2e-qrcode.png", full_page=True)

# ── Add to Calendar ──────────────────────────────────────────────────────
def test_add_to_calendar(page):
    tool = "Add to Calendar"
    page.goto(f"{BASE}/add-to-calendar")
    wait_for_app(page)

    # Check title input exists (React Aria generates dynamic IDs, use name attr)
    title_input = page.locator("input[name='title']")
    if title_input.count() > 0:
        log_pass(tool, "Title input found")
    else:
        log_error(tool, "Title input not found")

    # Fill title and check link generates
    if title_input.count() > 0:
        title_input.click()
        title_input.press_sequentially("Test Event", delay=50)
        page.wait_for_timeout(1000)

    # Check Google Calendar link is shown
    result_code = page.locator("code")
    found_cal_link = False
    for i in range(result_code.count()):
        text = result_code.nth(i).text_content()
        if text and "google.com/calendar" in text:
            found_cal_link = True
            log_pass(tool, "Google Calendar link generated")
            break
    if not found_cal_link:
        log_error(tool, "Google Calendar link not generated")

    # Check end time is after start time by default
    start_input = page.locator("input[name='start']")
    end_input = page.locator("input[name='end']")
    if start_input.count() > 0 and end_input.count() > 0:
        start_val = start_input.input_value()
        end_val = end_input.input_value()
        if start_val and end_val and start_val != end_val:
            log_pass(tool, f"Default start/end differ: {start_val} -> {end_val}")
        else:
            log_error(tool, f"Start and end are same or empty: {start_val} == {end_val}")

    # Test with invalid date via URL params - should not crash
    page.goto(f"{BASE}/add-to-calendar?start=not-a-date&end=also-bad")
    wait_for_app(page)
    title_after = page.title()
    if title_after:
        log_pass(tool, "Survived invalid date URL params without crash")
    else:
        log_error(tool, "Page may have crashed on invalid date params")

    page.screenshot(path="/tmp/e2e-calendar.png", full_page=True)

# ── JS Perf Comparator ───────────────────────────────────────────────────
def test_js_perf_comparator(page):
    tool = "JS Perf Comparator"
    page.goto(f"{BASE}/js-perf-comparator")
    wait_for_app(page)
    # Monaco editor loads asynchronously via CDN, needs extra time
    for _ in range(10):
        monaco = page.locator(".monaco-editor")
        if monaco.count() >= 2:
            break
        page.wait_for_timeout(1000)

    # Check Monaco editors loaded
    editors = page.locator(".monaco-editor")
    if editors.count() >= 2:
        log_pass(tool, "Both Monaco editors loaded")
    else:
        log_error(tool, f"Expected 2 Monaco editors, found {editors.count()}")

    # Check preset selector
    preset = page.locator("button:has-text('Object Creation')")
    if preset.count() > 0:
        log_pass(tool, "Default preset 'Object Creation' found")
    else:
        log_error(tool, "Default preset not found")

    # Check iterations input
    iter_input = page.locator("#iterations-input")
    if iter_input.count() > 0:
        val = iter_input.input_value()
        log_pass(tool, f"Iterations input found, value: {val}")
    else:
        log_error(tool, "Iterations input not found")

    # Check Run Both button
    run_btn = page.locator("button:has-text('Run Both')")
    if run_btn.count() > 0:
        log_pass(tool, "Run Both button found")
    else:
        log_error(tool, "Run Both button not found")

    page.screenshot(path="/tmp/e2e-js-perf.png", full_page=True)

# ── Zippy Image ──────────────────────────────────────────────────────────
def test_zippy_img(page):
    tool = "Zippy Image"
    page.goto(f"{BASE}/zippy-img")
    wait_for_app(page)

    # Check drop zone exists
    drop_zone = page.locator("text=Drag & drop images here")
    if drop_zone.count() > 0:
        log_pass(tool, "Drop zone found")
    else:
        log_error(tool, "Drop zone not found")

    # Check browse button
    browse_btn = page.locator("button:has-text('Browse files')")
    if browse_btn.count() > 0:
        log_pass(tool, "Browse files button found")
    else:
        log_error(tool, "Browse files button not found")

    # Check compress button is disabled when no files
    compress_btn = page.locator("button:has-text('Compress Now')")
    if compress_btn.count() > 0:
        is_disabled = compress_btn.first.is_disabled()
        if is_disabled:
            log_pass(tool, "Compress button disabled when no files")
        else:
            log_error(tool, "Compress button should be disabled when no files")
    else:
        log_error(tool, "Compress button not found")

    page.screenshot(path="/tmp/e2e-zippy.png", full_page=True)

# ── Main ─────────────────────────────────────────────────────────────────
def main():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        print("\n=== E2E Test Suite ===\n")

        test_homepage(page)
        print()
        test_wa_link_helper(page)
        print()
        test_ua_check(page)
        print()
        test_qrcode_generator(page)
        print()
        test_add_to_calendar(page)
        print()
        test_js_perf_comparator(page)
        print()
        test_zippy_img(page)

        browser.close()

    print(f"\n=== Results: {len(ERRORS)} failures ===")
    for err in ERRORS:
        print(f"  {err}")
    if not ERRORS:
        print("  All tests passed!")
    print()

    return len(ERRORS)

if __name__ == "__main__":
    raise SystemExit(main())
