VERSION ?= v0.8.3
PORT = 9988

gen-client:
	mkdir -p bin
	curl -L -o ./bin/api.ridl https://raw.githubusercontent.com/webrpc/webrpc/$(VERSION)/tests/schema/api.ridl
	docker run -v $(shell pwd):$(shell pwd) ghcr.io/webrpc/webrpc-gen:$(VERSION) -schema=$(shell pwd)/bin/api.ridl -target=typescript -client -out=$(shell pwd)/src/client.ts

# Pipeline did not have access to use the docker image even after I logged in to ghcr docker registry
# TODO: Use gen-client for local and ci runtime
gen-client-ci:
	mkdir -p bin
	curl -L -o ./bin/api.ridl https://raw.githubusercontent.com/webrpc/webrpc/$(VERSION)/tests/schema/api.ridl
	curl -L -o ./bin/webrpc https://github.com/webrpc/webrpc/releases/download/$(VERSION)/webrpc-gen.linux-amd64
	chmod +x ./bin/webrpc
	./bin/webrpc -schema=$(shell pwd)/bin/api.ridl -target=$(shell pwd) -client -out=$(shell pwd)/src/client.ts

download-binary:
	mkdir -p bin
	echo "Downloading webrpc testing binary"; \
	curl -L -o ./bin/webrpc-test https://github.com/webrpc/webrpc/releases/download/$(VERSION)/webrpc-test.linux-amd64; \
	echo "Successfully downloaded"; \
	chmod +x ./bin/webrpc-test

test: download-binary
	./bin/webrpc-test -server -port $(PORT) -timeout=10s & \
	until nc -z localhost $(PORT); do sleep 0.2; done; \
	PORT=$(PORT) ./node_modules/.bin/vitest run --reporter verbose --dir tests

