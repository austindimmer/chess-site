#!/usr/bin/env bash
cd "$(dirname "$0")"
# ThreadingHTTPServer serves HTML + CSS + assets in parallel so the
# stylesheet never stalls behind the HTML on a refresh, which was
# causing a flash of unstyled content.
python3 -c "from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer; ThreadingHTTPServer(('', 8000), SimpleHTTPRequestHandler).serve_forever()"
