FROM mcr.microsoft.com/playwright:v1.58.2-noble

WORKDIR /work

COPY docker/run-playwright.sh /usr/local/bin/run-playwright

RUN chmod +x /usr/local/bin/run-playwright

ENTRYPOINT ["/usr/local/bin/run-playwright"]
