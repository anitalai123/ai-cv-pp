#!/usr/bin/env python3
"""Local development server for the prototype.

The same static files as `python3 -m http.server`, with caching turned off.
Python's stock handler sends no Cache-Control header, so browsers apply
heuristic caching and keep serving an edited assets/*.js or styles.css from
disk without asking whether it changed. no-store stops that, so a plain
reload always picks up the latest edit.

Local development only - the deployed site is served by Vercel, which is
unaffected by anything here.

    python3 serve.py [port]
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORT = 8123


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()


def main():
    port = int(sys.argv[1]) if len(sys.argv) > 1 else PORT
    handler = partial(NoCacheHandler, directory=str(Path(__file__).parent))
    with ThreadingHTTPServer(("", port), handler) as httpd:
        print(f"Serving the prototype on http://localhost:{port} (no caching)")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nStopped.")


if __name__ == "__main__":
    main()
