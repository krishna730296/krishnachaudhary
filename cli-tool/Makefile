.PHONY: build clean install run

build:
	go build -o notes .

clean:
	rm -f notes.exe notes

run:
	go run .

install: build
	go install
