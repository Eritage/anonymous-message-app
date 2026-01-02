# use the official Bun image
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# install dependencies
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# generate prisma client
COPY prisma ./prisma
RUN bunx prisma generate

# copy source code
COPY . .

# expose port 3000
EXPOSE 3000

# run the app
CMD ["bun", "src/index.ts"]