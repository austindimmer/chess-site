# Chess Site

Chess Website

## Local Test Server

The YouTube player in `lessons.html` requires the page to be loaded over HTTP/HTTPS.
Opening the file directly with `file://` causes browser security issues and can show "Error 153".

### Run locally

From the project folder:

```bash
cd /Users/jamesdimmer/Desktop/Design\ MrKumar\ M3\ Website
python3 -m http.server 8000
```

Then open:

http://localhost:8000/lessons.html

### Alternative helper

If you want, run the included script:

```bash
./serve.sh
```
