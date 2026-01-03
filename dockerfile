# use the official Bun image
FROM oven/bun:1 as base
WORKDIR /usr/src/app

# 1. COPY ONLY package.json (Removed bun.lockb)
COPY package.json ./

# 2. RUN INSTALL WITHOUT LOCKFILE (Removed --frozen-lockfile)
RUN bun install

# generate prisma client
COPY prisma ./prisma
RUN bunx prisma generate

# copy source code
COPY . .

# expose port 3000
EXPOSE 3000

# run the app
CMD ["bun", "src/index.ts"]