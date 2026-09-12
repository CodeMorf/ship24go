# Ship24Go API Docs — stable baseline

- Public interactive docs: https://ship24go.com/docs
- OpenAPI: https://ship24go.com/openapi.json
- Panel embed: https://ship24go.com/panel/api-docs (iframe /docs?embed=1)
- PDF: /api/docs/pdf?lang=en|es|it
- OpenAI tools: /api/docs/openai-tools.json

Rules:
1. Never document wholesale purchase channels (genei, parcelabc, spedirepro, …).
2. Customer-facing brand field is `carrierName` (FedEx, UPS, DHL, Correos, BRT, InPost…).
3. OpenAPI `info.description` must use real newlines (openApiDescription()).
4. Swagger embed mode hides the top bar (`?embed=1`).

Last stabilized: automated stabilize.sh
