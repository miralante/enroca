"""Loopback preview with reliable JavaScript MIME types, including on Windows."""
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class Handler(SimpleHTTPRequestHandler):
    extensions_map = {**SimpleHTTPRequestHandler.extensions_map,
                      '.js': 'text/javascript', '.css': 'text/css',
                      '.json': 'application/json', '.svg': 'image/svg+xml',
                      '.woff2': 'font/woff2'}


if __name__ == '__main__':
    root = Path(__file__).resolve().parent.parent
    server = ThreadingHTTPServer(('127.0.0.1', 8099), partial(Handler, directory=str(root)))
    print('Enroca: http://127.0.0.1:8099/', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.server_close()
