FROM node:20-bookworm-slim AS web-build

WORKDIR /app/apps/web

COPY apps/web/package.json apps/web/package-lock.json ./
RUN npm ci

ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

COPY apps/web ./
RUN npm run build


FROM node:20-bookworm-slim AS runtime

RUN apt-get update \
  && apt-get install -y --no-install-recommends python3 python3-venv python3-pip \
  && rm -rf /var/lib/apt/lists/*

WORKDIR /app/apps/service
COPY apps/service/requirements.txt ./
RUN python3 -m venv /opt/venv \
  && /opt/venv/bin/pip install --no-cache-dir -r requirements.txt

COPY apps/service ./

WORKDIR /app/apps/web
COPY --from=web-build /app/apps/web ./

ENV NODE_ENV=production
ENV PORT=3000
ENV ML_SERVICE_URL=http://127.0.0.1:8000

EXPOSE 3000 8000

CMD ["sh", "-lc", "cd /app/apps/service && /opt/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000 & cd /app/apps/web && node node_modules/next/dist/bin/next start -p 3000"]

