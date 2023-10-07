FROM node:latest

WORKDIR /home/app

ENV DATABASE_URL="postgresql://postgres:academy@localhost:5432/postgres?schema=public"
ENV PORT=8000

COPY . .

RUN npm i
# RUN npx prisma migrate
RUN npx tsc

CMD ["node","dist/index.js"]