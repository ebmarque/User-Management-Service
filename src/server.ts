import Fastify from "fastify";
import { PrismaClient } from "../generated/prisma";
const prisma = new PrismaClient();
const fastify = Fastify({
	logger : true
})
import userRoutes from "./routes/userRoutes";
fastify.register(userRoutes, {
	prefix: 'api/user'
})

async function main() {
	try {
		fastify.listen({
			port : 3000,
			host : '0.0.0.0'
		})
	} catch (err) {
		fastify.log.error("Could not initiate server...", err);
	}
}

main();

export default prisma;