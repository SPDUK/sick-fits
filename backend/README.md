Create a file called variables.env and fill in this info:

```
FRONTEND_URL="http://localhost:7777"
PRISMA_ENDPOINT="link to prisma url"
PRISMA_SECRET="prisma secret"
APP_SECRET="app secret for jwt"
STRIPE_SECRET="stripe secret"
PORT=4444
```

#### prisma

`prisma.yml` -> setup file for prisma
`datamodel.graphql` -> for prisma backend
`prisma.graphql` -> generated based on `datamodel.graphql` and has access to everything

#### graphql-yoga

`schema.graphql` -> public facing API
