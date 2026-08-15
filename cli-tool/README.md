# CLI Tool - Notes

A simple, beautiful command-line note-taking tool built in Go.

## Features

- Add, list, show, and delete notes
- Pin important notes to the top
- Colored terminal output
- Persistent storage in `~/.cli-tool/notes.json`
- Clean, minimal design

## Installation

### From Source

```bash
# Clone the repository
git clone https://github.com/krishnachaudhary/cli-tool.git
cd cli-tool

# Build
go build -o notes .

# Move to PATH (optional)
# Windows: copy notes.exe to a directory in your PATH
# Linux/Mac: sudo mv notes /usr/local/bin/
```

### Using `go install`

```bash
go install github.com/krishnachaudhary/cli-tool@latest
```

## Usage

```bash
# Add a note
notes add "My First Note"
notes add "With content" -c "This is the content"
notes add "Pinned note" -p

# List all notes
notes list

# Show a note
notes show 1

# Delete a note
notes delete 1

# Pin/unpin a note
notes pin 1

# Version
notes version
```

## Example

```
$ notes add "Grocery list" -c "Milk, eggs, bread"
✓ Note added: Grocery list

$ notes list
Notes
─
  1. Grocery list 📌
      Milk, eggs, bread
      Jan 15, 14:30
```

## License

MIT
