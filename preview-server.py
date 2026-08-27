"""
Local preview server for the Snowdrop United site.

Run it through preview-site.bat (double-click), or directly:  python preview-server.py

Why this exists instead of a plain `python -m http.server`:
  * It picks a free port. Port 8000 is often already taken by another project,
    and the failure mode there is confusing -- the browser opens and shows
    somebody else's site.
  * It binds to 127.0.0.1 only. The stdlib default is 0.0.0.0, which serves the
    whole local network.
  * It opens the browser for you, after the socket is actually listening.
  * It disables caching, so a reload always picks up your latest edit.
"""

import functools
import http.server
import os
import socket
import socketserver
import sys
import threading
import webbrowser

PREFERRED_PORTS = [8080, 8090, 5500, 4321, 8321]
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    """Static handler that never lets the browser cache anything."""

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):
        # Keep 404s (useful -- the image loader relies on them) but drop the
        # constant 200 noise so the window stays readable.
        if args and str(args[1]) != "200":
            sys.stderr.write("  %s %s\n" % (args[1], args[0]))


def is_free(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        probe.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        try:
            probe.bind(("127.0.0.1", port))
            return True
        except OSError:
            return False


def pick_port():
    for port in PREFERRED_PORTS:
        if is_free(port):
            return port
    # Everything preferred is taken -- let the OS hand us any free port.
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as probe:
        probe.bind(("127.0.0.1", 0))
        return probe.getsockname()[1]


def main():
    os.chdir(ROOT)
    port = pick_port()
    url = "http://localhost:%d/index.html" % port

    handler = functools.partial(Handler, directory=ROOT)

    try:
        server = socketserver.ThreadingTCPServer(("127.0.0.1", port), handler)
    except OSError as exc:
        print("\n  Could not start the server on port %d: %s\n" % (port, exc))
        return 1

    server.daemon_threads = True

    print("")
    print("  Snowdrop United - local preview")
    print("  " + "-" * 42)
    print("  Serving : %s" % ROOT)
    print("  URL     : %s" % url)
    print("")
    print("  Press Ctrl+C (or close this window) to stop.")
    print("")

    # Open the browser once we know the socket is bound, so there is no race
    # against a server that is still starting up.
    threading.Timer(0.4, lambda: webbrowser.open(url)).start()

    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\n  Stopped.\n")
    finally:
        server.shutdown()
        server.server_close()
    return 0


if __name__ == "__main__":
    sys.exit(main())
