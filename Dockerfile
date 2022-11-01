FROM node:16

WORKDIR /app

COPY . .

# Init database
RUN bash -c "echo \"DATABASE_URL=postgresql://arcio:password123@postgres:5432/arcio-dev?schema=public&unix_socket=/var/run/postgresql/s.PGSQL.5432\" > .env"
RUN bash -c "echo \"WEBHOOK_URL=https://discord.com/api/webhooks/996400124056055808/YnCC0Kt38H5EPsiUQSUUfpIUs8Uw3ud-BgP2_AshTLmQu8isgtTC64nAeQpIEmF0h6Q6\" >> .env"
RUN chmod u+x /app/init_database.sh
ENTRYPOINT ["/app/init_database.sh"]
