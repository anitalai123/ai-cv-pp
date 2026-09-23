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

import json
import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent / "api"))


def load_env():
    """Read ANTHROPIC_API_KEY out of a local .env, so the key never has to be
    pasted into a shell or, worse, into the repo. .env is gitignored."""
    path = Path(__file__).parent / ".env"
    if not path.exists():
        return
    for line in path.read_text().splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip("\"'"))

PORT = 8123


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, max-age=0")
        super().end_headers()

    def do_POST(self):
        """Vercel serves api/feedback.py itself; locally we call into the same
        module, so there is one implementation to keep working."""
        if self.path.rstrip("/") != "/api/feedback":
            self.send_error(404)
            return

        length = int(self.headers.get("Content-Length") or 0)
        try:
            data = json.loads(self.rfile.read(length) or b"{}")
        except ValueError:
            self._send_json(400, {"error": "Could not read the request"})
            return

        try:
            import feedback
            self._send_json(200, feedback.feedback(data))
        except ImportError:
            self._send_json(503, {"error": "pip install anthropic to use AI feedback"})
        except RuntimeError as error:
            self._send_json(503, {"error": str(error)})
        except Exception as error:
            self._send_json(502, {"error": type(error).__name__ + ": " + str(error)})

    def _send_json(self, status, payload):
        body = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def main():
    load_env()
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
