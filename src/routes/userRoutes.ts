import { FastifyInstance } from "fastify";
const userController = require('../controllers/userController');

export default async function userRoutes(fastify: FastifyInstance) {
	// POST
	fastify.post('/', userController.createUser);
	
	// GET
	fastify.get('/', userController.getAll);
	fastify.get('/:id', userController.getById);

	// PUT

	// DELETE
	fastify.delete('/:id', userController.deleteUser)
}